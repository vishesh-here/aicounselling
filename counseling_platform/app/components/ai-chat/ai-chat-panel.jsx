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
exports.AiChatPanel = void 0;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const scroll_area_1 = require("@/components/ui/scroll-area");
const chat_message_1 = require("./chat-message");
const typing_indicator_1 = require("./typing-indicator");
const chat_input_1 = require("./chat-input");
const quick_suggestions_1 = require("./quick-suggestions");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
function AiChatPanel({ child_id, sessionId, childName, isMinimized = false, onMinimize, onMaximize, onClose }) {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [conversationId, setConversationId] = (0, react_1.useState)(null);
    const [isInitialized, setIsInitialized] = (0, react_1.useState)(false);
    const [showSuggestions, setShowSuggestions] = (0, react_1.useState)(true);
    const messagesEndRef = (0, react_1.useRef)(null);
    const scrollAreaRef = (0, react_1.useRef)(null);
    // Initialize chat with welcome message
    (0, react_1.useEffect)(() => {
        if (!isInitialized) {
            const welcomeMessage = {
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
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [messages]);
    const scrollToBottom = () => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    };
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
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        try {
            const response = yield fetch("/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
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
            const data = yield response.json();
            // Update conversation ID if this is the first message
            if (!conversationId && data.conversationId) {
                setConversationId(data.conversationId);
            }
            // Add AI response
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                role: "ASSISTANT",
                content: data.response,
                timestamp: new Date(),
                metadata: data.metadata
            };
            setMessages(prev => [...prev, aiMessage]);
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
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
    });
    const loadChatHistory = () => __awaiter(this, void 0, void 0, function* () {
        // TODO: Implement loading previous chat history
        sonner_1.toast.info("Chat history loading feature coming soon!");
    });
    if (isMinimized) {
        return (<card_1.Card className="fixed bottom-4 right-4 w-60 shadow-lg border-purple-200 z-50">
        <card_1.CardHeader className="p-3 bg-purple-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <lucide_react_1.Bot className="h-4 w-4 text-purple-600"/>
              <span className="text-sm font-medium text-purple-900">AI Mentor</span>
              <badge_1.Badge variant="secondary" className="text-xs">
                {messages.filter(m => m.role === "USER").length}
              </badge_1.Badge>
            </div>
            <div className="flex items-center gap-1">
              <button_1.Button size="sm" variant="ghost" onClick={onMaximize} className="h-6 w-6 p-0 hover:bg-purple-100">
                <lucide_react_1.Maximize2 className="h-3 w-3"/>
              </button_1.Button>
              <button_1.Button size="sm" variant="ghost" onClick={onClose} className="h-6 w-6 p-0 hover:bg-purple-100">
                <lucide_react_1.X className="h-3 w-3"/>
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="p-3">
          <p className="text-xs text-gray-600 mb-2">
            Click to expand AI guidance for {childName}'s session
          </p>
          <button_1.Button onClick={onMaximize} size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
            Open Chat
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className="fixed right-4 top-20 bottom-4 w-96 shadow-xl border-purple-200 z-40 flex flex-col">
      {/* Header */}
      <card_1.CardHeader className="p-4 bg-purple-50 border-b border-purple-200 shrink-0">
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2 text-purple-900">
            <lucide_react_1.Bot className="h-5 w-5"/>
            AI Counseling Mentor
          </card_1.CardTitle>
          <div className="flex items-center gap-1">
            <button_1.Button size="sm" variant="ghost" onClick={loadChatHistory} className="h-7 w-7 p-0 hover:bg-purple-100" title="Chat History">
              <lucide_react_1.History className="h-3 w-3"/>
            </button_1.Button>
            <button_1.Button size="sm" variant="ghost" onClick={onMinimize} className="h-7 w-7 p-0 hover:bg-purple-100" title="Minimize">
              <lucide_react_1.Minimize2 className="h-3 w-3"/>
            </button_1.Button>
            <button_1.Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0 hover:bg-purple-100" title="Close">
              <lucide_react_1.X className="h-3 w-3"/>
            </button_1.Button>
          </div>
        </div>
        
        {/* Session Info */}
        <div className="flex items-center gap-2 text-xs text-purple-700">
          <lucide_react_1.Brain className="h-3 w-3"/>
          <span>Session with {childName}</span>
          <badge_1.Badge variant="outline" className="text-xs">
            RAG Enabled
          </badge_1.Badge>
        </div>
      </card_1.CardHeader>

      {/* Messages Area */}
      <card_1.CardContent className="flex-1 p-0 flex flex-col min-h-0">
        {/* Quick Suggestions */}
        {showSuggestions && (<quick_suggestions_1.QuickSuggestions onSelectSuggestion={sendMessage} disabled={isLoading}/>)}

        {/* Messages */}
        <scroll_area_1.ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {messages.map((message) => (<chat_message_1.ChatMessage key={message.id} role={message.role} content={message.content} timestamp={message.timestamp} metadata={message.metadata}/>))}
            
            {isLoading && <typing_indicator_1.TypingIndicator />}
            
            <div ref={messagesEndRef}/>
          </div>
        </scroll_area_1.ScrollArea>

        {/* Chat Input */}
        <chat_input_1.ChatInput onSendMessage={sendMessage} disabled={isLoading} placeholder="Ask for guidance about the session..."/>
      </card_1.CardContent>

      {/* Status Bar */}
      <div className="p-2 bg-gray-50 border-t border-gray-200 shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <lucide_react_1.CheckCircle className="h-3 w-3 text-green-500"/>
            <span>AI Mentor Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{messages.filter(m => m.role === "USER").length} questions asked</span>
          </div>
        </div>
      </div>
    </card_1.Card>);
}
exports.AiChatPanel = AiChatPanel;
