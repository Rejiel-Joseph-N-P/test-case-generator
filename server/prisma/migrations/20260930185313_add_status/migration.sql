-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('DRAFT', 'SAVED');

-- AlterTable
ALTER TABLE "Requirement" ADD COLUMN     "status" "RequirementStatus" NOT NULL DEFAULT 'DRAFT';
