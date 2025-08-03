import { NextRequest, NextResponse } from "next/server"
import { ingredientService } from "@/lib/services/ingredient-service"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const categoryId = searchParams.get("categoryId")

    let ingredients

    if (search) {
      ingredients = await ingredientService.searchByName(search)
    } else if (categoryId) {
      ingredients = await ingredientService.getByCategory(categoryId)
    } else {
      ingredients = await ingredientService.getAll()
    }

    return NextResponse.json({ 
      data: ingredients,
      status: 200 
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des ingrédients:", error)
    return NextResponse.json(
      { 
        error: "Impossible de récupérer les ingrédients",
        status: 500 
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ingredient = await ingredientService.create(body)
    
    return NextResponse.json({ 
      data: ingredient,
      status: 201 
    }, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de l'ingrédient:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Impossible de créer l'ingrédient",
        status: 400 
      },
      { status: 400 }
    )
  }
} 