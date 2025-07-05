"use strict";
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
exports.GET = exports.dynamic = void 0;
const server_1 = require("next/server");
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const db_1 = require("@/lib/db");
exports.dynamic = "force-dynamic";
function GET(request, { params }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const { child_id } = params;
            // Get all conversations for this child with message counts
            const conversations = yield db_1.prisma.aiChatConversation.findMany({
                where: {
                    child_id: child_id,
                    isActive: true
                },
                include: {
                    messages: {
                        orderBy: { timestamp: "asc" }
                    },
                    session: {
                        select: {
                            id: true,
                            startedAt: true,
                            status: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" }
            });
            // Format the conversations for the frontend
            const formattedConversations = conversations.map(conv => ({
                id: conv.id,
                sessionId: conv.sessionId,
                conversationName: conv.conversationName || `Conversation ${conv.id.slice(-6)}`,
                createdAt: conv.createdAt,
                isActive: conv.isActive,
                messageCount: conv.messages.length,
                lastMessageAt: conv.messages.length > 0
                    ? conv.messages[conv.messages.length - 1].timestamp
                    : conv.createdAt,
                sessionInfo: conv.session ? {
                    id: conv.session.id,
                    startedAt: conv.session.startedAt,
                    status: conv.session.status
                } : null,
                messages: conv.messages.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp,
                    metadata: msg.metadata
                }))
            }));
            return server_1.NextResponse.json({
                success: true,
                conversations: formattedConversations
            });
        }
        catch (error) {
            console.error("Error fetching conversation history:", error);
            return server_1.NextResponse.json({
                success: false,
                error: "Failed to fetch conversation history"
            }, { status: 500 });
        }
    });
}
exports.GET = GET;
