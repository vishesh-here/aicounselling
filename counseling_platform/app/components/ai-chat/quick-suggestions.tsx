
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, AlertTriangle, Lightbulb, BookOpen, Heart } from "lucide-react";

interface QuickSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
  disabled?: boolean;
}

const suggestions = [
  {
    icon: MessageSquare,
    text: "The child seems withdrawn today, what should I do?",
    category: "Engagement"
  },
  {
    icon: AlertTriangle,
    text: "How do I approach their fear of academic failure?",
    category: "Academic"
  },
  {
    icon: Heart,
    text: "The child is not opening up, what techniques should I try?",
    category: "Connection"
  },
  {
    icon: BookOpen,
    text: "What cultural story might help with their situation?",
    category: "Cultural"
  },
  {
    icon: Lightbulb,
    text: "How can I help them build confidence?",
    category: "Development"
  }
];

export function QuickSuggestions({ onSelectSuggestion, disabled = false }: QuickSuggestionsProps) {
  return (
    <div className="p-3 border-b border-gray-200 bg-gray-50">
      <h4 className="text-xs font-medium text-gray-600 mb-2">Quick Questions</h4>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => onSelectSuggestion(suggestion.text)}
            disabled={disabled}
            className="w-full justify-start text-left h-auto p-2 text-xs bg-white hover:bg-blue-50 border border-gray-200"
          >
            <div className="flex items-start gap-2">
              <suggestion.icon className="h-3 w-3 text-gray-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-gray-700">{suggestion.text}</div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {suggestion.category}
                </Badge>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
