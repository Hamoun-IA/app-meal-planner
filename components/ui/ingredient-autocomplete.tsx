"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, X } from "lucide-react";
import { useIngredientSuggestions, IngredientSuggestion } from "@/hooks/use-ingredient-suggestions";

interface IngredientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectWithCategory?: (name: string, category: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const IngredientAutocomplete: React.FC<IngredientAutocompleteProps> = ({
  value,
  onChange,
  onSelectWithCategory,
  placeholder = "Rechercher un ingrédient...",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { suggestions, suggestionsWithCategories, suggestionsByCategory, popularSuggestions, allCategories } = useIngredientSuggestions(searchTerm);

  // Gérer la fermeture du dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gérer les touches clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleInputChange = (newValue: string) => {
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
    setSelectedCategory(null);
  };

  const handleSuggestionClick = (suggestion: string | IngredientSuggestion) => {
    if (typeof suggestion === 'string') {
      onChange(suggestion);
      setSearchTerm(suggestion);
    } else {
      onChange(suggestion.name);
      setSearchTerm(suggestion.name);
      // Si onSelectWithCategory est disponible, l'utiliser
      if (onSelectWithCategory) {
        onSelectWithCategory(suggestion.name, suggestion.category);
      }
    }
    setIsOpen(false);
    setSelectedCategory(null);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const clearInput = () => {
    onChange("");
    setSearchTerm("");
    setIsOpen(false);
    setSelectedCategory(null);
    inputRef.current?.focus();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // Déterminer quelles suggestions afficher
  const getDisplaySuggestions = () => {
    if (selectedCategory && suggestionsByCategory[selectedCategory]) {
      return suggestionsByCategory[selectedCategory];
    }
    
    if (searchTerm.trim() === "") {
      return popularSuggestions;
    }
    
    return suggestionsWithCategories;
  };

  const displaySuggestions = getDisplaySuggestions();

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Dropdown avec suggestions */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden"
        >
          {/* Barre de recherche dans le dropdown */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="max-h-80">
            {/* Catégories */}
            {searchTerm.trim() === "" && (
              <div className="p-3 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-700 mb-2">Catégories populaires</div>
                <div className="flex flex-wrap gap-1">
                  {allCategories.slice(0, 6).map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions par catégorie */}
            {selectedCategory && suggestionsByCategory[selectedCategory] && (
              <div className="p-3">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {selectedCategory} ({suggestionsByCategory[selectedCategory].length})
                </div>
                <div className="space-y-1">
                  {suggestionsByCategory[selectedCategory].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions générales */}
            {!selectedCategory && (
              <div className="p-3">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {searchTerm.trim() === "" ? "Ingrédients populaires" : "Suggestions"}
                </div>
                <div className="space-y-1">
                  {displaySuggestions.length > 0 ? (
                    displaySuggestions.map((suggestion) => (
                      <button
                        key={typeof suggestion === 'string' ? suggestion : `${suggestion.name}-${suggestion.category}`}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex justify-between items-center">
                          <span>{typeof suggestion === 'string' ? suggestion : suggestion.name}</span>
                          {typeof suggestion !== 'string' && (
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Aucune suggestion trouvée
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Toutes les catégories */}
            {searchTerm.trim() === "" && !selectedCategory && (
              <div className="p-3 border-t border-gray-100">
                <div className="text-sm font-medium text-gray-700 mb-2">Toutes les catégories</div>
                <div className="grid grid-cols-2 gap-1">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className="text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}; 