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
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const { childId, sessionId, conversationId } = yield request.json();
            if (!childId) {
                return server_1.NextResponse.json({ error: "Child ID is required" }, { status: 400 });
            }
            // Get comprehensive RAG context
            const ragContext = yield buildRAGContext(childId, sessionId, conversationId);
            return server_1.NextResponse.json({ context: ragContext });
        }
        catch (error) {
            console.error("Error building RAG context:", error);
            return server_1.NextResponse.json({ error: "Failed to build RAG context" }, { status: 500 });
        }
    });
}
exports.POST = POST;
function buildRAGContext(childId, sessionId, conversationId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1. Get child profile with all related data
            const child = yield db_1.prisma.child.findUnique({
                where: { id: childId },
                include: {
                    concerns: {
                        where: { status: { not: "RESOLVED" } },
                        orderBy: { createdAt: "desc" }
                    },
                    tags: true,
                    assignments: {
                        include: {
                            volunteer: {
                                select: { name: true, specialization: true }
                            }
                        },
                        where: { isActive: true }
                    }
                }
            });
            if (!child) {
                throw new Error("Child not found");
            }
            // 2. Get session history (last 5 sessions + current session)
            const sessionHistory = yield db_1.prisma.session.findMany({
                where: { childId },
                include: {
                    summary: true,
                    volunteer: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 6
            });
            // 3. Get current session details if provided
            let currentSession = null;
            if (sessionId) {
                currentSession = yield db_1.prisma.session.findUnique({
                    where: { id: sessionId },
                    include: {
                        summary: true,
                        volunteer: {
                            select: { name: true, specialization: true }
                        }
                    }
                });
            }
            // 4. Get conversation memories for this child
            const conversationMemories = yield db_1.prisma.conversationMemory.findMany({
                where: { childId },
                orderBy: [
                    { importance: "desc" },
                    { createdAt: "desc" }
                ],
                take: 20
            });
            // 5. Get relevant cultural stories based on child's profile
            const relevantStories = yield db_1.prisma.culturalStory.findMany({
                where: {
                    isActive: true,
                    OR: [
                        {
                            applicableFor: {
                                hasSome: [child.gender, `age_${Math.floor(child.age / 5) * 5}`, child.state]
                            }
                        },
                        {
                            themes: {
                                hasSome: ((_a = child.interests) === null || _a === void 0 ? void 0 : _a.slice(0, 3)) || []
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    summary: true,
                    themes: true,
                    moralLessons: true,
                    applicableFor: true
                },
                take: 10
            });
            // 6. Get relevant knowledge base content
            const relevantKnowledge = yield db_1.prisma.knowledgeBase.findMany({
                where: {
                    isActive: true,
                    OR: [
                        {
                            category: "PSYCHOLOGICAL_COUNSELING"
                        },
                        {
                            category: "CULTURAL_WISDOM"
                        },
                        {
                            tags: {
                                some: {
                                    name: {
                                        in: [...((_b = child.interests) === null || _b === void 0 ? void 0 : _b.slice(0, 3)) || [], ...((_c = child.challenges) === null || _c === void 0 ? void 0 : _c.slice(0, 2)) || []]
                                    }
                                }
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    summary: true,
                    category: true,
                    subCategory: true
                },
                take: 15
            });
            // 7. Get previous AI chat conversations for context
            let previousConversations = [];
            if (conversationId) {
                const conversation = yield db_1.prisma.aiChatConversation.findUnique({
                    where: { id: conversationId },
                    include: {
                        messages: {
                            orderBy: { timestamp: "asc" },
                            take: 20 // Last 20 messages for context
                        }
                    }
                });
                if (conversation) {
                    previousConversations = conversation.messages;
                }
            }
            // 8. Build comprehensive context object
            const ragContext = {
                child: {
                    id: child.id,
                    name: child.name,
                    age: child.age,
                    gender: child.gender,
                    state: child.state,
                    district: child.district,
                    background: child.background,
                    schoolLevel: child.schoolLevel,
                    interests: child.interests,
                    challenges: child.challenges,
                    language: child.language,
                    activeConcerns: ((_d = child.concerns) === null || _d === void 0 ? void 0 : _d.map((concern) => ({
                        category: concern.category,
                        title: concern.title,
                        description: concern.description,
                        severity: concern.severity,
                        identifiedAt: concern.identifiedAt
                    }))) || [],
                    tags: ((_e = child.tags) === null || _e === void 0 ? void 0 : _e.map((tag) => tag.name)) || [],
                    assignedVolunteers: ((_f = child.assignments) === null || _f === void 0 ? void 0 : _f.map((assignment) => ({
                        name: assignment.volunteer.name,
                        specialization: assignment.volunteer.specialization
                    }))) || []
                },
                sessionHistory: (sessionHistory === null || sessionHistory === void 0 ? void 0 : sessionHistory.map((session) => {
                    var _a;
                    return ({
                        id: session.id,
                        status: session.status,
                        sessionType: session.sessionType,
                        startedAt: session.startedAt,
                        endedAt: session.endedAt,
                        notes: session.notes,
                        volunteerName: (_a = session.volunteer) === null || _a === void 0 ? void 0 : _a.name,
                        summary: session.summary ? {
                            summary: session.summary.summary,
                            concernsDiscussed: session.summary.concernsDiscussed,
                            culturalStoriesUsed: session.summary.culturalStoriesUsed,
                            progressMade: session.summary.progressMade,
                            nextSteps: session.summary.nextSteps,
                            resolutionStatus: session.summary.resolutionStatus
                        } : null
                    });
                })) || [],
                currentSession: currentSession ? {
                    id: currentSession.id,
                    status: currentSession.status,
                    sessionType: currentSession.sessionType,
                    startedAt: currentSession.startedAt,
                    volunteerName: (_g = currentSession.volunteer) === null || _g === void 0 ? void 0 : _g.name,
                    volunteerSpecialization: (_h = currentSession.volunteer) === null || _h === void 0 ? void 0 : _h.specialization,
                    notes: currentSession.notes
                } : null,
                conversationMemories: (conversationMemories === null || conversationMemories === void 0 ? void 0 : conversationMemories.map((memory) => ({
                    type: memory.memoryType,
                    content: memory.content,
                    importance: memory.importance,
                    associatedTags: memory.associatedTags,
                    createdAt: memory.createdAt
                }))) || [],
                relevantStories: (relevantStories === null || relevantStories === void 0 ? void 0 : relevantStories.map((story) => ({
                    id: story.id,
                    title: story.title,
                    summary: story.summary,
                    themes: story.themes,
                    moralLessons: story.moralLessons,
                    applicableFor: story.applicableFor
                }))) || [],
                relevantKnowledge: (relevantKnowledge === null || relevantKnowledge === void 0 ? void 0 : relevantKnowledge.map((knowledge) => ({
                    id: knowledge.id,
                    title: knowledge.title,
                    summary: knowledge.summary,
                    category: knowledge.category,
                    subCategory: knowledge.subCategory
                }))) || [],
                previousConversations: (previousConversations === null || previousConversations === void 0 ? void 0 : previousConversations.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp
                }))) || [],
                contextMetadata: {
                    buildTimestamp: new Date().toISOString(),
                    totalConcerns: ((_j = child.concerns) === null || _j === void 0 ? void 0 : _j.length) || 0,
                    totalSessions: (sessionHistory === null || sessionHistory === void 0 ? void 0 : sessionHistory.length) || 0,
                    totalMemories: (conversationMemories === null || conversationMemories === void 0 ? void 0 : conversationMemories.length) || 0,
                    culturalContext: {
                        state: child.state,
                        language: child.language,
                        relevantStoriesCount: (relevantStories === null || relevantStories === void 0 ? void 0 : relevantStories.length) || 0
                    }
                }
            };
            return ragContext;
        }
        catch (error) {
            console.error("Error in buildRAGContext:", error);
            throw error;
        }
    });
}
