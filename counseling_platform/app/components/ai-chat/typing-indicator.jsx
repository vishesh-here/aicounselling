"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypingIndicator = void 0;
const avatar_1 = require("@/components/ui/avatar");
const lucide_react_1 = require("lucide-react");
function TypingIndicator() {
    return (<div className="flex gap-3 mb-4">
      <avatar_1.Avatar className="h-8 w-8 shrink-0">
        <avatar_1.AvatarFallback className="bg-purple-100 text-purple-600">
          <lucide_react_1.Bot className="h-4 w-4"/>
        </avatar_1.AvatarFallback>
      </avatar_1.Avatar>
      
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>);
}
exports.TypingIndicator = TypingIndicator;
