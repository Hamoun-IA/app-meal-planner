"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Produit {
  id: number
  nom: string
  categorie: string
  typeQuantite: string
  createdAt: string
  updatedAt: string
}

interface ProduitsContextType {
  produits: Produit[]
  addProduit: (produit: Omit<Produit, "id" | "createdAt" | "updatedAt">) => void
  updateProduit: (id: number, produit: Partial<Produit>) => void
  deleteProduit: (id: number) => void
  getProduitById: (id: number) => Produit | undefined
  isLoading: boolean
}

const ProduitsContext = createContext<ProduitsContextType | undefined>(undefined)

const defaultProduits: Produit[] = [
  {
    id: 1,
    nom: "Lait",
    categorie: "Produits laitiers",
    typeQuantite: "Litre",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: 2,
    nom: "Pain",
    categorie: "Boulangerie",
    typeQuantite: "Unité",
    createdAt: "2024-01-11T09:30:00Z",
    updatedAt: "2024-01-11T09:30:00Z",
  },
  {
    id: 3,
    nom: "Pommes",
    categorie: "Fruits & Légumes",
    typeQuantite: "Kilogramme",
    createdAt: "2024-01-12T14:15:00Z",
    updatedAt: "2024-01-12T14:15:00Z",
  },
  {
    id: 4,
    nom: "Chocolat",
    categorie: "Épicerie sucrée",
    typeQuantite: "Gramme",
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-13T16:45:00Z",
  },
  {
    id: 5,
    nom: "Yaourts",
    categorie: "Produits laitiers",
    typeQuantite: "Unité",
    createdAt: "2024-01-14T11:20:00Z",
    updatedAt: "2024-01-14T11:20:00Z",
  },
  {
    id: 6,
    nom: "Saumon",
    categorie: "Viande & Poisson",
    typeQuantite: "Gramme",
    createdAt: "2024-01-15T13:10:00Z",
    updatedAt: "2024-01-15T13:10:00Z",
  },
]

export function ProduitsProvider({ children }: { children: ReactNode }) {
  const [produits, setProduits] = useState<Produit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Charger les produits depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedProduits = localStorage.getItem("babounette-produits")
      if (savedProduits) {
        const parsed = JSON.parse(savedProduits)
        setProduits(parsed)
      } else {
        // Première utilisation, utiliser les produits par défaut
        setProduits(defaultProduits)
        localStorage.setItem("babounette-produits", JSON.stringify(defaultProduits))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error)
      setProduits(defaultProduits)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sauvegarder les produits dans localStorage quand ils changent
  useEffect(() => {
    if (!isLoading && produits.length > 0) {
      localStorage.setItem("babounette-produits", JSON.stringify(produits))
    }
  }, [produits, isLoading])

  const addProduit = (newProduit: Omit<Produit, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()
    const id = Math.max(...produits.map((p) => p.id), 0) + 1

    const produit: Produit = {
      ...newProduit,
      id,
      createdAt: now,
      updatedAt: now,
    }

    setProduits((prev) => [...prev, produit])
  }

  const updateProduit = (id: number, updates: Partial<Produit>) => {
    setProduits((prev) =>
      prev.map((produit) =>
        produit.id === id ? { ...produit, ...updates, updatedAt: new Date().toISOString() } : produit,
      ),
    )
  }

  const deleteProduit = (id: number) => {
    setProduits((prev) => prev.filter((produit) => produit.id !== id))
  }

  const getProduitById = (id: number) => {
    return produits.find((produit) => produit.id === id)
  }

  return (
    <ProduitsContext.Provider
      value={{
        produits,
        addProduit,
        updateProduit,
        deleteProduit,
        getProduitById,
        isLoading,
      }}
    >
      {children}
    </ProduitsContext.Provider>
  )
}

export function useProduits() {
  const context = useContext(ProduitsContext)
  if (context === undefined) {
    throw new Error("useProduits must be used within a ProduitsProvider")
  }
  return context
}
