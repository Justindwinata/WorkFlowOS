-- AlterTable
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "Team_deletedAt_idx" ON "Team"("deletedAt");

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "Task_deletedAt_idx" ON "Task"("deletedAt");

-- AlterTable
ALTER TABLE "Request" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "Request_deletedAt_idx" ON "Request"("deletedAt");

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "Incident_deletedAt_idx" ON "Incident"("deletedAt");
