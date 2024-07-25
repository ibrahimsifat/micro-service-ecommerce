/*
  Warnings:

  - You are about to drop the column `quentiry` on the `Inventory` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "quentiry",
ADD COLUMN     "quantity" INTEGER NOT NULL;
