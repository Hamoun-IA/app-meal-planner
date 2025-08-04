import { NextRequest, NextResponse } from 'next/server'
import { ImageService } from '@/lib/services/image-service'

const imageService = new ImageService()

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Upload et optimiser l'image
    const optimizedFile = await imageService.optimizeImage(file)
    const imageUrl = await imageService.uploadImage(optimizedFile)

    return NextResponse.json(
      { 
        data: { imageUrl },
        message: 'Image uploadée avec succès'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur upload image:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    )
  }
} 