"use strict";
"use client";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const scroll_area_1 = require("@/components/ui/scroll-area");
const separator_1 = require("@/components/ui/separator");
const chat_message_1 = require("@/components/ai-chat/chat-message");
const typing_indicator_1 = require("@/components/ai-chat/typing-indicator");
const chat_input_1 = require("@/components/ai-chat/chat-input");
const quick_suggestions_1 = require("@/components/ai-chat/quick-suggestions");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const utils_1 = require("@/lib/utils");
function AiMentorPage() {
    var _a, _b;
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const childId = params.childId;
    const [child, setChild] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [currentMessages, setCurrentMessages] = (0, react_1.useState)([]);
    const [conversationHistory, setConversationHistory] = (0, react_1.useState)([]);
    const [currentConversationId, setCurrentConversationId] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [showHistory, setShowHistory] = (0, react_1.useState)(true);
    const [expandedConversations, setExpandedConversations] = (0, react_1.useState)(new Set());
    const [showSuggestions, setShowSuggestions] = (0, react_1.useState)(true);
    const messagesEndRef = (0, react_1.useRef)(null);
    const scrollAreaRef = (0, react_1.useRef)(null);
    // Load child data and conversation history
    (0, react_1.useEffect)(() => {
        loadChildData();
        loadConversationHistory();
    }, [childId]);
    // Auto-scroll to bottom when new messages are added
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [currentMessages]);
    const scrollToBottom = () => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    };
    const loadChildData = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`/api/children/${childId}`);
            if (response.ok) {
                const data = yield response.json();
                setChild(data.child);
            }
            else {
                sonner_1.toast.error("Failed to load child data");
                router.back();
            }
        }
        catch (error) {
            console.error("Error loading child data:", error);
            sonner_1.toast.error("Failed to load child data");
            router.back();
        }
        finally {
            setLoading(false);
        }
    });
    const loadConversationHistory = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`/api/ai/conversations/history/${childId}`);
            if (response.ok) {
                const data = yield response.json();
                setConversationHistory(data.conversations || []);
                // Start a new conversation automatically if no current conversation
                if (!currentConversationId) {
                    yield startNewConversation();
                }
            }
        }
        catch (error) {
            console.error("Error loading conversation history:", error);
            // Start a new conversation anyway
            yield startNewConversation();
        }
    });
    const startNewConversation = () => __awaiter(this, void 0, void 0, function* () {
        try {
            // Initialize with welcome message
            const welcomeMessage = {
                id: "welcome-" + Date.now(),
                role: "SYSTEM",
                content: `Hello! I'm Dr. Priya Sharma, your AI counseling mentor. I'm here to provide expert guidance for your work with ${(child === null || child === void 0 ? void 0 : child.name) || 'this child'}. I have access to their complete profile, session history, and relevant resources. How can I assist you today?`,
                timestamp: new Date()
            };
            setCurrentMessages([welcomeMessage]);
            setCurrentConversationId(null);
            setShowSuggestions(true);
        }
        catch (error) {
            console.error("Error starting new conversation:", error);
        }
    });
    const sendMessage = (messageContent) => __awaiter(this, void 0, void 0, function* () {
        if (!messageContent.trim() || isLoading)
            return;
        // Hide suggestions after first user message
        if (showSuggestions) {
            setShowSuggestions(false);
        }
        // Add user message immediately
        const userMessage = {
            id: Date.now().toString(),
            role: "USER",
            content: messageContent,
            timestamp: new Date()
        };
        setCurrentMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        try {
            const response = yield fetch("/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: messageContent,
                    childId,
                    sessionId: null,
                    conversationId: currentConversationId
                })
            });
            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }
            const data = yield response.json();
            // Update conversation ID if this is the first message
            if (!currentConversationId && data.conversationId) {
                setCurrentConversationId(data.conversationId);
            }
            // Add AI response
            const aiMessage = {
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
        }
        catch (error) {
            console.error("Error sending message:", error);
            sonner_1.toast.error("Failed to get AI response. Please try again.");
            // Add error message
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: "SYSTEM",
                content: "Sorry, I encountered an error. Please try your question again.",
                timestamp: new Date()
            };
            setCurrentMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
    });
    const loadConversation = (conversationId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`/api/ai/conversations/${conversationId}`);
            if (response.ok) {
                const data = yield response.json();
                setCurrentMessages(data.messages || []);
                setCurrentConversationId(conversationId);
                setShowSuggestions(false);
            }
        }
        catch (error) {
            console.error("Error loading conversation:", error);
            sonner_1.toast.error("Failed to load conversation");
        }
    });
    const toggleConversationExpansion = (conversationId) => {
        const newExpanded = new Set(expandedConversations);
        if (newExpanded.has(conversationId)) {
            newExpanded.delete(conversationId);
        }
        else {
            newExpanded.add(conversationId);
        }
        setExpandedConversations(newExpanded);
    };
    const deleteConversation = (conversationId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`/api/ai/conversations/${conversationId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setConversationHistory(prev => prev.filter(conv => conv.id !== conversationId));
                if (currentConversationId === conversationId) {
                    startNewConversation();
                }
                sonner_1.toast.success("Conversation deleted");
            }
        }
        catch (error) {
            console.error("Error deleting conversation:", error);
            sonner_1.toast.error("Failed to delete conversation");
        }
    });
    if (loading) {
        return (<div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <lucide_react_1.Bot className="h-8 w-8 mx-auto mb-2 text-purple-600 animate-pulse"/>
          <p>Loading AI Mentor...</p>
        </div>
      </div>);
    }
    return (<div className="h-screen flex bg-gray-50">
      {/* Conversation History Sidebar */}
      <div className={(0, utils_1.cn)("bg-white border-r border-gray-200 transition-all duration-300", showHistory ? "w-80" : "w-0 overflow-hidden")}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <lucide_react_1.History className="h-4 w-4"/>
              Conversation History
            </h3>
            <button_1.Button size="sm" onClick={startNewConversation} className="bg-purple-600 hover:bg-purple-700">
              <lucide_react_1.Plus className="h-3 w-3 mr-1"/>
              New
            </button_1.Button>
          </div>
          <p className="text-xs text-gray-600">
            All conversations with {child === null || child === void 0 ? void 0 : child.name}
          </p>
        </div>

        <scroll_area_1.ScrollArea className="flex-1 h-[calc(100vh-120px)]">
          <div className="p-2 space-y-2">
            {conversationHistory.length > 0 ? (conversationHistory.map((conversation) => (<div key={conversation.id} className={(0, utils_1.cn)("p-3 rounded-lg border cursor-pointer transition-colors", currentConversationId === conversation.id
                ? "bg-purple-50 border-purple-200"
                : "bg-white border-gray-200 hover:bg-gray-50")}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1" onClick={() => loadConversation(conversation.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <lucide_react_1.MessageCircle className="h-3 w-3 text-purple-600"/>
                        <span className="text-sm font-medium text-gray-900">
                          {conversation.conversationName || `Conversation ${conversation.id.slice(-6)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <lucide_react_1.Calendar className="h-3 w-3"/>
                        {new Date(conversation.createdAt).toLocaleDateString()}
                        <lucide_react_1.Clock className="h-3 w-3 ml-1"/>
                        {new Date(conversation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <badge_1.Badge variant="secondary" className="text-xs mt-1">
                        {conversation.messages.length} messages
                      </badge_1.Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button_1.Button size="sm" variant="ghost" onClick={() => toggleConversationExpansion(conversation.id)} className="h-6 w-6 p-0">
                        {expandedConversations.has(conversation.id) ? (<lucide_react_1.ChevronDown className="h-3 w-3"/>) : (<lucide_react_1.ChevronRight className="h-3 w-3"/>)}
                      </button_1.Button>
                      <button_1.Button size="sm" variant="ghost" onClick={() => deleteConversation(conversation.id)} className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                        <lucide_react_1.Trash2 className="h-3 w-3"/>
                      </button_1.Button>
                    </div>
                  </div>

                  {expandedConversations.has(conversation.id) && (<div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {conversation.messages.slice(0, 3).map((message, idx) => (<div key={idx} className="text-xs">
                            <span className={(0, utils_1.cn)("font-medium", message.role === "USER" ? "text-blue-600" : "text-purple-600")}>
                              {message.role === "USER" ? "You" : "AI"}:
                            </span>
                            <span className="text-gray-600 ml-1">
                              {message.content.slice(0, 50)}...
                            </span>
                          </div>))}
                        {conversation.messages.length > 3 && (<p className="text-xs text-gray-400">
                            +{conversation.messages.length - 3} more messages
                          </p>)}
                      </div>
                    </div>)}
                </div>))) : (<div className="text-center py-8 text-gray-500">
                <lucide_react_1.MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400"/>
                <p className="text-sm">No previous conversations</p>
                <p className="text-xs">Start chatting to build history</p>
              </div>)}
          </div>
        </scroll_area_1.ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button_1.Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                <lucide_react_1.ArrowLeft className="h-4 w-4 mr-2"/>
                Back
              </button_1.Button>
              
              <separator_1.Separator orientation="vertical" className="h-6"/>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <lucide_react_1.Bot className="h-5 w-5 text-purple-600"/>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    AI Counseling Mentor
                  </h1>
                  <p className="text-sm text-gray-600">
                    Expert guidance for {child === null || child === void 0 ? void 0 : child.name}'s counseling
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button_1.Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                <lucide_react_1.History className="h-4 w-4 mr-2"/>
                {showHistory ? "Hide" : "Show"} History
              </button_1.Button>
              
              <badge_1.Badge variant="outline" className="text-purple-600 border-purple-200">
                <lucide_react_1.Brain className="h-3 w-3 mr-1"/>
                RAG Enabled
              </badge_1.Badge>
            </div>
          </div>
        </div>

        {/* Child Info Bar */}
        <div className="bg-purple-50 border-b border-purple-200 p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <lucide_react_1.User className="h-4 w-4 text-purple-600"/>
              <span className="font-medium text-purple-900">{child === null || child === void 0 ? void 0 : child.name}</span>
            </div>
            <separator_1.Separator orientation="vertical" className="h-4"/>
            <span className="text-purple-700">Age: {child === null || child === void 0 ? void 0 : child.age}</span>
            <separator_1.Separator orientation="vertical" className="h-4"/>
            <span className="text-purple-700">Location: {child === null || child === void 0 ? void 0 : child.state}</span>
            <separator_1.Separator orientation="vertical" className="h-4"/>
            <badge_1.Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {((_b = (_a = child === null || child === void 0 ? void 0 : child.concerns) === null || _a === void 0 ? void 0 : _a.filter((c) => c.status !== "RESOLVED")) === null || _b === void 0 ? void 0 : _b.length) || 0} Active Concerns
            </badge_1.Badge>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Quick Suggestions */}
          {showSuggestions && (<div className="p-4 bg-white border-b border-gray-200">
              <quick_suggestions_1.QuickSuggestions onSelectSuggestion={sendMessage} disabled={isLoading}/>
            </div>)}

          {/* Messages */}
          <scroll_area_1.ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto space-y-4">
              {currentMessages.map((message) => (<chat_message_1.ChatMessage key={message.id} role={message.role} content={message.content} timestamp={message.timestamp} metadata={message.metadata}/>))}
              
              {isLoading && (<div className="max-w-4xl mx-auto">
                  <typing_indicator_1.TypingIndicator />
                </div>)}
              
              <div ref={messagesEndRef}/>
            </div>
          </scroll_area_1.ScrollArea>

          {/* Chat Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <chat_input_1.ChatInput onSendMessage={sendMessage} disabled={isLoading} placeholder="Ask for guidance about counseling techniques, specific situations, or recommendations..."/>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
exports.default = AiMentorPage;
