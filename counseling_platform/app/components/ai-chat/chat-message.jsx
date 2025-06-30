"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessage = void 0;
const utils_1 = require("@/lib/utils");
const avatar_1 = require("@/components/ui/avatar");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
function ChatMessage({ role, content, timestamp, metadata }) {
    const isUser = role === "USER";
    const isSystem = role === "SYSTEM";
    return (<div className={(0, utils_1.cn)("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <avatar_1.Avatar className="h-8 w-8 shrink-0">
        {isUser ? (<>
            <avatar_1.AvatarFallback className="bg-blue-100 text-blue-600">
              <lucide_react_1.User className="h-4 w-4"/>
            </avatar_1.AvatarFallback>
          </>) : (<>
            <avatar_1.AvatarFallback className="bg-purple-100 text-purple-600">
              <lucide_react_1.Bot className="h-4 w-4"/>
            </avatar_1.AvatarFallback>
          </>)}
      </avatar_1.Avatar>

      {/* Message Content */}
      <div className={(0, utils_1.cn)("flex flex-col gap-1 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        {/* Message Bubble */}
        <div className={(0, utils_1.cn)("rounded-lg px-3 py-2 text-sm", isUser
            ? "bg-blue-600 text-white"
            : isSystem
                ? "bg-gray-100 text-gray-700 border border-gray-200"
                : "bg-white text-gray-900 border border-gray-200 shadow-sm")}>
          <div className="whitespace-pre-wrap">
            {content}
          </div>
        </div>

        {/* Metadata */}
        <div className={(0, utils_1.cn)("flex items-center gap-2 text-xs text-gray-500", isUser ? "flex-row-reverse" : "flex-row")}>
          <span className="flex items-center gap-1">
            <lucide_react_1.Clock className="h-3 w-3"/>
            {(0, date_fns_1.format)(timestamp, "HH:mm")}
          </span>
          
          {(metadata === null || metadata === void 0 ? void 0 : metadata.responseTime) && !isUser && (<badge_1.Badge variant="secondary" className="text-xs">
              {metadata.responseTime}ms
            </badge_1.Badge>)}

          {(metadata === null || metadata === void 0 ? void 0 : metadata.contextSources) && !isUser && (<badge_1.Badge variant="outline" className="text-xs">
              RAG Context
            </badge_1.Badge>)}
        </div>
      </div>
    </div>);
}
exports.ChatMessage = ChatMessage;
