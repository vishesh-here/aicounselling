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
exports.DELETE = exports.GET = exports.dynamic = void 0;
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
            const { conversationId } = params;
            // Get the conversation with all messages
            const conversation = yield db_1.prisma.aiChatConversation.findUnique({
                where: {
                    id: conversationId
                },
                include: {
                    messages: {
                        orderBy: { timestamp: "asc" }
                    },
                    child: {
                        select: {
                            id: true,
                            name: true,
                            age: true
                        }
                    }
                }
            });
            if (!conversation) {
                return server_1.NextResponse.json({ error: "Conversation not found" }, { status: 404 });
            }
            const formattedMessages = conversation.messages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                metadata: msg.metadata
            }));
            return server_1.NextResponse.json({
                success: true,
                conversation: {
                    id: conversation.id,
                    sessionId: conversation.sessionId,
                    conversationName: conversation.conversationName,
                    createdAt: conversation.createdAt,
                    child: conversation.child
                },
                messages: formattedMessages
            });
        }
        catch (error) {
            console.error("Error fetching conversation:", error);
            return server_1.NextResponse.json({
                success: false,
                error: "Failed to fetch conversation"
            }, { status: 500 });
        }
    });
}
exports.GET = GET;
function DELETE(request, { params }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const { conversationId } = params;
            // Delete the conversation (cascade will handle messages)
            yield db_1.prisma.aiChatConversation.delete({
                where: {
                    id: conversationId
                }
            });
            return server_1.NextResponse.json({
                success: true,
                message: "Conversation deleted successfully"
            });
        }
        catch (error) {
            console.error("Error deleting conversation:", error);
            return server_1.NextResponse.json({
                success: false,
                error: "Failed to delete conversation"
            }, { status: 500 });
        }
    });
}
exports.DELETE = DELETE;
