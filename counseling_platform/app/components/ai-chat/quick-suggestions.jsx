"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickSuggestions = void 0;
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const suggestions = [
    {
        icon: lucide_react_1.MessageSquare,
        text: "The child seems withdrawn today, what should I do?",
        category: "Engagement"
    },
    {
        icon: lucide_react_1.AlertTriangle,
        text: "How do I approach their fear of academic failure?",
        category: "Academic"
    },
    {
        icon: lucide_react_1.Heart,
        text: "The child is not opening up, what techniques should I try?",
        category: "Connection"
    },
    {
        icon: lucide_react_1.BookOpen,
        text: "What cultural story might help with their situation?",
        category: "Cultural"
    },
    {
        icon: lucide_react_1.Lightbulb,
        text: "How can I help them build confidence?",
        category: "Development"
    }
];
function QuickSuggestions({ onSelectSuggestion, disabled = false }) {
    return (<div className="p-3 border-b border-gray-200 bg-gray-50">
      <h4 className="text-xs font-medium text-gray-600 mb-2">Quick Questions</h4>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (<button_1.Button key={index} variant="ghost" size="sm" onClick={() => onSelectSuggestion(suggestion.text)} disabled={disabled} className="w-full justify-start text-left h-auto p-2 text-xs bg-white hover:bg-blue-50 border border-gray-200">
            <div className="flex items-start gap-2">
              <suggestion.icon className="h-3 w-3 text-gray-500 mt-0.5 shrink-0"/>
              <div className="flex-1">
                <div className="text-gray-700">{suggestion.text}</div>
                <badge_1.Badge variant="secondary" className="text-xs mt-1">
                  {suggestion.category}
                </badge_1.Badge>
              </div>
            </div>
          </button_1.Button>))}
      </div>
    </div>);
}
exports.QuickSuggestions = QuickSuggestions;
