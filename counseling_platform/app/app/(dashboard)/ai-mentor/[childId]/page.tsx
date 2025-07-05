
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/ai-chat/chat-message";
import { TypingIndicator } from "@/components/ai-chat/typing-indicator";
import { ChatInput } from "@/components/ai-chat/chat-input";
import { QuickSuggestions } from "@/components/ai-chat/quick-suggestions";
import { 
  Bot, 
  ArrowLeft, 
  History, 
  Brain,
  MessageCircle,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  Clock,
  Trash2,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatMessageType {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  timestamp: Date;
  metadata?: {
    responseTime?: number;
    contextSources?: string[];
  };
}

interface ConversationHistory {
  id: string;
  sessionId?: string;
  conversationName?: string;
  createdAt: Date;
  messages: ChatMessageType[];
  isActive: boolean;
}

export default function AiMentorPage() {
  const params = useParams();
  const router = useRouter();
  const child_id = params.child_id as string;
  
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentMessages, setCurrentMessages] = useState<ChatMessageType[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load child data and conversation history
  useEffect(() => {
    loadChildData();
    loadConversationHistory();
  }, [child_id]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChildData = async () => {
    try {
      const response = await fetch(`/api/children/${child_id}`);
      if (response.ok) {
        const data = await response.json();
        setChild(data.child);
      } else {
        toast.error("Failed to load child data");
        router.back();
      }
    } catch (error) {
      console.error("Error loading child data:", error);
      toast.error("Failed to load child data");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(`/api/ai/conversations/history/${child_id}`);
      if (response.ok) {
        const data = await response.json();
        setConversationHistory(data.conversations || []);
        
        // Start a new conversation automatically if no current conversation
        if (!currentConversationId) {
          await startNewConversation();
        }
      }
    } catch (error) {
      console.error("Error loading conversation history:", error);
      // Start a new conversation anyway
      await startNewConversation();
    }
  };

  const startNewConversation = async () => {
    try {
      // Initialize with welcome message
      const welcomeMessage: ChatMessageType = {
        id: "welcome-" + Date.now(),
        role: "SYSTEM",
        content: `Hello! I'm Dr. Priya Sharma, your AI counseling mentor. I'm here to provide expert guidance for your work with ${child?.name || 'this child'}. I have access to their complete profile, session history, and relevant resources. How can I assist you today?`,
        timestamp: new Date()
      };
      
      setCurrentMessages([welcomeMessage]);
      setCurrentConversationId(null);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Hide suggestions after first user message
    if (showSuggestions) {
      setShowSuggestions(false);
    }

    // Add user message immediately
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "USER",
      content: messageContent,
      timestamp: new Date()
    };

    setCurrentMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: messageContent,
          child_id,
          sessionId: null, // No specific session for dedicated AI mentor
          conversationId: currentConversationId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      // Update conversation ID if this is the first message
      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }

      // Add AI response
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "ASSISTANT",
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata
      };

      setCurrentMessages(prev => [...prev, aiMessage]);

      // Refresh conversation history to include the new conversation
      if (data.conversationId && !currentConversationId) {
        loadConversationHistory();
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Add error message
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "SYSTEM",
        content: "Sorry, I encountered an error. Please try your question again.",
        timestamp: new Date()
      };
      setCurrentMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentMessages(data.messages || []);
        setCurrentConversationId(conversationId);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    }
  };

  const toggleConversationExpansion = (conversationId: string) => {
    const newExpanded = new Set(expandedConversations);
    if (newExpanded.has(conversationId)) {
      newExpanded.delete(conversationId);
    } else {
      newExpanded.add(conversationId);
    }
    setExpandedConversations(newExpanded);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setConversationHistory(prev => prev.filter(conv => conv.id !== conversationId));
        if (currentConversationId === conversationId) {
          startNewConversation();
        }
        toast.success("Conversation deleted");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Bot className="h-8 w-8 mx-auto mb-2 text-purple-600 animate-pulse" />
          <p>Loading AI Mentor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversation History Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300",
        showHistory ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <History className="h-4 w-4" />
              Conversation History
            </h3>
            <Button
              size="sm"
              onClick={startNewConversation}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
          <p className="text-xs text-gray-600">
            All conversations with {child?.name}
          </p>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
          <div className="p-2 space-y-2">
            {conversationHistory.length > 0 ? (
              conversationHistory.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    currentConversationId === conversation.id
                      ? "bg-purple-50 border-purple-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1"
                      onClick={() => loadConversation(conversation.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="h-3 w-3 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {conversation.conversationName || `Conversation ${conversation.id.slice(-6)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(conversation.createdAt).toLocaleDateString()}
                        <Clock className="h-3 w-3 ml-1" />
                        {new Date(conversation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {conversation.messages.length} messages
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleConversationExpansion(conversation.id)}
                        className="h-6 w-6 p-0"
                      >
                        {expandedConversations.has(conversation.id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteConversation(conversation.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {expandedConversations.has(conversation.id) && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {conversation.messages.slice(0, 3).map((message, idx) => (
                          <div key={idx} className="text-xs">
                            <span className={cn(
                              "font-medium",
                              message.role === "USER" ? "text-blue-600" : "text-purple-600"
                            )}>
                              {message.role === "USER" ? "You" : "AI"}:
                            </span>
                            <span className="text-gray-600 ml-1">
                              {message.content.slice(0, 50)}...
                            </span>
                          </div>
                        ))}
                        {conversation.messages.length > 3 && (
                          <p className="text-xs text-gray-400">
                            +{conversation.messages.length - 3} more messages
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No previous conversations</p>
                <p className="text-xs">Start chatting to build history</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    AI Counseling Mentor
                  </h1>
                  <p className="text-sm text-gray-600">
                    Expert guidance for {child?.name}'s counseling
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4 mr-2" />
                {showHistory ? "Hide" : "Show"} History
              </Button>
              
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                <Brain className="h-3 w-3 mr-1" />
                RAG Enabled
              </Badge>
            </div>
          </div>
        </div>

        {/* Child Info Bar */}
        <div className="bg-purple-50 border-b border-purple-200 p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-900">{child?.name}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-purple-700">Age: {child?.age}</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-purple-700">Location: {child?.state}</span>
            <Separator orientation="vertical" className="h-4" />
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {child?.concerns?.filter((c: any) => c.status !== "RESOLVED")?.length || 0} Active Concerns
            </Badge>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Quick Suggestions */}
          {showSuggestions && (
            <div className="p-4 bg-white border-b border-gray-200">
              <QuickSuggestions 
                onSelectSuggestion={sendMessage}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto space-y-4">
              {currentMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  metadata={message.metadata}
                />
              ))}
              
              {isLoading && (
                <div className="max-w-4xl mx-auto">
                  <TypingIndicator />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                onSendMessage={sendMessage}
                disabled={isLoading}
                placeholder="Ask for guidance about counseling techniques, specific situations, or recommendations..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
