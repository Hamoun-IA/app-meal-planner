/*
  Warnings:

  - Added the required column `quantity` to the `shopping_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `shopping_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `shopping_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shopping_items" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
