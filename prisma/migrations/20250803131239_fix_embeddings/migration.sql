/*
  Warnings:

  - You are about to alter the column `embedding` on the `ingredients` table. The data in that column could be lost. The data in that column will be cast from `Unsupported("vector")` to `Text`.
  - You are about to alter the column `embedding` on the `recipes` table. The data in that column could be lost. The data in that column will be cast from `Unsupported("vector")` to `Text`.

*/
-- AlterTable
ALTER TABLE "ingredients" ALTER COLUMN "embedding" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "recipes" ALTER COLUMN "embedding" SET DATA TYPE TEXT;
