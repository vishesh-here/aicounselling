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
exports.PreSessionBriefing = void 0;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
function PreSessionBriefing({ child }) {
    var _a, _b;
    const [aiRoadmap, setAiRoadmap] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const activeConcerns = ((_a = child.concerns) === null || _a === void 0 ? void 0 : _a.filter((c) => c.status !== "RESOLVED")) || [];
    const recentSessions = ((_b = child.sessions) === null || _b === void 0 ? void 0 : _b.slice(0, 3)) || [];
    // Generate AI roadmap based on child's profile and concerns
    const generateAiRoadmap = () => __awaiter(this, void 0, void 0, function* () {
        setLoading(true);
        try {
            const response = yield fetch("/api/ai/enhanced-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    childId: child.id,
                    childProfile: {
                        name: child.name,
                        age: child.age,
                        state: child.state,
                        interests: child.interests,
                        challenges: child.challenges,
                        background: child.background
                    },
                    activeConcerns: activeConcerns.map((c) => ({
                        category: c.category,
                        title: c.title,
                        description: c.description,
                        severity: c.severity
                    }))
                })
            });
            if (response.ok) {
                const data = yield response.json();
                setAiRoadmap(data.roadmap);
            }
            else {
                console.error("Failed to generate roadmap:", yield response.text());
            }
        }
        catch (error) {
            console.error("Failed to generate AI roadmap:", error);
        }
        finally {
            setLoading(false);
        }
    });
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "HIGH": return "border-l-red-500 bg-red-50";
            case "MEDIUM": return "border-l-yellow-500 bg-yellow-50";
            case "LOW": return "border-l-green-500 bg-green-50";
            default: return "border-l-gray-500 bg-gray-50";
        }
    };
    const getRecommendedStories = () => {
        // Based on child's concerns and age, recommend relevant cultural stories
        const storyRecommendations = [
            {
                title: "Arjuna's Focus",
                relevance: "Perfect for academic concerns and building concentration",
                themes: ["Focus", "Goal-setting", "Excellence"]
            },
            {
                title: "The Clever Rabbit and the Lion",
                relevance: "Great for building confidence and problem-solving skills",
                themes: ["Intelligence", "Courage", "Problem-solving"]
            },
            {
                title: "Hanuman's Courage",
                relevance: "Helps with self-confidence and overcoming obstacles",
                themes: ["Courage", "Faith", "Self-confidence"]
            }
        ];
        return storyRecommendations;
    };
    return (<div className="space-y-6">
      {/* AI-Generated Session Roadmap */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Brain className="h-5 w-5 text-purple-600"/>
              AI-Generated Session Roadmap
            </card_1.CardTitle>
            <button_1.Button onClick={generateAiRoadmap} disabled={loading} size="sm" className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Generating..." : "Generate Roadmap"}
            </button_1.Button>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {aiRoadmap ? (<div className="space-y-6">
              {/* Pre-Session Preparation */}
              {aiRoadmap.preSessionPrep && (<div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                    <lucide_react_1.Brain className="h-4 w-4"/>
                    Pre-Session Preparation
                  </h4>
                  <p className="text-purple-800 text-sm">{aiRoadmap.preSessionPrep}</p>
                </div>)}

              {/* Session Objectives */}
              {aiRoadmap.sessionObjectives && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <lucide_react_1.Target className="h-4 w-4"/>
                      Session Objectives
                    </h4>
                    <ul className="space-y-1">
                      {aiRoadmap.sessionObjectives.map((goal, index) => (<li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <lucide_react_1.CheckCircle className="h-3 w-3 text-green-600 mt-1 shrink-0"/>
                          {goal}
                        </li>))}
                    </ul>
                  </div>

                  {/* Warning Signs */}
                  {aiRoadmap.warningSigns && (<div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500"/>
                        Warning Signs
                      </h4>
                      <ul className="space-y-1">
                        {aiRoadmap.warningSigns.map((sign, index) => (<li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <lucide_react_1.AlertTriangle className="h-3 w-3 text-red-500 mt-1 shrink-0"/>
                            {sign}
                          </li>))}
                      </ul>
                    </div>)}
                </div>)}

              {/* Conversation Starters */}
              {aiRoadmap.conversationStarters && (<div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <lucide_react_1.Lightbulb className="h-4 w-4"/>
                    Conversation Starters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiRoadmap.conversationStarters.map((starter, index) => (<div key={index} className="p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                        <p className="text-sm text-blue-800">"{starter}"</p>
                      </div>))}
                  </div>
                </div>)}

              {/* Recommended Approach & Cultural Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRoadmap.recommendedApproach && (<div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Recommended Approach</h4>
                    <p className="text-sm text-green-800">{aiRoadmap.recommendedApproach}</p>
                  </div>)}

                {aiRoadmap.culturalContext && (<div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Cultural Context</h4>
                    <p className="text-sm text-orange-800">{aiRoadmap.culturalContext}</p>
                  </div>)}
              </div>

              {/* Expected Challenges */}
              {aiRoadmap.expectedChallenges && (<div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500"/>
                    Expected Challenges & Solutions
                  </h4>
                  <div className="space-y-2">
                    {aiRoadmap.expectedChallenges.map((challenge, index) => (<div key={index} className="p-3 bg-yellow-50 rounded border-l-2 border-yellow-300">
                        <p className="text-sm text-yellow-800">{challenge}</p>
                      </div>))}
                  </div>
                </div>)}

              {/* Success Indicators & Follow-up Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRoadmap.successIndicators && (<div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>
                      Success Indicators
                    </h4>
                    <ul className="space-y-1">
                      {aiRoadmap.successIndicators.map((indicator, index) => (<li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <lucide_react_1.Star className="h-3 w-3 text-green-500 mt-1 shrink-0"/>
                          {indicator}
                        </li>))}
                    </ul>
                  </div>)}

                {aiRoadmap.followUpActions && (<div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <lucide_react_1.TrendingUp className="h-4 w-4 text-blue-500"/>
                      Follow-up Actions
                    </h4>
                    <ul className="space-y-1">
                      {aiRoadmap.followUpActions.map((action, index) => (<li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <lucide_react_1.CheckCircle className="h-3 w-3 text-blue-500 mt-1 shrink-0"/>
                          {action}
                        </li>))}
                    </ul>
                  </div>)}
              </div>
            </div>) : (<div className="text-center py-8 text-gray-500">
              <lucide_react_1.Brain className="h-8 w-8 mx-auto mb-2 text-gray-400"/>
              <p>Click "Generate Roadmap" to get AI-powered session recommendations</p>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Active Concerns Summary */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="h-5 w-5 text-orange-600"/>
            Active Concerns Priority
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {activeConcerns.length > 0 ? (<div className="space-y-3">
              {activeConcerns.map((concern) => (<div key={concern.id} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(concern.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{concern.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{concern.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <badge_1.Badge variant="outline" className="text-xs">
                          {concern.category}
                        </badge_1.Badge>
                        <badge_1.Badge variant="secondary" className={`text-xs ${concern.severity === "HIGH" ? "bg-red-100 text-red-800" :
                    concern.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"}`}>
                          {concern.severity}
                        </badge_1.Badge>
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>) : (<div className="text-center py-6 text-gray-500">
              <lucide_react_1.CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500"/>
              <p>No active concerns - great progress!</p>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Recommended Cultural Stories */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BookOpen className="h-5 w-5 text-blue-600"/>
            Recommended Cultural Stories
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {getRecommendedStories().map((story, index) => (<div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">{story.title}</h4>
                <p className="text-sm text-blue-800 mb-2">{story.relevance}</p>
                <div className="flex flex-wrap gap-1">
                  {story.themes.map((theme, themeIndex) => (<badge_1.Badge key={themeIndex} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      {theme}
                    </badge_1.Badge>))}
                </div>
              </div>))}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Recent Progress Summary */}
      {recentSessions.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-5 w-5 text-green-600"/>
              Recent Progress Summary
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {recentSessions.map((session, index) => {
                var _a, _b, _c, _d;
                return (<div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Session {recentSessions.length - index}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {((_a = session.summary) === null || _a === void 0 ? void 0 : _a.summary) || "No summary available"}
                      </p>
                    </div>
                    <badge_1.Badge variant="secondary" className={`text-xs ${((_b = session.summary) === null || _b === void 0 ? void 0 : _b.resolutionStatus) === "RESOLVED" ? "bg-green-100 text-green-800" :
                        ((_c = session.summary) === null || _c === void 0 ? void 0 : _c.resolutionStatus) === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                            "bg-yellow-100 text-yellow-800"}`}>
                      {((_d = session.summary) === null || _d === void 0 ? void 0 : _d.resolutionStatus) || "Pending"}
                    </badge_1.Badge>
                  </div>
                </div>);
            })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
exports.PreSessionBriefing = PreSessionBriefing;
