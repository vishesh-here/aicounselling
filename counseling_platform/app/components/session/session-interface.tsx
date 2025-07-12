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
  Brain, BookOpen, MessageCircle, AlertTriangle, FileText, Bot, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface SessionInterfaceProps {
  child: any;
  activeSession: any;
  userId: string;
  userRole: string;
}

export function SessionInterface({ child, activeSession, userId, userRole }: SessionInterfaceProps) {
  const [currentSession, setCurrentSession] = useState(activeSession);
  const [aiRoadmap, setAiRoadmap] = useState<any>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [recommendedStories, setRecommendedStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [showRichSummary, setShowRichSummary] = useState(false);
  
  const router = useRouter();

  const activeConcerns = child.concerns?.filter((c: any) => c.status !== "RESOLVED") || [];

  // Start a new session using Supabase
  const startSession = async () => {
    try {
      // Check for existing session
      const { data: existingSession, error: findError } = await supabase
        .from('sessions')
        .select('*')
        .eq('child_id', child.id)
        .in('status', ['PLANNED', 'IN_PROGRESS'])
        .maybeSingle();
      if (findError) throw findError;
      if (existingSession) {
        // Update to IN_PROGRESS
        const { data: updatedSession, error: updateError } = await supabase
          .from('sessions')
          .update({ status: 'IN_PROGRESS', startedAt: new Date().toISOString() })
          .eq('id', existingSession.id)
          .select()
          .single();
        if (updateError) throw updateError;
        setCurrentSession(updatedSession);
        toast.success('Session started successfully!');
        router.refresh();
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
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
        toast.success('Session created and started successfully!');
        router.refresh();
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

  // Save session summary (draft or final) using Supabase
  const saveSessionSummary = async (summaryData: any, isDraft: boolean) => {
    try {
      // Upsert session summary
      const { data: existingSummary, error: findError } = await supabase
        .from('session_summaries')
        .select('*')
        .eq('sessionId', currentSession.id)
        .maybeSingle();
      if (findError) throw findError;
      const summaryPayload = {
        sessionId: currentSession.id,
        ...summaryData,
        summary: summaryData.summary || "",
      };
      let result;
      if (existingSummary) {
        result = await supabase
          .from('session_summaries')
          .update(summaryPayload)
          .eq('sessionId', currentSession.id);
      } else {
        result = await supabase
          .from('session_summaries')
          .insert(summaryPayload);
      }
      if (result.error) throw result.error;
      // If this is a final submission, update the session row as well
      if (!isDraft) {
        const now = new Date().toISOString();
        const { error: sessionUpdateError } = await supabase
          .from('sessions')
          .update({
            status: 'COMPLETED',
            endedAt: now,
            updatedAt: now
          })
          .eq('id', currentSession.id);
        if (sessionUpdateError) throw sessionUpdateError;
      }
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
    router.push(`/ai-mentor/${child.id}`);
  };

  // Generate enhanced AI roadmap
  const generateEnhancedRoadmap = async () => {
    setLoadingRoadmap(true);
    try {
      const response = await fetch("/api/ai/enhanced-roadmap", {
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
          activeConcerns: activeConcerns.map((c: any) => ({
            category: c.category,
            title: c.title,
            severity: c.severity,
            description: c.description
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiRoadmap(data.roadmap);
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
      const response = await fetch(`/api/stories/${storyId}`);
      if (response.ok) {
        const story = await response.json();
        setSelectedStory(story);
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
              {currentSession ? (
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
                Started: {currentSession.startedAt ? new Date(currentSession.startedAt).toLocaleString() : "Not started"}
              </span>
              <Badge variant="outline">
                {currentSession.sessionType}
              </Badge>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="roadmap" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roadmap" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Enhanced Roadmap
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Cultural Stories
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Session Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI-Enhanced Session Roadmap</CardTitle>
                <Button 
                  onClick={generateEnhancedRoadmap}
                  disabled={loadingRoadmap}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loadingRoadmap ? "Generating..." : "Generate Enhanced Roadmap"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {aiRoadmap ? (
                <div className="space-y-6">
                  {/* Pre-Session Preparation */}
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-900 mb-2">Pre-Session Preparation</h4>
                    <p className="text-blue-800 text-sm">{aiRoadmap.preSessionPrep}</p>
                  </div>

                  {/* Session Objectives */}
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-medium text-green-900 mb-2">Session Objectives</h4>
                    <ul className="space-y-1">
                      {aiRoadmap.sessionObjectives?.map((objective: string, index: number) => (
                        <li key={index} className="text-green-800 text-sm flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-1 shrink-0" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Warning Signs */}
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <h4 className="font-medium text-red-900 mb-2">Warning Signs to Watch</h4>
                      <ul className="space-y-1">
                        {aiRoadmap.warningSigns?.map((sign: string, index: number) => (
                          <li key={index} className="text-red-800 text-sm flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-600 mt-1 shrink-0" />
                            {sign}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Success Indicators */}
                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-medium text-purple-900 mb-2">Success Indicators</h4>
                      <ul className="space-y-1">
                        {aiRoadmap.successIndicators?.map((indicator: string, index: number) => (
                          <li key={index} className="text-purple-800 text-sm flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-purple-600 mt-1 shrink-0" />
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Conversation Starters */}
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-medium text-yellow-900 mb-2">Conversation Starters</h4>
                    <div className="space-y-2">
                      {aiRoadmap.conversationStarters?.map((starter: string, index: number) => (
                        <div key={index} className="text-yellow-800 text-sm p-2 bg-white rounded border">
                          "{starter}"
                        </div>
                      ))}
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
                        {aiRoadmap.followUpActions?.map((action: string, index: number) => (
                          <li key={index} className="text-gray-800 text-sm flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-gray-600 mt-1 shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Click "Generate Enhanced Roadmap" to get comprehensive session guidance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stories">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Cultural Stories</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendedStories.length > 0 ? (
                <div className="space-y-4">
                  {recommendedStories.map((story, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">{story.title}</h4>
                          <p className="text-sm text-blue-800 mb-2">{story.relevance}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {story.themes?.map((theme: string, themeIndex: number) => (
                              <Badge key={themeIndex} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => story.id && loadStoryDetails(story.id)}
                            >
                              View Story
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{selectedStory?.title || story.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Summary</h4>
                                <p className="text-sm text-gray-600">{selectedStory?.summary || story.summary}</p>
                              </div>
                              {selectedStory?.fullStory && (
                                <div>
                                  <h4 className="font-medium mb-2">Full Story</h4>
                                  <div className="text-sm text-gray-700 space-y-2 max-h-60 overflow-y-auto bg-gray-50 p-3 rounded">
                                    {selectedStory.fullStory.split('\n').map((paragraph: string, idx: number) => (
                                      <p key={idx}>{paragraph}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div>
                                <h4 className="font-medium mb-2">Themes & Lessons</h4>
                                <div className="flex flex-wrap gap-1">
                                  {(selectedStory?.themes || story.themes)?.map((theme: string, idx: number) => (
                                    <Badge key={idx} variant="secondary">{theme}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Generate a roadmap first to see recommended stories</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          {currentSession?.status === "IN_PROGRESS" ? (
            <Card>
              <CardHeader>
                <CardTitle>Session Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Record quick notes during the session. Use 'End Session' to complete a comprehensive summary..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={8}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    💡 Quick notes only. Complete the rich summary when ending the session.
                  </p>
                  <Button 
                    onClick={() => toast.success("Notes saved!")}
                    variant="outline"
                    size="sm"
                  >
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Session Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Session summary will be available after the session is completed</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
