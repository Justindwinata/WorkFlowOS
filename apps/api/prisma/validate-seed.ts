import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Validating database state...\n');

  const userCount = await prisma.user.count();
  const roleCount = await prisma.role.count();
  const workspaceCount = await prisma.workspace.count();
  const teamCount = await prisma.team.count();
  const projectCount = await prisma.project.count();
  const taskCount = await prisma.task.count();
  const requestCount = await prisma.request.count();
  const incidentCount = await prisma.incident.count();
  const slaCount = await prisma.sLA.count();
  const permissionCount = await prisma.permission.count();

  console.log('Database Validation Results:');
  console.log(`  Users:        ${userCount}`);
  console.log(`  Roles:        ${roleCount}`);
  console.log(`  Permissions:  ${permissionCount}`);
  console.log(`  Workspaces:   ${workspaceCount}`);
  console.log(`  Teams:        ${teamCount}`);
  console.log(`  Projects:     ${projectCount}`);
  console.log(`  Tasks:        ${taskCount}`);
  console.log(`  Requests:     ${requestCount}`);
  console.log(`  Incidents:    ${incidentCount}`);
  console.log(`  SLA definitions: ${slaCount}`);

  const requiredRoles = ['admin', 'manager', 'member', 'viewer'];
  const existingRoles = await prisma.role.findMany({ select: { name: true } });
  const missingRoles = requiredRoles.filter(r => !existingRoles.some(er => er.name === r));

  const requiredSlas = ['Critical', 'High', 'Medium', 'Low'];
  const existingSlas = await prisma.sLA.findMany({ select: { name: true } });
  const missingSlas = requiredSlas.filter(s => !existingSlas.some(es => es.name === s));

  if (missingRoles.length > 0) {
    console.log(`\nWARNING: Missing roles: ${missingRoles.join(', ')}`);
    console.log('  Run: npm run seed');
  }

  if (missingSlas.length > 0) {
    console.log(`\nWARNING: Missing SLA definitions: ${missingSlas.join(', ')}`);
    console.log('  Run: npm run seed');
  }

  if (userCount === 0) {
    console.log('\nWARNING: No users found. Run: npm run seed');
  }

  console.log('\nValidation complete.');

  if (missingRoles.length > 0 || missingSlas.length > 0 || userCount === 0) {
    console.log('\nRecommendation: Run `npm run seed:drop` to reset and seed.');
  } else {
    console.log('\nDatabase is ready for development.');
  }
}

main()
  .catch((e) => {
    console.error('Validation error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
