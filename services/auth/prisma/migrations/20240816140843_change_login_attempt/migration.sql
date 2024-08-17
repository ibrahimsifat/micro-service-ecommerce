/*
  Warnings:

  - The `attemp` column on the `LoginHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LoginAttempt" AS ENUM ('SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "LoginHistory" DROP COLUMN "attemp",
ADD COLUMN     "attemp" "LoginAttempt" NOT NULL DEFAULT 'SUCCESS';

-- DropEnum
DROP TYPE "LoginAttemp";
