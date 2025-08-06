"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AutocompleteOption {
  id: string
  label: string
  description?: string
}

interface AutocompleteProps {
  options: AutocompleteOption[]
  value: string
  onValueChange: (value: string) => void
  onSelect: (option: AutocompleteOption) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  maxSuggestions?: number
}

export function Autocomplete({
  options,
  value,
  onValueChange,
  onSelect,
  placeholder = "Rechercher...",
  disabled = false,
  className,
  maxSuggestions = 8,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filtrer les options basées sur la valeur de recherche
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(value.toLowerCase()) ||
    option.description?.toLowerCase().includes(value.toLowerCase())
  ).slice(0, maxSuggestions)

  // Gérer la sélection avec clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Gérer la sélection d'une option
  const handleSelect = (option: AutocompleteOption) => {
    onSelect(option)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Réinitialiser l'index quand les options changent
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [filteredOptions])

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pl-10 pr-10", className)}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onValueChange("")
                setIsOpen(false)
              }}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                highlightedIndex === index && "bg-pink-50 border-l-2 border-pink-500",
                index === 0 && "rounded-t-lg",
                index === filteredOptions.length - 1 && "rounded-b-lg"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-500">{option.description}</div>
                  )}
                </div>
                {highlightedIndex === index && (
                  <Check className="w-4 h-4 text-pink-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Aucun résultat */}
      {isOpen && value && filteredOptions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            Aucun résultat trouvé
          </div>
        </div>
      )}
    </div>
  )
} 