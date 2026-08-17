-- AddWorkspaceIdToIncident
-- Add workspaceId column to Incident for workspace isolation
ALTER TABLE "Incident" ADD COLUMN "workspaceId" TEXT NOT NULL DEFAULT 'default-workspace';
CREATE INDEX "Incident_workspaceId_idx" ON "Incident"("workspaceId");

-- Add workspaceId column to Request for workspace isolation
ALTER TABLE "Request" ADD COLUMN "workspaceId" TEXT NOT NULL DEFAULT 'default-workspace';
CREATE INDEX "Request_workspaceId_idx" ON "Request"("workspaceId");