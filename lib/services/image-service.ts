import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export class ImageService {
  private uploadDir = 'public/uploads/recipes'
  private maxFileSize = 5 * 1024 * 1024 // 5MB
  private allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  async uploadImage(file: File): Promise<string> {
    // Vérifier le type de fichier
    if (!this.allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.')
    }

    // Vérifier la taille du fichier
    if (file.size > this.maxFileSize) {
      throw new Error('Fichier trop volumineux. Taille maximum : 5MB.')
    }

    // Créer le dossier d'upload s'il n'existe pas
    await this.ensureUploadDir()

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `recipe_${timestamp}_${randomId}.${extension}`
    const filepath = join(this.uploadDir, filename)

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Retourner l'URL relative pour la base de données
    return `/uploads/recipes/${filename}`
  }

  private async ensureUploadDir(): Promise<void> {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true })
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return

    try {
      const filepath = join('public', imageUrl)
      if (existsSync(filepath)) {
        await writeFile(filepath, '') // Vider le fichier
        // Note: Sur certains systèmes, il faudrait utiliser un autre module pour supprimer
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error)
    }
  }

  // Optimiser une image (redimensionner, compresser)
  async optimizeImage(file: File): Promise<File> {
    // Pour l'instant, on retourne le fichier tel quel
    // Plus tard, on pourrait ajouter une compression avec sharp ou canvas
    return file
  }
} 