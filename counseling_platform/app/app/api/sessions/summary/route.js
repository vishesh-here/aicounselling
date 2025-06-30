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
exports.GET = exports.POST = exports.dynamic = void 0;
const server_1 = require("next/server");
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const db_1 = require("@/lib/db");
exports.dynamic = "force-dynamic";
function POST(request) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const body = yield request.json();
            const { sessionId, summaryData, isDraft = false } = body;
            // Validate required fields
            if (!sessionId) {
                return server_1.NextResponse.json({ error: "Session ID is required" }, { status: 400 });
            }
            // Check if session exists and belongs to the user
            const sessionRecord = yield db_1.prisma.session.findUnique({
                where: { id: sessionId },
                include: { volunteer: true }
            });
            if (!sessionRecord) {
                return server_1.NextResponse.json({ error: "Session not found" }, { status: 404 });
            }
            if (sessionRecord.volunteerId !== session.user.id) {
                return server_1.NextResponse.json({ error: "Unauthorized access to session" }, { status: 403 });
            }
            // Prepare the summary data for database
            const summaryPayload = {
                summary: summaryData.additionalNotes || "Session completed",
                sessionDuration: summaryData.sessionDuration,
                sessionType: summaryData.sessionType,
                // Mood and state
                initialMood: summaryData.initialMood,
                finalMood: summaryData.finalMood,
                moodChanges: summaryData.moodChanges,
                // Content and topics
                concernsDiscussed: summaryData.concernsAddressed || [],
                topicsDiscussed: summaryData.topicsDiscussed || [],
                // Techniques and cultural elements
                culturalStoriesUsed: summaryData.culturalStoriesUsed || [],
                techniquesUsed: summaryData.techniquesUsed || [],
                techniqueEffectiveness: summaryData.techniqueEffectiveness || {},
                storyResponse: summaryData.storyResponse,
                // Insights and breakthroughs
                breakthroughs: summaryData.breakthroughs,
                keyInsights: summaryData.keyInsights,
                // Challenges and engagement
                challengesFaced: summaryData.challengesFaced,
                challengeHandling: summaryData.challengeHandling,
                engagementLevel: summaryData.engagementLevel,
                participationNotes: summaryData.participationNotes,
                // Progress and next steps
                progressMade: summaryData.breakthroughs || summaryData.keyInsights,
                nextSteps: summaryData.actionItems || [],
                actionItems: summaryData.actionItems || [],
                recommendations: summaryData.recommendations,
                // Assessment and planning
                sessionEffectiveness: summaryData.sessionEffectiveness,
                volunteerConfidence: summaryData.volunteerConfidence,
                nextSessionFocus: summaryData.nextSessionFocus,
                nextSessionTiming: summaryData.nextSessionTiming,
                // Additional information
                additionalNotes: summaryData.additionalNotes,
                // Set resolution status based on effectiveness and next steps
                resolutionStatus: (summaryData.sessionEffectiveness === "Very Effective" && ((_a = summaryData.actionItems) === null || _a === void 0 ? void 0 : _a.length) === 0)
                    ? "RESOLVED"
                    : "IN_PROGRESS",
                followUpNeeded: ((_b = summaryData.actionItems) === null || _b === void 0 ? void 0 : _b.length) > 0 || summaryData.nextSessionFocus,
                followUpDate: summaryData.nextSessionTiming ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // Default to 1 week if timing specified
            };
            // Create or update session summary
            const existingSummary = yield db_1.prisma.sessionSummary.findUnique({
                where: { sessionId }
            });
            let savedSummary;
            if (existingSummary) {
                savedSummary = yield db_1.prisma.sessionSummary.update({
                    where: { sessionId },
                    data: summaryPayload
                });
            }
            else {
                savedSummary = yield db_1.prisma.sessionSummary.create({
                    data: Object.assign({ sessionId }, summaryPayload)
                });
            }
            // If not a draft, also update the session status
            if (!isDraft) {
                yield db_1.prisma.session.update({
                    where: { id: sessionId },
                    data: {
                        status: "COMPLETED",
                        endedAt: new Date()
                    }
                });
                // Create conversation memory entries for important insights
                if (summaryData.keyInsights || summaryData.breakthroughs) {
                    const memoryEntries = [];
                    if (summaryData.keyInsights) {
                        memoryEntries.push({
                            childId: sessionRecord.childId,
                            volunteerId: session.user.id,
                            sessionId: sessionId,
                            memoryType: "IMPORTANT_INSIGHT",
                            content: summaryData.keyInsights,
                            importance: 4,
                            associatedTags: summaryData.topicsDiscussed || []
                        });
                    }
                    if (summaryData.breakthroughs) {
                        memoryEntries.push({
                            childId: sessionRecord.childId,
                            volunteerId: session.user.id,
                            sessionId: sessionId,
                            memoryType: "BREAKTHROUGH_MOMENT",
                            content: summaryData.breakthroughs,
                            importance: 5,
                            associatedTags: summaryData.topicsDiscussed || []
                        });
                    }
                    if (summaryData.challengesFaced) {
                        memoryEntries.push({
                            childId: sessionRecord.childId,
                            volunteerId: session.user.id,
                            sessionId: sessionId,
                            memoryType: "WARNING_SIGN",
                            content: summaryData.challengesFaced,
                            importance: 3,
                            associatedTags: ["challenges"]
                        });
                    }
                    // Save memory entries
                    for (const entry of memoryEntries) {
                        yield db_1.prisma.conversationMemory.create({ data: entry });
                    }
                }
            }
            return server_1.NextResponse.json({
                success: true,
                summary: savedSummary,
                message: isDraft ? "Summary saved as draft" : "Session summary submitted successfully"
            });
        }
        catch (error) {
            console.error("Error saving session summary:", error);
            return server_1.NextResponse.json({
                success: false,
                error: "Failed to save session summary"
            }, { status: 500 });
        }
    });
}
exports.POST = POST;
function GET(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const { searchParams } = new URL(request.url);
            const sessionId = searchParams.get("sessionId");
            if (!sessionId) {
                return server_1.NextResponse.json({ error: "Session ID is required" }, { status: 400 });
            }
            // Get session summary
            const summary = yield db_1.prisma.sessionSummary.findUnique({
                where: { sessionId },
                include: {
                    session: {
                        include: {
                            child: true,
                            volunteer: true
                        }
                    }
                }
            });
            if (!summary) {
                return server_1.NextResponse.json({ error: "Summary not found" }, { status: 404 });
            }
            return server_1.NextResponse.json({
                success: true,
                summary
            });
        }
        catch (error) {
            console.error("Error fetching session summary:", error);
            return server_1.NextResponse.json({
                success: false,
                error: "Failed to fetch session summary"
            }, { status: 500 });
        }
    });
}
exports.GET = GET;
