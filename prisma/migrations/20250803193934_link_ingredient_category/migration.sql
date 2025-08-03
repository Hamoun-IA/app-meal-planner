/*
  Warnings:

  - You are about to drop the column `category` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `shopping_items` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `shopping_items` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `shopping_items` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `shopping_items` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `shopping_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ingredients" DROP COLUMN "category",
ADD COLUMN     "categoryId" UUID;

-- AlterTable
ALTER TABLE "shopping_items" DROP COLUMN "completed",
DROP COLUMN "createdAt",
DROP COLUMN "quantity",
DROP COLUMN "unit",
DROP COLUMN "updatedAt";

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
