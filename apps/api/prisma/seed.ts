import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Full system access' },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: { name: 'manager', description: 'Team management' },
  });

  const memberRole = await prisma.role.upsert({
    where: { name: 'member' },
    update: {},
    create: { name: 'member', description: 'Standard user' },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: { name: 'viewer', description: 'Read-only access' },
  });

  const permissionNames = [
    'view_users', 'manage_users', 'delete_users',
    'create_task', 'edit_task', 'assign_task', 'view_all_tasks', 'delete_task',
    'manage_teams', 'manage_projects',
    'submit_requests', 'manage_requests', 'approve_requests',
    'manage_incidents', 'assign_incidents', 'resolve_incidents',
    'view_audit_log', 'manage_settings',
  ];

  for (const perm of permissionNames) {
    await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm },
    });
  }

  await prisma.$executeRaw`DELETE FROM "_RoleToPermission"`;
  await prisma.$executeRaw`INSERT INTO "_RoleToPermission" ("A", "B") SELECT r.id, p.id FROM "Role" r, "Permission" p WHERE r.name = 'admin'`;
  await prisma.$executeRaw`INSERT INTO "_RoleToPermission" ("A", "B") SELECT r.id, p.id FROM "Role" r, "Permission" p WHERE r.name = 'manager' AND p.name IN ('create_task','edit_task','assign_task','view_all_tasks','view_users','manage_teams','manage_projects','submit_requests','manage_requests','approve_requests','manage_incidents','assign_incidents','view_audit_log')`;
  await prisma.$executeRaw`INSERT INTO "_RoleToPermission" ("A", "B") SELECT r.id, p.id FROM "Role" r, "Permission" p WHERE r.name = 'member' AND p.name IN ('create_task','edit_task','view_all_tasks','submit_requests','manage_incidents','assign_incidents')`;
  await prisma.$executeRaw`INSERT INTO "_RoleToPermission" ("A", "B") SELECT r.id, p.id FROM "Role" r, "Permission" p WHERE r.name = 'viewer' AND p.name IN ('view_all_tasks','view_users')`;

  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: { name: 'Acme Corp', slug: 'acme-corp' },
  });

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@workflowos.id' },
    update: { workspaceId: workspace.id, roleId: adminRole.id },
    create: {
      email: 'admin@workflowos.id',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      workspaceId: workspace.id,
      roleId: adminRole.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@workflowos.id' },
    update: { workspaceId: workspace.id, roleId: managerRole.id },
    create: {
      email: 'manager@workflowos.id',
      username: 'manager',
      password: hashedPassword,
      firstName: 'Manager',
      lastName: 'User',
      workspaceId: workspace.id,
      roleId: managerRole.id,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'user@workflowos.id' },
    update: { workspaceId: workspace.id, roleId: memberRole.id },
    create: {
      email: 'user@workflowos.id',
      username: 'member',
      password: hashedPassword,
      firstName: 'Team',
      lastName: 'Member',
      workspaceId: workspace.id,
      roleId: memberRole.id,
    },
  });

  // Multi-workspace membership (user belongs to both workspaces)
  await prisma.userWorkspace.upsert({
    where: { userId_workspaceId: { userId: admin.id, workspaceId: workspace.id } },
    update: { roleId: adminRole.id, current: true },
    create: {
      userId: admin.id,
      workspaceId: workspace.id,
      roleId: adminRole.id,
      current: true,
    },
  });
  await prisma.userWorkspace.upsert({
    where: { userId_workspaceId: { userId: manager.id, workspaceId: workspace.id } },
    update: { roleId: managerRole.id, current: true },
    create: {
      userId: manager.id,
      workspaceId: workspace.id,
      roleId: managerRole.id,
      current: true,
    },
  });
  await prisma.userWorkspace.upsert({
    where: { userId_workspaceId: { userId: member.id, workspaceId: workspace.id } },
    update: { roleId: memberRole.id, current: true },
    create: {
      userId: member.id,
      workspaceId: workspace.id,
      roleId: memberRole.id,
      current: true,
    },
  });

  // Second workspace for isolation testing
  const workspace2 = await prisma.workspace.upsert({
    where: { slug: 'beta-corp' },
    update: {},
    create: { name: 'Beta Corp', slug: 'beta-corp' },
  });

  await prisma.userWorkspace.upsert({
    where: { userId_workspaceId: { userId: member.id, workspaceId: workspace2.id } },
    update: { roleId: memberRole.id, current: false },
    create: {
      userId: member.id,
      workspaceId: workspace2.id,
      roleId: memberRole.id,
      current: false,
    },
  });

  const team2 = await prisma.team.upsert({
    where: { workspaceId_name: { workspaceId: workspace2.id, name: 'Beta Team' } },
    update: {},
    create: {
      name: 'Beta Team',
      description: 'Isolated workspace team for testing',
      workspaceId: workspace2.id,
    },
  });

  const team = await prisma.team.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: 'Engineering' } },
    update: {},
    create: {
      name: 'Engineering',
      description: 'Product Engineering Team',
      workspaceId: workspace.id,
    },
  });

  await prisma.$executeRaw`DELETE FROM "TeamMember" WHERE "teamId" = ${team.id}`;
  await prisma.teamMember.createMany({
    data: [
      { userId: admin.id, teamId: team.id, role: 'admin' },
      { userId: manager.id, teamId: team.id, role: 'lead' },
      { userId: member.id, teamId: team.id, role: 'member' },
    ],
    skipDuplicates: true,
  });

  const project = await prisma.project.upsert({
    where: { teamId_name: { teamId: team.id, name: 'WorkFlowOS Phase 2' } },
    update: {},
    create: {
      name: 'WorkFlowOS Phase 2',
      description: 'Complete frontend integration and workflow engine',
      teamId: team.id,
      workspaceId: workspace.id,
    },
  });

  await prisma.$executeRaw`DELETE FROM "Task"`
  await prisma.$executeRaw`DELETE FROM "TaskAssignment"`

  const task1 = await prisma.task.create({
    data: {
      title: 'Setup Next.js CI/CD pipeline',
      description: 'Configure GitHub Actions for builds and tests',
      projectId: project.id,
      creatorId: admin.id,
      priority: 'high',
      status: 'done',
    },
  });
  await prisma.taskAssignment.create({ data: { taskId: task1.id, userId: member.id } });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement SLA enforcement engine',
      description: 'Track response/resolution times and escalate on breach',
      projectId: project.id,
      creatorId: admin.id,
      priority: 'critical',
      status: 'in_progress',
    },
  });
  await prisma.taskAssignment.create({ data: { taskId: task2.id, userId: member.id } });

  const task3 = await prisma.task.create({
    data: {
      title: 'Add real-time notification support',
      description: 'Implement SSE for live notifications',
      projectId: project.id,
      creatorId: manager.id,
      priority: 'high',
      status: 'todo',
    },
  });
  await prisma.taskAssignment.create({ data: { taskId: task3.id, userId: member.id } });

  await prisma.$executeRaw`DELETE FROM "Request"`
  await prisma.$executeRaw`DELETE FROM "Approval"`

  const request1 = await prisma.request.create({
    data: {
      title: 'Laptop Request - MacBook Pro',
      description: 'Need new MacBook Pro for development',
      type: 'laptop',
      status: 'submitted',
      priority: 'medium',
      requesterId: member.id,
    },
  });

  await prisma.approval.create({
    data: {
      requestId: request1.id,
      approverId: manager.id,
      status: 'pending',
    },
  });

  await prisma.$executeRaw`DELETE FROM "Incident"`

  const incident1 = await prisma.incident.create({
    data: {
      title: 'Database connection timeout',
      description: 'Production database connection timing out under load',
      severity: 'critical',
      priority: 'critical',
      status: 'investigating',
      affectedService: 'PostgreSQL Database',
      assigneeId: member.id,
    },
  });

  await prisma.$executeRaw`DELETE FROM "SLA"`
  await prisma.sLA.create({
    data: { name: 'Critical', responseTarget: 15, resolutionTarget: 120, warningThreshold: 60 },
  });
  await prisma.sLA.create({
    data: { name: 'High', responseTarget: 30, resolutionTarget: 240, warningThreshold: 120 },
  });
  await prisma.sLA.create({
    data: { name: 'Medium', responseTarget: 60, resolutionTarget: 480, warningThreshold: 240 },
  });
  await prisma.sLA.create({
    data: { name: 'Low', responseTarget: 120, resolutionTarget: 960, warningThreshold: 480 },
  });

  await prisma.$executeRaw`DELETE FROM "Notification"`
  await prisma.notification.createMany({
    data: [
      { userId: member.id, title: 'Task assigned', message: 'Anda ditugaskan untuk "Setup Next.js CI/CD pipeline"', type: 'task_assigned' },
      { userId: manager.id, title: 'Approval request', message: 'Request "Laptop Request" perlu persetujuan', type: 'approval_request' },
      { userId: member.id, title: 'Incident escalated', message: 'Incident "Database connection timeout" sedang ditinjau', type: 'incident_escalation' },
    ],
    skipDuplicates: true,
  });

  await prisma.$executeRaw`DELETE FROM "AuditLog"`
  await prisma.auditLog.create({
    data: { action: 'seed', entity: 'workspace', entityId: workspace.id, actorId: admin.id, summary: 'Database seeded with demo data' },
  });

  console.log('Seed completed successfully');
  console.log(`- User: ${admin.email} (admin)`);
  console.log(`- User: ${manager.email} (manager)`);
  console.log(`- User: ${member.email} (member)`);
  console.log(`- Password: Admin123! (all demo accounts)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
