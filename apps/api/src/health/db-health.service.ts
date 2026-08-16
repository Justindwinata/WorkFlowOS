import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DbHealthService {
  private readonly logger = new Logger(DbHealthService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Verify that critical foreign key relationships are intact.
   * Returns { healthy: boolean, issues: string[] }
   */
  async verifyIntegrity(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check for orphaned task assignments
    const orphanedAssignments = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT count(*) as count FROM "TaskAssignment" ta
      LEFT JOIN "Task" t ON ta."taskId" = t.id
      WHERE t.id IS NULL
    `;
    if (orphanedAssignments[0]?.count > 0) {
      issues.push(`Orphaned TaskAssignments: ${orphanedAssignments[0].count}`);
    }

    // Check for orphaned task comments
    const orphanedComments = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT count(*) as count FROM "TaskComment" tc
      LEFT JOIN "Task" t ON tc."taskId" = t.id
      WHERE t.id IS NULL
    `;
    if (orphanedComments[0]?.count > 0) {
      issues.push(`Orphaned TaskComments: ${orphanedComments[0].count}`);
    }

    // Check for users without role
    const usersWithoutRole = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT count(*) as count FROM "User" u
      LEFT JOIN "Role" r ON u."roleId" = r.id
      WHERE r.id IS NULL
    `;
    if (usersWithoutRole[0]?.count > 0) {
      issues.push(`Users without valid role: ${usersWithoutRole[0].count}`);
    }

    // Check for users without workspace
    const usersWithoutWorkspace = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT count(*) as count FROM "User" u
      LEFT JOIN "Workspace" w ON u."workspaceId" = w.id
      WHERE w.id IS NULL
    `;
    if (usersWithoutWorkspace[0]?.count > 0) {
      issues.push(`Users without valid workspace: ${usersWithoutWorkspace[0].count}`);
    }

    const healthy = issues.length === 0;
    if (!healthy) {
      this.logger.warn(`Integrity check found ${issues.length} issues`);
    }
    return { healthy, issues };
  }
}