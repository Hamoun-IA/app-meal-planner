"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ArrowLeft, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useState } from "react"
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple"

export default function CoursesPage() {
  const [newItem, setNewItem] = useState("")
  const [items, setItems] = useState([
    { id: 1, name: "Lait", completed: false, category: "Produits laitiers" },
    { id: 2, name: "Pain", completed: true, category: "Boulangerie" },
    { id: 3, name: "Pommes", completed: false, category: "Fruits & Légumes" },
    { id: 4, name: "Chocolat", completed: false, category: "Épicerie sucrée" },
    { id: 5, name: "Yaourts", completed: true, category: "Produits laitiers" },
  ])

  const { playBackSound } = useAppSoundsSimple()

  const handleBackClick = () => {
    console.log("Back button clicked!")
    playBackSound()
  }

  const addItem = () => {
    if (!newItem.trim()) return

    const item = {
      id: Date.now(),
      name: newItem,
      completed: false,
      category: "Divers",
    }

    setItems([...items, item])
    setNewItem("")
  }

  const toggleItem = (id: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const deleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const completedCount = items.filter((item) => item.completed).length
  const totalCount = items.length

  const categories = [...new Set(items.map((item) => item.category))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute top-20 left-20 w-12 h-12 bg-pink-200/30 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-rose-200/40 rounded-full blur-lg animate-float-medium delay-1000"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-400 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/20 active:scale-95 transition-transform duration-100"
              onMouseDown={handleBackClick}
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-white font-semibold text-xl">Liste de courses</h1>
                <p className="text-white/80 text-sm">
                  {completedCount}/{totalCount} articles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Add Item */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-fade-in-up">
          <div className="flex space-x-3">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Ajouter un article... 🛒"
              className="flex-1 rounded-full border-pink-200 focus:border-pink-400"
              onKeyPress={(e) => e.key === "Enter" && addItem()}
            />
            <Button
              onClick={addItem}
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm text-gray-500">{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-pink-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Shopping List by Category */}
        <div className="space-y-4">
          {categories.map((category, categoryIndex) => {
            const categoryItems = items.filter((item) => item.category === category)

            return (
              <div
                key={category}
                className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in-up"
                style={{ animationDelay: `${(categoryIndex + 2) * 0.1}s` }}
              >
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mr-2"></span>
                  {category}
                </h3>

                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        item.completed ? "bg-pink-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                      <span className={`flex-1 ${item.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
                        {item.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Ta liste est vide ! 🛒</p>
            <p className="text-gray-500">Ajoute tes premiers articles ci-dessus ✨</p>
          </div>
        )}
      </div>
    </div>
  )
}
