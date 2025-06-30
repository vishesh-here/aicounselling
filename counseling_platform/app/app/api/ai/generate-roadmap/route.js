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
const server_1 = require("next/server");
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
exports.dynamic = "force-dynamic";
function POST(request) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const body = yield request.json();
            const { childProfile, activeConcerns, recentSessions } = body;
            // Prepare context for AI
            const context = `
Child Profile:
- Name: ${childProfile.name}
- Age: ${childProfile.age}
- Interests: ${((_a = childProfile.interests) === null || _a === void 0 ? void 0 : _a.join(", ")) || "None listed"}
- Challenges: ${((_b = childProfile.challenges) === null || _b === void 0 ? void 0 : _b.join(", ")) || "None listed"}
- Background: ${childProfile.background || "No background information"}

Active Concerns:
${(activeConcerns === null || activeConcerns === void 0 ? void 0 : activeConcerns.map((concern) => `- ${concern.category} (${concern.severity}): ${concern.title}`).join("\n")) || "No active concerns"}

Recent Session History:
${(recentSessions === null || recentSessions === void 0 ? void 0 : recentSessions.map((session, index) => `Session ${index + 1}: ${session.summary || "No summary"} (Status: ${session.resolutionStatus || "Unknown"})`).join("\n")) || "No previous sessions"}

Based on this information, provide a counseling session roadmap for this child.
`;
            const prompt = `You are an expert child counselor specializing in counseling underprivileged children in India. 

${context}

Please generate a comprehensive session roadmap that includes:

1. Session Focus: What should be the primary focus of the upcoming session?
2. Primary Goals: 3-4 specific, achievable goals for this session
3. Recommended Approach: 3-4 counseling techniques or approaches that would be most effective

Consider the child's age, cultural background, and current concerns. Provide practical, culturally-sensitive recommendations that a volunteer counselor can implement.

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;
            const response = yield fetch("https://apps.abacus.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.ABACUSAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4.1-mini",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                }),
            });
            if (!response.ok) {
                throw new Error(`AI API request failed: ${response.statusText}`);
            }
            const aiResponse = yield response.json();
            let roadmapContent = (_e = (_d = (_c = aiResponse.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content;
            if (!roadmapContent) {
                throw new Error("No content received from AI");
            }
            // Clean and parse the JSON response
            try {
                // Remove any potential markdown code blocks
                roadmapContent = roadmapContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
                // Remove any characters before the first '{'
                const startIndex = roadmapContent.indexOf('{');
                if (startIndex > 0) {
                    roadmapContent = roadmapContent.substring(startIndex);
                }
                // Remove any characters after the last '}'
                const endIndex = roadmapContent.lastIndexOf('}');
                if (endIndex >= 0 && endIndex < roadmapContent.length - 1) {
                    roadmapContent = roadmapContent.substring(0, endIndex + 1);
                }
                const roadmap = JSON.parse(roadmapContent);
                // Validate the structure
                const structuredRoadmap = {
                    sessionFocus: roadmap.sessionFocus || roadmap["Session Focus"] || "Build rapport and assess current needs",
                    primaryGoals: roadmap.primaryGoals || roadmap["Primary Goals"] || [
                        "Establish trust and comfort",
                        "Understand current challenges",
                        "Identify strengths and interests",
                        "Set realistic short-term goals"
                    ],
                    approaches: roadmap.approaches || roadmap["Recommended Approach"] || roadmap.recommendedApproach || [
                        "Active listening and empathy",
                        "Strength-based counseling",
                        "Cultural storytelling integration",
                        "Goal-setting and planning"
                    ]
                };
                return server_1.NextResponse.json({
                    success: true,
                    roadmap: structuredRoadmap
                });
            }
            catch (parseError) {
                console.error("JSON parsing error:", parseError);
                // Fallback roadmap if parsing fails
                const fallbackRoadmap = {
                    sessionFocus: `Focus on building trust and understanding ${childProfile.name}'s current situation and needs.`,
                    primaryGoals: [
                        "Establish a comfortable and safe environment",
                        "Listen to current concerns and challenges",
                        "Identify personal strengths and interests",
                        "Develop initial action steps"
                    ],
                    approaches: [
                        "Use active listening and empathetic communication",
                        "Incorporate age-appropriate activities and discussions",
                        "Reference relevant cultural stories for guidance",
                        "Focus on building self-confidence and resilience"
                    ]
                };
                return server_1.NextResponse.json({
                    success: true,
                    roadmap: fallbackRoadmap,
                    note: "Using fallback recommendations due to processing error"
                });
            }
        }
        catch (error) {
            console.error("AI roadmap generation error:", error);
            // Return a basic roadmap as fallback
            return server_1.NextResponse.json({
                success: true,
                roadmap: {
                    sessionFocus: "Focus on understanding the child's current needs and building a supportive relationship.",
                    primaryGoals: [
                        "Create a safe and welcoming environment",
                        "Understand the child's current situation",
                        "Identify immediate support needs",
                        "Plan next steps together"
                    ],
                    approaches: [
                        "Use warm and empathetic communication",
                        "Ask open-ended questions to encourage sharing",
                        "Validate the child's feelings and experiences",
                        "Provide encouragement and positive reinforcement"
                    ]
                },
                note: "Using default recommendations due to system limitations"
            });
        }
    });
}
exports.POST = POST;
