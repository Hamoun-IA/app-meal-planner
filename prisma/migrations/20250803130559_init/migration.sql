-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('FACILE', 'MOYEN', 'DIFFICILE');

-- CreateEnum
CREATE TYPE "DishType" AS ENUM ('DESSERT', 'PLAT_PRINCIPAL', 'ACCOMPAGNEMENT', 'ENTREE');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('G', 'KG', 'ML', 'CL', 'L', 'C_A_C', 'C_A_S', 'PINCEE', 'POIGNEE', 'BOUQUET', 'GOUTTE', 'PIECE');

-- CreateEnum
CREATE TYPE "PreferenceType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('INGREDIENT', 'RECIPE');

-- CreateTable
CREATE TABLE "recipes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "prepTime" INTEGER,
    "cookTime" INTEGER,
    "difficulty" "Difficulty",
    "dishType" "DishType",
    "instructions" TEXT[],
    "tips" TEXT,
    "embedding" vector(768),

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "recipeId" UUID NOT NULL,
    "ingredientId" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "UnitType" NOT NULL,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("recipeId","ingredientId")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "units" "UnitType"[],
    "embedding" vector(768),

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "linkedItemId" UUID,
    "linkedItemType" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_items" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" UUID,

    CONSTRAINT "shopping_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_history" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "meal_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_preferences" (
    "id" UUID NOT NULL,
    "familyMember" TEXT NOT NULL,
    "type" "PreferenceType" NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "notes" TEXT,

    CONSTRAINT "family_preferences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_history" ADD CONSTRAINT "meal_history_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
