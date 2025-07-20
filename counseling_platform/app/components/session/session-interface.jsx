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
exports.SessionInterface = void 0;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const tabs_1 = require("@/components/ui/tabs");
const textarea_1 = require("@/components/ui/textarea");
const dialog_1 = require("@/components/ui/dialog");
const rich_session_summary_1 = require("./rich-session-summary");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const navigation_1 = require("next/navigation");
const supabaseClient_1 = require("@/lib/supabaseClient");
function SessionInterface({ child, activeSession, userId, userRole }) {
    var _a, _b, _c, _d, _e, _f;
    const [currentSession, setCurrentSession] = (0, react_1.useState)(activeSession);
    const [aiRoadmap, setAiRoadmap] = (0, react_1.useState)(null);
    const [loadingRoadmap, setLoadingRoadmap] = (0, react_1.useState)(false);
    const [sessionNotes, setSessionNotes] = (0, react_1.useState)("");
    const [recommendedStories, setRecommendedStories] = (0, react_1.useState)([]);
    const [selectedStory, setSelectedStory] = (0, react_1.useState)(null);
    const [showRichSummary, setShowRichSummary] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const activeConcerns = ((_a = child.concerns) === null || _a === void 0 ? void 0 : _a.filter((c) => c.status !== "RESOLVED")) || [];
    // Start a new session using Supabase
    const startSession = () => __awaiter(this, void 0, void 0, function* () {
        try {
            // Check for existing session
            const { data: existingSession, error: findError } = yield supabaseClient_1.supabase
                .from('sessions')
                .select('*')
                .eq('child_id', child.id)
                .in('status', ['PLANNED', 'IN_PROGRESS'])
                .maybeSingle();
            if (findError) throw findError;
            if (existingSession) {
                // Update to IN_PROGRESS
                const { data: updatedSession, error: updateError } = yield supabaseClient_1.supabase
                    .from('sessions')
                    .update({ status: 'IN_PROGRESS', startedAt: new Date().toISOString() })
                    .eq('id', existingSession.id)
                    .select()
                    .single();
                if (updateError) throw updateError;
                setCurrentSession(updatedSession);
                sonner_1.toast.success('Session started successfully!');
                router.refresh();
            } else {
                // Create new session
                const { data: newSession, error: createError } = yield supabaseClient_1.supabase
                    .from('sessions')
                    .insert({
                        child_id: child.id,
                        volunteerId: userId,
                        status: 'IN_PROGRESS',
                        sessionType: 'COUNSELING',
                        startedAt: new Date().toISOString(),
                    })
                    .select()
                    .single();
                if (createError) throw createError;
                setCurrentSession(newSession);
                sonner_1.toast.success('Session created and started successfully!');
                router.refresh();
            }
        }
        catch (error) {
            console.error("Error starting session:", error);
            sonner_1.toast.error("Failed to start session");
        }
    });
    // End current session - now shows rich summary form
    const endSession = () => __awaiter(this, void 0, void 0, function* () {
        if (!currentSession)
            return;
        setShowRichSummary(true);
    });
    // Handle saving session summary
    const handleSaveSummary = (summaryData) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/sessions/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: currentSession.id,
                    summaryData,
                    isDraft: true
                })
            });
            if (response.ok) {
                sonner_1.toast.success("Session summary saved as draft");
            }
            else {
                sonner_1.toast.error("Failed to save summary");
            }
        }
        catch (error) {
            console.error("Error saving summary:", error);
            sonner_1.toast.error("Failed to save summary");
        }
    });
    // Handle submitting session summary
    const handleSubmitSummary = (summaryData) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/sessions/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: currentSession.id,
                    summaryData,
                    isDraft: false
                })
            });
            if (response.ok) {
                sonner_1.toast.success("Session ended and summary submitted successfully!");
                router.push(`/children/${child.id}`);
            }
            else {
                sonner_1.toast.error("Failed to submit summary");
            }
        }
        catch (error) {
            console.error("Error submitting summary:", error);
            sonner_1.toast.error("Failed to submit summary");
        }
    });
    // Navigate to AI Mentor
    const openAiMentor = () => {
        router.push(`/ai-mentor/${child.id}`);
    };
    // Generate enhanced AI roadmap
    const generateEnhancedRoadmap = () => __awaiter(this, void 0, void 0, function* () {
        setLoadingRoadmap(true);
        try {
            const response = yield fetch("/api/ai/enhanced-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    child_id: child.id,
                    childProfile: {
                        name: child.name,
                        age: child.age,
                        interests: child.interests,
                        challenges: child.challenges,
                        background: child.background,
                        state: child.state
                    },
                    activeConcerns: activeConcerns.map((c) => ({
                        category: c.category,
                        title: c.title,
                        severity: c.severity,
                        description: c.description
                    }))
                })
            });
            if (response.ok) {
                const data = yield response.json();
                setAiRoadmap(data.roadmap);
                setRecommendedStories(data.recommendedStories || []);
            }
            else {
                sonner_1.toast.error("Failed to generate roadmap");
            }
        }
        catch (error) {
            console.error("Failed to generate roadmap:", error);
            sonner_1.toast.error("Failed to generate roadmap");
        }
        finally {
            setLoadingRoadmap(false);
        }
    });
    // Load story details
    const loadStoryDetails = (storyId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`/api/stories/${storyId}`);
            if (response.ok) {
                const story = yield response.json();
                setSelectedStory(story);
            }
        }
        catch (error) {
            console.error("Failed to load story:", error);
        }
    });
    return (<div className="space-y-6">
      {/* Session Controls */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <lucide_react_1.MessageCircle className="h-5 w-5"/>
              Session Control
            </span>
            <div className="flex items-center gap-2">
              {currentSession ? (<>
                  {currentSession.status === "PLANNED" && (<button_1.Button onClick={startSession} className="bg-green-600 hover:bg-green-700">
                      <lucide_react_1.PlayCircle className="h-4 w-4 mr-2"/>
                      Start Session
                    </button_1.Button>)}
                  {currentSession.status === "IN_PROGRESS" && (<>
                      <button_1.Button onClick={openAiMentor} variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                        <lucide_react_1.Bot className="h-4 w-4 mr-2"/>
                        AI Mentor
                        <lucide_react_1.ExternalLink className="h-3 w-3 ml-1"/>
                      </button_1.Button>
                      <button_1.Button onClick={endSession} variant="destructive">
                        <lucide_react_1.StopCircle className="h-4 w-4 mr-2"/>
                        End Session
                      </button_1.Button>
                    </>)}
                </>) : (<button_1.Button onClick={startSession} className="bg-blue-600 hover:bg-blue-700">
                  <lucide_react_1.PlayCircle className="h-4 w-4 mr-2"/>
                  Start First Session
                </button_1.Button>)}
            </div>
          </card_1.CardTitle>
        </card_1.CardHeader>
        {currentSession && (<card_1.CardContent>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <lucide_react_1.Clock className="h-4 w-4"/>
                Started: {currentSession.startedAt ? new Date(currentSession.startedAt).toLocaleString() : "Not started"}
              </span>
              <badge_1.Badge variant="outline">
                {currentSession.sessionType}
              </badge_1.Badge>
            </div>
          </card_1.CardContent>)}
      </card_1.Card>

      <tabs_1.Tabs defaultValue="roadmap" className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="roadmap" className="flex items-center gap-2">
            <lucide_react_1.Brain className="h-4 w-4"/>
            Enhanced Roadmap
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="stories" className="flex items-center gap-2">
            <lucide_react_1.BookOpen className="h-4 w-4"/>
            Cultural Stories
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="summary" className="flex items-center gap-2">
            <lucide_react_1.FileText className="h-4 w-4"/>
            Session Summary
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="roadmap">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle>AI-Enhanced Session Roadmap</card_1.CardTitle>
                <button_1.Button onClick={generateEnhancedRoadmap} disabled={loadingRoadmap} className="bg-purple-600 hover:bg-purple-700">
                  {loadingRoadmap ? "Generating..." : "Generate Enhanced Roadmap"}
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              {aiRoadmap ? (<div className="space-y-6">
                  {/* Pre-Session Preparation */}
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-900 mb-2">Pre-Session Preparation</h4>
                    <p className="text-blue-800 text-sm">{aiRoadmap.preSessionPrep}</p>
                  </div>

                  {/* Session Objectives */}
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-medium text-green-900 mb-2">Session Objectives</h4>
                    <ul className="space-y-1">
                      {(_b = aiRoadmap.sessionObjectives) === null || _b === void 0 ? void 0 : _b.map((objective, index) => (<li key={index} className="text-green-800 text-sm flex items-start gap-2">
                          <lucide_react_1.CheckCircle className="h-3 w-3 text-green-600 mt-1 shrink-0"/>
                          {objective}
                        </li>))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Warning Signs */}
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <h4 className="font-medium text-red-900 mb-2">Warning Signs to Watch</h4>
                      <ul className="space-y-1">
                        {(_c = aiRoadmap.warningSigns) === null || _c === void 0 ? void 0 : _c.map((sign, index) => (<li key={index} className="text-red-800 text-sm flex items-start gap-2">
                            <lucide_react_1.AlertTriangle className="h-3 w-3 text-red-600 mt-1 shrink-0"/>
                            {sign}
                          </li>))}
                      </ul>
                    </div>

                    {/* Success Indicators */}
                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-medium text-purple-900 mb-2">Success Indicators</h4>
                      <ul className="space-y-1">
                        {(_d = aiRoadmap.successIndicators) === null || _d === void 0 ? void 0 : _d.map((indicator, index) => (<li key={index} className="text-purple-800 text-sm flex items-start gap-2">
                            <lucide_react_1.CheckCircle className="h-3 w-3 text-purple-600 mt-1 shrink-0"/>
                            {indicator}
                          </li>))}
                      </ul>
                    </div>
                  </div>

                  {/* Conversation Starters */}
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-medium text-yellow-900 mb-2">Conversation Starters</h4>
                    <div className="space-y-2">
                      {(_e = aiRoadmap.conversationStarters) === null || _e === void 0 ? void 0 : _e.map((starter, index) => (<div key={index} className="text-yellow-800 text-sm p-2 bg-white rounded border">
                          "{starter}"
                        </div>))}
                    </div>
                  </div>

                  {/* Cultural Context & Follow-up Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                      <h4 className="font-medium text-indigo-900 mb-2">Cultural Context</h4>
                      <p className="text-indigo-800 text-sm">{aiRoadmap.culturalContext}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                      <h4 className="font-medium text-gray-900 mb-2">Follow-up Actions</h4>
                      <ul className="space-y-1">
                        {(_f = aiRoadmap.followUpActions) === null || _f === void 0 ? void 0 : _f.map((action, index) => (<li key={index} className="text-gray-800 text-sm flex items-start gap-2">
                            <lucide_react_1.CheckCircle className="h-3 w-3 text-gray-600 mt-1 shrink-0"/>
                            {action}
                          </li>))}
                      </ul>
                    </div>
                  </div>
                </div>) : (<div className="text-center py-8 text-gray-500">
                  <lucide_react_1.Brain className="h-8 w-8 mx-auto mb-2 text-gray-400"/>
                  <p>Click "Generate Enhanced Roadmap" to get comprehensive session guidance</p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="stories">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Recommended Cultural Stories</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              {recommendedStories.length > 0 ? (<div className="space-y-4">
                  {recommendedStories.map((story, index) => {
                var _a, _b;
                return (<div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">{story.title}</h4>
                          <p className="text-sm text-blue-800 mb-2">{story.relevance}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(_a = story.themes) === null || _a === void 0 ? void 0 : _a.map((theme, themeIndex) => (<badge_1.Badge key={themeIndex} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                {theme}
                              </badge_1.Badge>))}
                          </div>
                        </div>
                        <dialog_1.Dialog>
                          <dialog_1.DialogTrigger asChild>
                            <button_1.Button size="sm" variant="outline" onClick={() => story.id && loadStoryDetails(story.id)}>
                              View Story
                            </button_1.Button>
                          </dialog_1.DialogTrigger>
                          <dialog_1.DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <dialog_1.DialogHeader>
                              <dialog_1.DialogTitle>{(selectedStory === null || selectedStory === void 0 ? void 0 : selectedStory.title) || story.title}</dialog_1.DialogTitle>
                            </dialog_1.DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Summary</h4>
                                <p className="text-sm text-gray-600">{(selectedStory === null || selectedStory === void 0 ? void 0 : selectedStory.summary) || story.summary}</p>
                              </div>
                              {(selectedStory === null || selectedStory === void 0 ? void 0 : selectedStory.fullStory) && (<div>
                                  <h4 className="font-medium mb-2">Full Story</h4>
                                  <div className="text-sm text-gray-700 space-y-2 max-h-60 overflow-y-auto bg-gray-50 p-3 rounded">
                                    {selectedStory.fullStory.split('\n').map((paragraph, idx) => (<p key={idx}>{paragraph}</p>))}
                                  </div>
                                </div>)}
                              <div>
                                <h4 className="font-medium mb-2">Themes & Lessons</h4>
                                <div className="flex flex-wrap gap-1">
                                  {(_b = ((selectedStory === null || selectedStory === void 0 ? void 0 : selectedStory.themes) || story.themes)) === null || _b === void 0 ? void 0 : _b.map((theme, idx) => (<badge_1.Badge key={idx} variant="secondary">{theme}</badge_1.Badge>))}
                                </div>
                              </div>
                            </div>
                          </dialog_1.DialogContent>
                        </dialog_1.Dialog>
                      </div>
                    </div>);
            })}
                </div>) : (<div className="text-center py-8 text-gray-500">
                  <lucide_react_1.BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400"/>
                  <p>Generate a roadmap first to see recommended stories</p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="summary">
          {(currentSession === null || currentSession === void 0 ? void 0 : currentSession.status) === "IN_PROGRESS" ? (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Session Notes</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <textarea_1.Textarea placeholder="Record quick notes during the session. Use 'End Session' to complete a comprehensive summary..." value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} rows={8}/>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    💡 Quick notes only. Complete the rich summary when ending the session.
                  </p>
                  <button_1.Button onClick={() => sonner_1.toast.success("Notes saved!")} variant="outline" size="sm">
                    Save Notes
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>) : (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Session Summary</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-center py-8 text-gray-500">
                  <lucide_react_1.FileText className="h-8 w-8 mx-auto mb-2 text-gray-400"/>
                  <p>Session summary will be available after the session is completed</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>)}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Rich Session Summary Dialog */}
      {showRichSummary && currentSession && (<dialog_1.Dialog open={showRichSummary} onOpenChange={setShowRichSummary}>
          <dialog_1.DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Complete Session Summary</dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <rich_session_summary_1.RichSessionSummary sessionId={currentSession.id} child_id={child.id} childName={child.name} sessionStartTime={new Date(currentSession.startedAt || currentSession.createdAt)} onSave={handleSaveSummary} onSubmit={handleSubmitSummary}/>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>)}
    </div>);
}
exports.SessionInterface = SessionInterface;
