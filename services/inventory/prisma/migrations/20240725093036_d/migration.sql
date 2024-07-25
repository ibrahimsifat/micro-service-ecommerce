/*
  Warnings:

  - You are about to drop the column `lastQuentity` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `newQuentity` on the `History` table. All the data in the column will be lost.
  - Added the required column `lastQuantity` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newQuantity` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "History" DROP COLUMN "lastQuentity",
DROP COLUMN "newQuentity",
ADD COLUMN     "lastQuantity" INTEGER NOT NULL,
ADD COLUMN     "newQuantity" INTEGER NOT NULL;
