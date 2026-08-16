import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SlaService } from '../sla/sla.service';
import dayjs from 'dayjs';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private slaService: SlaService,
  ) {}

  async getDashboard(userId: string, workspaceId: string) {
    const now = new Date();

    const myTasks = await this.prisma.task.findMany({
      where: {
        project: { workspaceId },
        OR: [
          { creatorId: userId },
          { assignments: { some: { userId } } },
        ],
      },
      include: { project: true, assignments: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const overdueTasks = myTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done' && t.status !== 'cancelled',
    );

    const openRequests = await this.prisma.request.findMany({
      where: { requesterId: userId, status: { in: ['draft', 'submitted', 'approval', 'in_progress'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const activeIncidents = await this.prisma.incident.findMany({
      where: {
        status: { in: ['open', 'investigating', 'escalated'] },
        OR: [
          { assigneeId: userId },
          { assigneeId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const pendingApprovals = await this.prisma.approval.findMany({
      where: { approverId: userId, status: 'pending' },
      include: { request: { include: { requester: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const teamMembers = await this.prisma.teamMember.findMany({
      where: { team: { workspaceId } },
      include: {
        user: { select: { id: true, username: true } },
        team: { select: { name: true } },
      },
      take: 20,
    });

    const teamWorkload = await Promise.all(
      teamMembers.map(async (member) => {
        const activeTasks = await this.prisma.task.count({
          where: {
            project: { team: { workspaceId } },
            status: { notIn: ['done', 'cancelled'] },
            assignments: { some: { userId: member.userId } },
          },
        });
        return {
          userId: member.userId,
          username: member.user.username,
          team: member.team.name,
          activeTasks,
        };
      }),
    );

    const recentActivity = await this.prisma.auditLog.findMany({
      where: { actor: { workspaceId } },
      include: { actor: { select: { username: true } } },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    const slaAtRisk: any[] = [];
    for (const incident of activeIncidents) {
      if (incident.severity) {
        const elapsedMinutes = dayjs().diff(dayjs(incident.createdAt), 'minute');
        const slaCheck = await this.slaService.checkBreach(
          incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1),
          elapsedMinutes,
        );
        if (slaCheck.warning || slaCheck.breached) {
          slaAtRisk.push({
            id: incident.id,
            title: incident.title,
            elapsedMinutes,
            warning: slaCheck.warning,
            breached: slaCheck.breached,
          });
        }
      }
    }

    return {
      stats: {
        myTasksCount: myTasks.length,
        overdueTasksCount: overdueTasks.length,
        openRequestsCount: openRequests.length,
        activeIncidentsCount: activeIncidents.length,
        pendingApprovalsCount: pendingApprovals.length,
        slaAtRiskCount: slaAtRisk.length,
      },
      myTasks,
      overdueTasks,
      openRequests,
      activeIncidents,
      pendingApprovals,
      teamWorkload,
      slaAtRisk,
      recentActivity,
    };
  }
}