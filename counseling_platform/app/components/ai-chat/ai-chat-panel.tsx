
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { QuickSuggestions } from "./quick-suggestions";
import { 
  Bot, 
  Minimize2, 
  Maximize2, 
  X, 
  History, 
  Brain,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AiChatPanelProps {
  child_id: string;
  sessionId: string;
  childName: string;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  timestamp: Date;
  metadata?: {
    responseTime?: number;
    contextSources?: string[];
  };
}

export function AiChatPanel({ 
  child_id, 
  sessionId, 
  childName,
  isMinimized = false,
  onMinimize,
  onMaximize,
  onClose
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "SYSTEM",
        content: `Hello! I'm Dr. Priya Sharma, your AI counseling mentor. I'm here to provide expert guidance during your session with ${childName}. I have access to their complete profile, session history, and relevant resources. Feel free to ask me anything about counseling techniques, handling specific situations, or recommendations for this session.`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
    }
  }, [isInitialized, childName]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Hide suggestions after first user message
    if (showSuggestions) {
      setShowSuggestions(false);
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "USER",
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get Supabase access token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Supabase sessionData:', sessionData, 'Error:', sessionError);
      const accessToken = sessionData?.session?.access_token;
      console.log('Supabase access token for chat:', accessToken);
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          message: messageContent,
          child_id,
          sessionId,
          conversationId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      // Update conversation ID if this is the first message
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ASSISTANT",
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "SYSTEM",
        content: "Sorry, I encountered an error. Please try your question again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatHistory = async () => {
    // TODO: Implement loading previous chat history
    toast.info("Chat history loading feature coming soon!");
  };

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-60 shadow-lg border-purple-200 z-50">
        <CardHeader className="p-3 bg-purple-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">AI Mentor</span>
              <Badge variant="secondary" className="text-xs">
                {messages.filter(m => m.role === "USER").length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onMaximize}
                className="h-6 w-6 p-0 hover:bg-purple-100"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-purple-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-xs text-gray-600 mb-2">
            Click to expand AI guidance for {childName}'s session
          </p>
          <Button
            onClick={onMaximize}
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Open Chat
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed right-4 top-20 bottom-4 w-96 shadow-xl border-purple-200 z-40 flex flex-col">
      {/* Header */}
      <CardHeader className="p-4 bg-purple-50 border-b border-purple-200 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Bot className="h-5 w-5" />
            AI Counseling Mentor
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={loadChatHistory}
              className="h-7 w-7 p-0 hover:bg-purple-100"
              title="Chat History"
            >
              <History className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMinimize}
              className="h-7 w-7 p-0 hover:bg-purple-100"
              title="Minimize"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-purple-100"
              title="Close"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Session Info */}
        <div className="flex items-center gap-2 text-xs text-purple-700">
          <Brain className="h-3 w-3" />
          <span>Session with {childName}</span>
          <Badge variant="outline" className="text-xs">
            RAG Enabled
          </Badge>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        {/* Quick Suggestions */}
        {showSuggestions && (
          <QuickSuggestions 
            onSelectSuggestion={sendMessage}
            disabled={isLoading}
          />
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                metadata={message.metadata}
              />
            ))}
            
            {isLoading && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isLoading}
          placeholder="Ask for guidance about the session..."
        />
      </CardContent>

      {/* Status Bar */}
      <div className="p-2 bg-gray-50 border-t border-gray-200 shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>AI Mentor Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{messages.filter(m => m.role === "USER").length} questions asked</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
