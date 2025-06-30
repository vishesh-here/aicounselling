"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = void 0;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const textarea_1 = require("@/components/ui/textarea");
const lucide_react_1 = require("lucide-react");
function ChatInput({ onSendMessage, disabled = false, placeholder = "Ask for guidance about the session..." }) {
    const [message, setMessage] = (0, react_1.useState)("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage("");
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    return (<form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white">
      <div className="flex gap-2">
        <textarea_1.Textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={disabled} rows={2} className="resize-none flex-1 text-sm"/>
        <button_1.Button type="submit" size="sm" disabled={disabled || !message.trim()} className="self-end bg-purple-600 hover:bg-purple-700">
          {disabled ? (<lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>) : (<lucide_react_1.Send className="h-4 w-4"/>)}
        </button_1.Button>
      </div>
    </form>);
}
exports.ChatInput = ChatInput;
