
"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Clock } from "lucide-react";
import { format } from "date-fns";

interface ChatMessageProps {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  timestamp: Date;
  metadata?: {
    responseTime?: number;
    contextSources?: string[];
  };
}

export function ChatMessage({ role, content, timestamp, metadata }: ChatMessageProps) {
  const isUser = role === "USER";
  const isSystem = role === "SYSTEM";

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <>
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="bg-purple-100 text-purple-600">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "rounded-lg px-3 py-2 text-sm",
          isUser 
            ? "bg-blue-600 text-white" 
            : isSystem 
            ? "bg-gray-100 text-gray-700 border border-gray-200"
            : "bg-white text-gray-900 border border-gray-200 shadow-sm"
        )}>
          <div className="whitespace-pre-wrap">
            {content}
          </div>
        </div>

        {/* Metadata */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-gray-500",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(timestamp, "HH:mm")}
          </span>
          
          {metadata?.responseTime && !isUser && (
            <Badge variant="secondary" className="text-xs">
              {metadata.responseTime}ms
            </Badge>
          )}

          {metadata?.contextSources && !isUser && (
            <Badge variant="outline" className="text-xs">
              RAG Context
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
