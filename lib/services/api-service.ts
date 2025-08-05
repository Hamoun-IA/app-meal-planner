// Service pour gérer les appels API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      return {
        data: response.ok ? data.data : undefined,
        error: response.ok ? undefined : data.error || 'Erreur inconnue',
        status: response.status,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erreur réseau',
        status: 500,
      }
    }
  }

  // Recettes
  async getRecettes(params?: {
    page?: number
    limit?: number
    dishType?: string
    difficulty?: string
    search?: string
  }): Promise<ApiResponse<{ recipes: any[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.dishType) searchParams.append('dishType', params.dishType)
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty)
    if (params?.search) searchParams.append('search', params.search)

    return this.request(`/recipes?${searchParams.toString()}`)
  }

  async getRecetteById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/recipes/${id}`)
  }

  async createRecette(data: any): Promise<ApiResponse<any>> {
    return this.request('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRecette(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteRecette(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/recipes/${id}`, {
      method: 'DELETE',
    })
  }

  async toggleLikeRecette(id: string): Promise<ApiResponse<any>> {
    return this.request(`/recipes/${id}/toggle-like`, {
      method: 'POST',
    })
  }

  async getFavorites(): Promise<ApiResponse<{ recipes: any[]; total: number }>> {
    return this.request('/recipes/favorites')
  }

  // Ingrédients
  async getIngredients(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse<{ ingredients: any[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)

    return this.request(`/ingredients?${searchParams.toString()}`)
  }

  async createIngredient(data: any): Promise<ApiResponse<any>> {
    return this.request('/ingredients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // IA
  async generateRecipe(prompt: string, preferences?: any[]): Promise<ApiResponse<any>> {
    return this.request('/ai/generate-recipe', {
      method: 'POST',
      body: JSON.stringify({ prompt, preferences }),
    })
  }

  async searchRag(query: string, k?: number, filters?: any): Promise<ApiResponse<any>> {
    return this.request('/ai/search-rag', {
      method: 'POST',
      body: JSON.stringify({ query, k, filters }),
    })
  }

  async planMeals(weekStart: string, budget?: number, timeConstraints?: any): Promise<ApiResponse<any>> {
    return this.request('/ai/plan-meals', {
      method: 'POST',
      body: JSON.stringify({ weekStart, budget, timeConstraints }),
    })
  }

  async chat(message: string, context?: any): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      return response.body
    } catch (error) {
      console.error('Erreur lors de l\'appel chat:', error)
      return null
    }
  }

  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur lors de l\'upload de l\'image')
    }

    const data = await response.json()
    return data.data
  }
}

export const apiService = new ApiService() 