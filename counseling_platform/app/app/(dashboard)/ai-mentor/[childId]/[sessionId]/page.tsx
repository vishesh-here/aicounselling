"use client";
console.log('AI Mentor page loaded - CORRECT PAGE');

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
import { createClient } from '@supabase/supabase-js';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  messageCount: number;
  lastMessageAt: Date;
  sessionInfo?: {
    id: string;
    startedAt: Date;
    status: string;
  } | null;
  isActive: boolean;
}

export default function AiMentorPage() {
  const params = useParams();
  console.log('Params:', params);
  const child_id = params.childId as string;
  const sessionId = params.sessionId as string;
  if (!child_id || !sessionId) {
    return <div className="p-6 text-center text-red-600">Invalid route: childId or sessionId is missing from params.</div>;
  }
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessageType[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [latestRagContext, setLatestRagContext] = useState<any>(null); // Store full context object
  const [isAdmin, setIsAdmin] = useState(false);
  const [showRagModal, setShowRagModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Helper to set currentConversationId and ref together
  const activeConversationIdRef = useRef<string | null>(null);

  const setActiveConversationId = (id: string | null) => {
    console.log('[setActiveConversationId] Setting currentConversationId to:', id);
    setCurrentConversationId(id);
    activeConversationIdRef.current = id;
    console.log('[setActiveConversationId] activeConversationIdRef.current is now:', activeConversationIdRef.current);
  };

  // Debug: log currentMessages whenever it changes
  useEffect(() => {
    console.log('Rendering currentMessages:', currentMessages);
  }, [currentMessages]);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (user) {
          // Check role from user_metadata (same pattern used in other API routes)
          const role = user.user_metadata?.role;
          console.log('User role:', role);
          setIsAdmin(role === 'ADMIN');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, []);

  // Load child data and conversation history
  useEffect(() => {
    console.log('[useEffect] Fetching child and loading conversation history. child_id:', child_id, 'sessionIdParam:', sessionId);
    const fetchChild = async () => {
      if (!child_id || child_id === 'undefined') {
        setError('No child selected. Please navigate from a valid child profile.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Get Supabase access token
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        const response = await fetch(`/api/children/${child_id}`, {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
          }
        });
        if (response.status === 401) {
          setError('Unauthorized. Please log in again.');
          setLoading(false);
          return;
        }
        if (response.status === 404) {
          setError('Child not found or inactive.');
          setLoading(false);
          return;
        }
        if (!response.ok) {
          setError('Failed to load child profile.');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setChild(data.child);
        setLoading(false);
      } catch (err: any) {
        setError('An unexpected error occurred.');
        setLoading(false);
      }
    };
    fetchChild();
    loadConversationHistory();
    // No need to set sessionId in state, always use param
  }, [child_id, sessionId]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    console.log('[useEffect] currentMessages changed:', currentMessages);
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversationHistory = async () => {
    console.log('[loadConversationHistory] Called');
    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch(`/api/ai/conversations/history/${child_id}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[loadConversationHistory] API response:', data);
        setConversationHistory(data.conversations || []);
        // If there is a sessionId in the most recent conversation, set it
        if (data.conversations && data.conversations.length > 0 && data.conversations[0].sessionId) {
          // setSessionId(data.conversations[0].sessionId); // Removed as per edit hint
        }
        // Start a new conversation automatically if no current conversation
        if (!currentConversationId) {
          await startNewConversation();
        }
        if ((data.conversations || []).length > 0 && !activeConversationIdRef.current) {
          const mostRecent = data.conversations[0];
          console.log('[loadConversationHistory] No active conversation, auto-selecting most recent:', mostRecent.id);
          setActiveConversationId(mostRecent.id);
          await loadConversation(mostRecent.id);
        }
      }
    } catch (error) {
      console.error('[loadConversationHistory] Error:', error);
      // Start a new conversation anyway
      await startNewConversation();
    }
  };

  const startNewConversation = async () => {
    console.log('[startNewConversation] Called');
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
      activeConversationIdRef.current = null;
      setShowSuggestions(true);
      console.log('[startNewConversation] Reset currentMessages, currentConversationId, activeConversationIdRef, showSuggestions');
    } catch (error) {
      console.error('[startNewConversation] Error:', error);
    }
  };

  const sendMessage = async (messageContent: string) => {
    console.log('[sendMessage] Called with messageContent:', messageContent);
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

    setCurrentMessages(prev => {
      const updated = [...prev, userMessage];
      console.log('[sendMessage] Added user message. currentMessages now:', updated);
      return updated;
    });
    setIsLoading(true);

    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          message: messageContent,
          child_id: child_id ?? null,
          sessionId: sessionId ?? null,
          conversationId: currentConversationId ?? null
        })
      });

      console.log('[sendMessage] /api/ai/chat response status:', response.status);
      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      console.log('[sendMessage] /api/ai/chat response data:', data);
      // Update conversation ID if this is the first message
      if (!currentConversationId && data.conversationId) {
        setActiveConversationId(data.conversationId);
      }
      // If the backend returns a sessionId (e.g., for new conversations), update it
      if (data.sessionId) {
        // setSessionId(data.sessionId); // Removed as per edit hint
      }
      // Always call loadConversation if a conversationId is present
      if (data.conversationId) {
        console.log('[sendMessage] Calling loadConversation after sendMessage with conversationId:', data.conversationId);
        await loadConversation(data.conversationId);
      } else {
        console.warn('[sendMessage] No conversationId returned from chat API!');
      }

      // Add AI response
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "ASSISTANT",
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata
      };

      // setCurrentMessages(prev => { // This line is removed as per the edit hint
      //   const updated = [...prev, aiMessage];
      //   console.log('[sendMessage] Added AI message. currentMessages now:', updated);
      //   return updated;
      // });

      // Refresh conversation history to include the new conversation
      if (data.conversationId && !currentConversationId) {
        loadConversationHistory();
      }

      // Store latest RAG context if present
      if (data.ragContext) {
        setLatestRagContext(data.ragContext);
      } else {
        setLatestRagContext(null);
      }

    } catch (error) {
      console.error('[sendMessage] Error:', error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Add error message
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "SYSTEM",
        content: "Sorry, I encountered an error. Please try your question again.",
        timestamp: new Date()
      };
      setCurrentMessages(prev => {
        const updated = [...prev, errorMessage];
        console.log('[sendMessage] Added error message. currentMessages now:', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    console.log('[loadConversation] Called with conversationId:', conversationId);
    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });
      console.log('[loadConversation] /api/ai/conversations response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[loadConversation] /api/ai/conversations response data:', data);
        setCurrentMessages(
          (data.messages || []).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        );
        setCurrentConversationId(conversationId);
        activeConversationIdRef.current = conversationId;
        setShowSuggestions(false);
        console.log('[loadConversation] Set currentMessages, currentConversationId, activeConversationIdRef');
      }
    } catch (error) {
      console.error('[loadConversation] Error:', error);
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
    console.log('[deleteConversation] Called with conversationId:', conversationId);
    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: "DELETE"
      });
      
      console.log('[deleteConversation] /api/ai/conversations DELETE response status:', response.status);
      if (response.ok) {
        setConversationHistory(prev => prev.filter(conv => conv.id !== conversationId));
        if (currentConversationId === conversationId) {
          setCurrentMessages([]);
          setActiveConversationId(null);
          setShowSuggestions(true);
          console.log('[deleteConversation] Deleted active conversation, reset chat state');
        }
        toast.success("Conversation deleted");
      }
    } catch (error) {
      console.error('[deleteConversation] Error:', error);
      toast.error("Failed to delete conversation");
    }
  };

  // Debug: log currentMessages whenever it changes
  useEffect(() => {
    console.log('Rendering currentMessages:', currentMessages);
  }, [currentMessages]);

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

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!child) {
    return <div className="p-6 text-center text-red-600">No child profile loaded.</div>;
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
                        {conversation.messageCount || 0} messages
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
                      <div className="text-xs text-gray-500">
                        <p>Click to view full conversation</p>
                        <p>Last message: {new Date(conversation.lastMessageAt).toLocaleString()}</p>
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
        <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
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
              {currentMessages.map((message, idx) => {
                const isLatestAI =
                  message.role === "ASSISTANT" &&
                  idx === currentMessages.length - 1;
                return (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                    metadata={message.metadata}
                    isAdmin={isAdmin && isLatestAI}
                    ragContext={isLatestAI && latestRagContext ? latestRagContext : undefined}
                    onShowRagModal={isLatestAI ? () => setShowRagModal(true) : undefined}
                  />
                );
              })}
              
              {isLoading && (
                <div className="max-w-4xl mx-auto">
                  <TypingIndicator />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          {/* RAG Debug Modal */}
          {showRagModal && latestRagContext && (
            <Dialog open={showRagModal} onOpenChange={setShowRagModal}>
              <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>RAG Context Used</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4 pb-4">
                    {/* Knowledge Chunks */}
                    <div>
                      <h3 className="font-semibold mb-2">Knowledge Chunks</h3>
                      <div className="bg-gray-50 rounded border">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-2 py-1 text-left">Similarity</th>
                              <th className="px-2 py-1 text-left">Content</th>
                              <th className="px-2 py-1 text-left">Chunk ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {latestRagContext.knowledgeChunks?.sort((a: any, b: any) => (b.similarity ?? 0) - (a.similarity ?? 0)).map((chunk: any, i: number) => (
                              <tr key={chunk.id || i} className="border-b border-gray-200">
                                <td className="px-2 py-1">{chunk.similarity?.toFixed(3) ?? "-"}</td>
                                <td className="px-2 py-1 max-w-xs truncate" title={chunk.content}>{chunk.content?.slice(0, 100) ?? "-"}</td>
                                <td className="px-2 py-1">{chunk.id}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {/* Child Profile */}
                    <div>
                      <h3 className="font-semibold mb-2">Child Profile</h3>
                      <div className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-32">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(latestRagContext.childProfile, null, 2)}</pre>
                      </div>
                    </div>
                    {/* Active Concerns */}
                    <div>
                      <h3 className="font-semibold mb-2">Active Concerns</h3>
                      <div className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-32">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(latestRagContext.activeConcerns, null, 2)}</pre>
                      </div>
                    </div>
                    {/* Session Summaries */}
                    <div>
                      <h3 className="font-semibold mb-2">Session Summaries</h3>
                      <div className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(latestRagContext.sessionSummaries, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}

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
