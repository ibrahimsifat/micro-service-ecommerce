/*
  Warnings:

  - You are about to drop the column `inventory` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "inventory",
ADD COLUMN     "inventoryId" TEXT;
