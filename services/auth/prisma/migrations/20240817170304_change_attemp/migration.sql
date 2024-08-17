/*
  Warnings:

  - You are about to drop the column `attemp` on the `LoginHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LoginHistory" DROP COLUMN "attemp",
ADD COLUMN     "attempt" "LoginAttempt" NOT NULL DEFAULT 'SUCCESS';
