'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { apiService } from '@/lib/services/api-service'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageChange: (imageUrl: string) => void
  className?: string
}

export function ImageUpload({ currentImageUrl, onImageChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mettre à jour la prévisualisation quand currentImageUrl change
  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl)
    } else {
      setPreviewUrl(null)
    }
  }, [currentImageUrl])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validation côté client
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux. Taille maximum : 5MB.')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Créer une prévisualisation
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload vers le serveur
      const result = await apiService.uploadImage(file)
      onImageChange(result.imageUrl)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <Card className="p-4 border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Prévisualisation"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Cliquez pour sélectionner une image de votre recette
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleClickUpload}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Upload en cours...' : 'Sélectionner une image'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Formats acceptés : JPEG, PNG, WebP (max 5MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
      </Card>
    </div>
  )
} 