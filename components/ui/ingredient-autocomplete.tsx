"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, TrendingUp, Clock } from "lucide-react";
import { useIngredientSuggestions, IngredientSuggestion } from "@/hooks/use-ingredient-suggestions";

interface IngredientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: IngredientSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const IngredientAutocomplete: React.FC<IngredientAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Nom de l'ingrédient...",
  className = "",
  disabled = false
}) => {
  const { suggestions, popularSuggestions, filterSuggestions, clearSuggestions } = useIngredientSuggestions();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchroniser la valeur externe avec l'état interne
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Gérer le clic en dehors pour fermer le dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        clearSuggestions();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.trim()) {
      filterSuggestions(newValue);
      setIsOpen(true);
    } else {
      clearSuggestions();
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (inputValue.trim()) {
      filterSuggestions(inputValue);
      setIsOpen(true);
    } else {
      // Afficher les suggestions populaires quand l'input est vide et focus
      setIsOpen(true);
    }
  };

  const handleSuggestionClick = (suggestion: IngredientSuggestion) => {
    setInputValue(suggestion.name);
    onChange(suggestion.name);
    setIsOpen(false);
    clearSuggestions();
    onSelect?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      clearSuggestions();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Dropdown des suggestions */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden"
        >
          <ScrollArea className="h-full">
            {/* Suggestions filtrées */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center justify-between group"
                  >
                    <span className="text-sm">{suggestion.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.frequency}x
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions populaires si pas de suggestions filtrées */}
            {suggestions.length === 0 && inputValue.trim() === "" && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Ingrédients populaires
                </div>
                {popularSuggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center justify-between group"
                  >
                    <span className="text-sm">{suggestion.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.frequency}x
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Message si aucune suggestion */}
            {suggestions.length === 0 && inputValue.trim() !== "" && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Aucun ingrédient trouvé
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}; 