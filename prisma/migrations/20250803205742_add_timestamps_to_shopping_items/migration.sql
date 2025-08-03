/*
  Warnings:

  - Added the required column `updatedAt` to the `shopping_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shopping_items" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
