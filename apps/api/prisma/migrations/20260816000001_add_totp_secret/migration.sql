-- Add totpSecret column for 2FA enrollment
ALTER TABLE "User" ADD COLUMN "totpSecret" TEXT;