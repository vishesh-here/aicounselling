"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionSummaryForm } from "./SessionSummaryForm";
import { 
  PlayCircle, StopCircle, CheckCircle, Clock, 
  Brain, BookOpen, MessageCircle, AlertTriangle, FileText, Bot, ExternalLink,
  History, Target, HelpCircle, TrendingUp, MessageSquare, Lightbulb, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { StoryViewerDialog } from "@/components/knowledge-base/story-viewer-dialog";
import { format } from "date-fns";

interface SessionInterfaceProps {
  child: any;
  activeSession: any;
  userId: string;
  userRole: string;
}

export function SessionInterface({ child, activeSession, userId, userRole }: SessionInterfaceProps) {
  const [currentSession, setCurrentSession] = useState(activeSession);
  const [aiRoadmap, setAiRoadmap] = useState<any>(null);
  const [roadmapTimestamp, setRoadmapTimestamp] = useState<string | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [recommendedStories, setRecommendedStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [showRichSummary, setShowRichSummary] = useState(false);
  
  const router = useRouter();

  const activeConcerns = child.concerns?.filter((c: any) => c.status !== "RESOLVED") || [];

  useEffect(() => {
    const fetchPersistedRoadmap = async () => {
      try {
        const params = new URLSearchParams({ child_id: child.id });
        if (currentSession?.id) params.append('session_id', currentSession.id);
        const response = await fetch(`/api/ai/enhanced-roadmap?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.roadmap) {
            setAiRoadmap(data.roadmap);
            setRoadmapTimestamp(data.generated_at || null);
          }
        }
      } catch (err) {}
    };
    fetchPersistedRoadmap();
  }, [child.id, currentSession?.id]);

  // Start a new session using API
  const startSession = async () => {
    if (!child || !child.id) {
      toast.error("Child data not available");
      return;
    }
    
    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      console.log('Starting session for child:', child.id, child.fullName);
      
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          child_id: child.id,
          action: "start"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        
        // Update roadmap with session ID
        try {
          const roadmapResponse = await fetch("/api/ai/enhanced-roadmap", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
            },
            body: JSON.stringify({
              child_id: child.id,
              session_id: data.session.id,
              action: "update_session"
            })
          });
          
          if (roadmapResponse.ok) {
            console.log('Roadmap updated with session ID');
          }
        } catch (error) {
          console.error('Failed to update roadmap with session ID:', error);
        }
        
        toast.success("Session started successfully!");
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to start session");
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  // End current session - now shows rich summary form
  const endSession = async () => {
    if (!currentSession) return;
    setShowRichSummary(true);
  };

  // Save session summary (draft or final) using API route
  const saveSessionSummary = async (summaryData: any, isDraft: boolean) => {
    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      const response = await fetch("/api/sessions/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
          summaryData: {
            ...summaryData,
            summary: summaryData.summary || "",
          },
          isDraft
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save summary');
      }

      const result = await response.json();
      toast.success(isDraft ? 'Session summary saved as draft' : 'Session ended and summary submitted successfully!');
      if (!isDraft) router.push(`/children/${child.id}`);
    } catch (error) {
      console.error('Error saving session summary:', error);
      toast.error('Failed to save summary');
    }
  };

  // Handle saving session summary (draft)
  const handleSaveSummary = async (summaryData: any) => {
    await saveSessionSummary(summaryData, true);
  };

  // Handle submitting session summary (final)
  const handleSubmitSummary = async (summaryData: any) => {
    await saveSessionSummary(summaryData, false);
  };

  // Navigate to AI Mentor
  const openAiMentor = () => {
    if (currentSession?.id) {
      router.push(`/ai-mentor/${child.id}/${currentSession.id}`);
    } else {
      router.push(`/ai-mentor/${child.id}`);
    }
  };

  // Generate enhanced AI roadmap
  const generateEnhancedRoadmap = async () => {
    if (!child || !child.id) {
      toast.error("Child data not available");
      return;
    }
    
    setLoadingRoadmap(true);
    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      console.log('Generating roadmap for child:', child.id, child.fullName);
      
      const response = await fetch("/api/ai/enhanced-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          child_id: child.id,
          session_id: currentSession?.id || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiRoadmap(data.roadmap);
        setRoadmapTimestamp(data.generated_at || null);
        setRecommendedStories(data.recommendedStories || []);
      } else {
        toast.error("Failed to generate roadmap");
      }
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      toast.error("Failed to generate roadmap");
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Load story details
  const loadStoryDetails = async (storyId: string) => {
    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      const response = await fetch(`/api/stories/${storyId}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });
      if (response.ok) {
        const story = await response.json();
        setSelectedStory(story);
      } else {
        console.error("Failed to load story:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to load story:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Session Control
            </span>
            <div className="flex items-center gap-2">
              {!child || !child.id ? (
                <div className="text-sm text-gray-500">Loading child data...</div>
              ) : currentSession ? (
                <>
                  {currentSession.status === "PLANNED" && (
                    <Button onClick={startSession} className="bg-green-600 hover:bg-green-700">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                  )}
                  {currentSession.status === "IN_PROGRESS" && (
                    <>
                      <Button 
                        onClick={openAiMentor}
                        variant="outline"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        AI Mentor
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                      <Button onClick={endSession} variant="destructive">
                        <StopCircle className="h-4 w-4 mr-2" />
                        End Session
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Button onClick={startSession} className="bg-blue-600 hover:bg-blue-700">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start First Session
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        {currentSession && (
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Started: {currentSession.startedAt ? new Date(currentSession.startedAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }) : "Not started"}
              </span>
              <Badge variant="outline">
                {currentSession.sessionType}
              </Badge>
            </div>
          </CardContent>
        )}
      </Card>

      {/* AI-Enhanced Session Roadmap - Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Enhanced Session Roadmap
            </CardTitle>
            {!child || !child.id ? (
              <div className="text-sm text-gray-500">Loading child data...</div>
            ) : (
              <Button 
                onClick={generateEnhancedRoadmap}
                disabled={loadingRoadmap}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loadingRoadmap ? "Generating..." : "Generate Enhanced Roadmap"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {roadmapTimestamp && (
            <div className="text-xs text-gray-500 mb-4">Last generated: {new Date(roadmapTimestamp).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}</div>
          )}
          {aiRoadmap ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Key Information */}
              <div className="space-y-4">
                {/* Session Summary - Most Important */}
                {aiRoadmap.sessionSummary && (
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Previous Session Summary
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{aiRoadmap.sessionSummary}</p>
                  </div>
                )}

                {/* Active Concerns - Highlighted */}
                {aiRoadmap.activeConcerns && aiRoadmap.activeConcerns.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Current Active Concerns
                    </h4>
                    <ul className="space-y-1">
                      {aiRoadmap.activeConcerns.map((concern: string, index: number) => (
                        <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-600 mt-1 shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Session Focus */}
                {aiRoadmap.sessionFocus && (
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Session Focus
                    </h4>
                    <p className="text-green-800 text-sm leading-relaxed">{aiRoadmap.sessionFocus}</p>
                  </div>
                )}

                {/* Recommended Stories */}
                {aiRoadmap.recommendedStories && aiRoadmap.recommendedStories.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Recommended Stories
                    </h4>
                    <div className="space-y-2">
                      {aiRoadmap.recommendedStories.map((story: any, index: number) => (
                        <div key={index} className="text-orange-800 text-sm p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-orange-600" />
                            {story.id === "no-stories" ? (
                              <span className="text-gray-500">{story.title}</span>
                            ) : (
                              <StoryViewerDialog story={story}>
                                <Button variant="ghost" className="p-0 h-auto text-left font-normal text-sm text-gray-700 hover:text-orange-600">
                                  {story.title}
                                </Button>
                              </StoryViewerDialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Action Items */}
              <div className="space-y-4">
                {/* Key Questions */}
                {aiRoadmap.keyQuestions && (
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Key Questions to Ask
                    </h4>
                    <div className="space-y-2">
                      {aiRoadmap.keyQuestions.map((question: string, index: number) => (
                        <div key={index} className="p-3 bg-white rounded border-l-2 border-blue-300">
                          <p className="text-sm text-blue-800 leading-relaxed">"{question}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warning Signs */}
                {aiRoadmap.warningSigns && (
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Warning Signs to Watch
                    </h4>
                    <ul className="space-y-2">
                      {aiRoadmap.warningSigns.map((sign: string, index: number) => (
                        <li key={index} className="text-sm text-red-800 flex items-start gap-2 p-2 bg-white rounded">
                          <AlertTriangle className="h-3 w-3 text-red-500 mt-1 shrink-0" />
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {aiRoadmap.nextSteps && (
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Next Steps for This Session
                    </h4>
                    <ul className="space-y-2">
                      {aiRoadmap.nextSteps.map((step: string, index: number) => (
                        <li key={index} className="text-sm text-green-800 flex items-start gap-2 p-2 bg-white rounded">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">No roadmap generated yet</p>
              <p className="text-sm">Click "Generate Enhanced Roadmap" to get AI-powered session recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rich Session Summary Dialog */}
      {showRichSummary && currentSession && (
        <Dialog open={showRichSummary} onOpenChange={setShowRichSummary}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-8 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Session Summary</DialogTitle>
            </DialogHeader>
            <SessionSummaryForm
              existingConcerns={activeConcerns}
              onSubmit={async (formData) => {
                await saveSessionSummary(formData, false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
