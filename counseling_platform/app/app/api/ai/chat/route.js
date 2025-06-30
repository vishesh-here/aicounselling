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
exports.POST = exports.dynamic = void 0;
exports.dynamic = "force-dynamic";
const server_1 = require("next/server");
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const db_1 = require("@/lib/db");
function POST(request) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const { message, childId, sessionId, conversationId } = yield request.json();
            if (!message || !childId || !sessionId) {
                return server_1.NextResponse.json({
                    error: "Message, child ID, and session ID are required"
                }, { status: 400 });
            }
            // Get or create conversation
            let conversation;
            if (conversationId) {
                conversation = yield db_1.prisma.aiChatConversation.findUnique({
                    where: { id: conversationId },
                    include: { messages: { orderBy: { timestamp: "desc" }, take: 10 } }
                });
            }
            if (!conversation) {
                conversation = yield db_1.prisma.aiChatConversation.create({
                    data: {
                        sessionId,
                        childId,
                        volunteerId: session.user.id,
                        conversationName: `Session Chat - ${new Date().toLocaleDateString()}`
                    },
                    include: { messages: true }
                });
            }
            // Build comprehensive RAG context
            const ragContextResponse = yield fetch(`${process.env.NEXTAUTH_URL}/api/ai/rag-context`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ childId, sessionId, conversationId: conversation.id })
            });
            const { context: ragContext } = yield ragContextResponse.json();
            // Save user message
            yield db_1.prisma.aiChatMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: "USER",
                    content: message
                }
            });
            // Generate AI response using comprehensive context
            const aiResponse = yield generateAIResponse(message, ragContext, conversation);
            // Save AI response with RAG context
            yield db_1.prisma.aiChatMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: "ASSISTANT",
                    content: aiResponse.content,
                    ragContext: ragContext,
                    metadata: {
                        responseTime: (_a = aiResponse.metadata) === null || _a === void 0 ? void 0 : _a.responseTime,
                        tokensUsed: (_b = aiResponse.metadata) === null || _b === void 0 ? void 0 : _b.tokensUsed,
                        contextSources: (_c = aiResponse.metadata) === null || _c === void 0 ? void 0 : _c.contextSources
                    }
                }
            });
            // Extract and store important insights as conversation memory
            yield extractAndStoreMemory(aiResponse.content, message, childId, session.user.id, sessionId);
            return server_1.NextResponse.json({
                response: aiResponse.content,
                conversationId: conversation.id,
                metadata: aiResponse.metadata
            });
        }
        catch (error) {
            console.error("Error in AI chat:", error);
            return server_1.NextResponse.json({ error: "Failed to process AI chat request" }, { status: 500 });
        }
    });
}
exports.POST = POST;
function generateAIResponse(userMessage, ragContext, conversation) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            // Build comprehensive system prompt
            const systemPrompt = buildExpertSystemPrompt(ragContext);
            // Build conversation history
            const conversationHistory = ((_a = conversation.messages) === null || _a === void 0 ? void 0 : _a.map((msg) => ({
                role: msg.role.toLowerCase(),
                content: msg.content
            }))) || [];
            // Prepare messages for LLM API
            const messages = [
                { role: "system", content: systemPrompt },
                ...conversationHistory.slice(-8),
                { role: "user", content: userMessage }
            ];
            // Call LLM API
            const response = yield fetch("https://apps.abacus.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.ABACUSAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4.1-mini",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            if (!response.ok) {
                throw new Error(`LLM API error: ${response.status}`);
            }
            const data = yield response.json();
            const aiContent = (_d = (_c = (_b = data.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
            if (!aiContent) {
                throw new Error("No response from LLM API");
            }
            const responseTime = Date.now() - startTime;
            return {
                content: aiContent,
                metadata: {
                    responseTime,
                    tokensUsed: (_e = data.usage) === null || _e === void 0 ? void 0 : _e.total_tokens,
                    contextSources: [
                        "child_profile",
                        "session_history",
                        "conversation_memories",
                        "cultural_stories",
                        "knowledge_base"
                    ]
                }
            };
        }
        catch (error) {
            console.error("Error generating AI response:", error);
            throw error;
        }
    });
}
function buildExpertSystemPrompt(ragContext) {
    var _a, _b, _c;
    const child = ragContext.child;
    const sessionHistory = ragContext.sessionHistory;
    const memories = ragContext.conversationMemories;
    const stories = ragContext.relevantStories;
    const knowledge = ragContext.relevantKnowledge;
    return `You are Dr. Priya Sharma, a world-class child psychologist with 20+ years of experience specializing in academic counseling and daily life guidance for Indian children and adolescents. You are currently acting as an expert mentor and co-pilot to a volunteer counselor during an active counseling session.

## YOUR ROLE & EXPERTISE:
- **Primary Role**: Expert mentor providing real-time guidance to a volunteer counselor
- **Specialization**: Child psychology, academic stress, family dynamics, cultural sensitivity
- **Experience**: Extensive work with Indian children aged 8-18 across diverse socio-economic backgrounds
- **Approach**: Evidence-based psychological practices combined with cultural wisdom and empathy

## CURRENT CHILD CONTEXT:
**Child Profile:**
- Name: ${child.name} (${child.age} years old, ${child.gender})
- Location: ${child.state}${child.district ? `, ${child.district}` : ''}
- School Level: ${child.schoolLevel || 'Not specified'}
- Language: ${child.language}
- Background: ${child.background || 'Not specified'}

**Interests & Strengths:** ${((_a = child.interests) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'None specified'}
**Current Challenges:** ${((_b = child.challenges) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'None specified'}

**Active Concerns:**
${((_c = child.activeConcerns) === null || _c === void 0 ? void 0 : _c.map((concern) => `- ${concern.category}: ${concern.title} (${concern.severity}) - ${concern.description}`).join('\n')) || 'No active concerns recorded'}

## SESSION HISTORY CONTEXT:
${(sessionHistory === null || sessionHistory === void 0 ? void 0 : sessionHistory.slice(0, 3).map((session, index) => {
        var _a;
        return `**Session ${index + 1}** (${session.sessionType}):
  - Date: ${session.startedAt ? new Date(session.startedAt).toLocaleDateString() : 'Not started'}
  - Status: ${session.status}
  - Volunteer: ${session.volunteerName}
  ${session.summary ? `- Summary: ${session.summary.summary}
  - Progress: ${session.summary.progressMade || 'No progress recorded'}
  - Next Steps: ${((_a = session.summary.nextSteps) === null || _a === void 0 ? void 0 : _a.join('; ')) || 'No next steps recorded'}` : ''}
  ${session.notes ? `- Notes: ${session.notes}` : ''}`;
    }).join('\n\n')) || 'No previous sessions'}

## IMPORTANT CONVERSATION MEMORIES:
${(memories === null || memories === void 0 ? void 0 : memories.slice(0, 8).map((memory) => `- ${memory.type}: ${memory.content} (Importance: ${memory.importance}/5)`).join('\n')) || 'No conversation memories yet'}

## AVAILABLE CULTURAL RESOURCES:
${(stories === null || stories === void 0 ? void 0 : stories.slice(0, 5).map((story) => { var _a; return `- "${story.title}": ${story.summary} (Themes: ${(_a = story.themes) === null || _a === void 0 ? void 0 : _a.join(', ')})`; }).join('\n')) || 'No relevant cultural stories available'}

## RELEVANT KNOWLEDGE BASE:
${(knowledge === null || knowledge === void 0 ? void 0 : knowledge.slice(0, 5).map((kb) => `- ${kb.title} (${kb.category}): ${kb.summary || 'Professional guidance material'}`).join('\n')) || 'No relevant knowledge base entries'}

## YOUR COMMUNICATION STYLE:
1. **Professional yet Warm**: Speak as an experienced mentor who cares deeply about both the child and the volunteer
2. **Culturally Sensitive**: Always consider Indian family dynamics, educational pressures, and cultural values
3. **Specific & Actionable**: Provide concrete, implementable advice rather than generic suggestions
4. **Evidence-Based**: Reference established psychological principles and techniques
5. **Contextual**: Always consider the specific child's history, personality, and current situation

## KEY GUIDELINES:
- **Immediate Support**: If the volunteer asks for urgent help (child is distressed, not responding, etc.), prioritize immediate, practical guidance
- **Technique Suggestions**: Recommend specific counseling techniques suitable for the child's age and situation
- **Cultural Integration**: When relevant, suggest cultural stories or values that might resonate with the child
- **Progress Monitoring**: Help the volunteer recognize signs of progress or areas needing attention
- **Safety First**: Always prioritize the child's emotional safety and well-being
- **Family Context**: Consider family dynamics and parental expectations in your guidance

## RESPONSE FORMAT:
- Keep responses concise but comprehensive (2-4 sentences typically)
- Start with empathy/validation of the volunteer's situation
- Provide 1-2 specific actionable suggestions
- Include relevant context from the child's history when applicable
- End with encouragement or a follow-up question to guide the volunteer

Remember: You are here to support the volunteer in real-time during an active session. Your guidance should be immediately applicable and culturally appropriate for this specific child's context.`;
}
function extractAndStoreMemory(aiResponse, userMessage, childId, volunteerId, sessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Simple heuristics to identify important insights that should be stored as memory
            const importantKeywords = [
                'breakthrough', 'progress', 'technique worked', 'effective approach',
                'warning sign', 'pattern', 'family context', 'cultural reference',
                'prefers', 'responds well', 'struggles with', 'breakthrough moment'
            ];
            const combinedText = `${userMessage} ${aiResponse}`.toLowerCase();
            // Check if this exchange contains important information
            const isImportant = importantKeywords.some(keyword => combinedText.includes(keyword));
            if (isImportant) {
                // Determine memory type based on content
                let memoryType = 'IMPORTANT_INSIGHT';
                let importance = 3;
                if (combinedText.includes('breakthrough') || combinedText.includes('progress')) {
                    memoryType = 'BREAKTHROUGH_MOMENT';
                    importance = 5;
                }
                else if (combinedText.includes('technique') || combinedText.includes('approach')) {
                    memoryType = 'EFFECTIVE_TECHNIQUE';
                    importance = 4;
                }
                else if (combinedText.includes('prefers') || combinedText.includes('responds well')) {
                    memoryType = 'CHILD_PREFERENCE';
                    importance = 4;
                }
                else if (combinedText.includes('warning') || combinedText.includes('struggles')) {
                    memoryType = 'WARNING_SIGN';
                    importance = 4;
                }
                else if (combinedText.includes('family') || combinedText.includes('cultural')) {
                    memoryType = 'CULTURAL_REFERENCE';
                    importance = 3;
                }
                yield db_1.prisma.conversationMemory.create({
                    data: {
                        childId,
                        volunteerId,
                        sessionId,
                        memoryType: memoryType,
                        content: `Volunteer: ${userMessage}\nAI Guidance: ${aiResponse}`,
                        importance,
                        associatedTags: extractTags(combinedText)
                    }
                });
            }
        }
        catch (error) {
            console.error("Error storing conversation memory:", error);
            // Don't throw error - memory storage failure shouldn't break the chat
        }
    });
}
function extractTags(text) {
    const tagKeywords = [
        'academic', 'family', 'emotional', 'behavioral', 'social',
        'anxiety', 'stress', 'motivation', 'confidence', 'communication'
    ];
    return tagKeywords.filter(tag => text.includes(tag));
}
