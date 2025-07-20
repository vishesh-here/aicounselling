"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Lightbulb, BookOpen, Target, Star, 
  TrendingUp, AlertTriangle, CheckCircle 
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";

interface PreSessionBriefingProps {
  child: any;
}

const CONCERN_CATEGORIES = [
  "ACADEMIC",
  "FAMILY",
  "EMOTIONAL",
  "BEHAVIORAL",
  "CAREER",
  "SOCIAL",
  "HEALTH",
  "FINANCIAL",
];

export function PreSessionBriefing({ child }: PreSessionBriefingProps) {
  const [aiRoadmap, setAiRoadmap] = useState<any>(null);
  const [roadmapTimestamp, setRoadmapTimestamp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddConcern, setShowAddConcern] = useState(false);
  const [newConcern, setNewConcern] = useState({ title: "", description: "", category: "", severity: "LOW" });
  const [savingConcern, setSavingConcern] = useState(false);
  const [concerns, setConcerns] = useState(child.concerns || []);

  const activeConcerns = child.concerns?.filter((c: any) => c.status !== "RESOLVED") || [];
  const recentSessions = child.sessions?.slice(0, 3) || [];

  const openConcerns = concerns.filter((c: any) => c.status !== "RESOLVED");
  const resolvedConcerns = concerns.filter((c: any) => c.status === "RESOLVED");

  useEffect(() => {
    const fetchPersistedRoadmap = async () => {
      try {
        const params = new URLSearchParams({ child_id: child.id });
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
  }, [child.id]);

  // Generate AI roadmap based on child's profile and concerns
  const generateAiRoadmap = async () => {
    setLoading(true);
    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch("/api/ai/enhanced-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          child_id: child.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiRoadmap(data.roadmap);
        setRoadmapTimestamp(data.generated_at || null);
      } else {
        console.error("Failed to generate roadmap:", await response.text());
      }
    } catch (error) {
      console.error("Failed to generate AI roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
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

  const handleAddConcern = async () => {
    setSavingConcern(true);
    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      const response = await fetch("/api/concerns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          child_id: child.id,
          title: newConcern.title,
          description: newConcern.description,
          category: newConcern.category,
          severity: newConcern.severity,
        }),
      });
      const result = await response.json();
      if (response.ok && result.concern) {
        setConcerns([...concerns, result.concern]);
        setNewConcern({ title: "", description: "", category: "", severity: "LOW" });
        setShowAddConcern(false);
      } else {
        console.error("Failed to add concern:", result.error);
      }
    } catch (error) {
      console.error("Error adding concern:", error);
    } finally {
      setSavingConcern(false);
    }
  };

  const handleResolveConcern = async (concernId: string) => {
    try {
      // Get Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      const response = await fetch(`/api/concerns/${concernId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
      });
      const result = await response.json();
      if (response.ok && result.concern) {
        setConcerns(
          concerns.map((c: any) =>
            c.id === concernId ? result.concern : c
          )
        );
      } else {
        console.error("Failed to resolve concern:", result.error);
      }
    } catch (err) {
      console.error("Error resolving concern:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI-Generated Session Roadmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI-Generated Session Roadmap
            </CardTitle>
            <Button 
              onClick={generateAiRoadmap}
              disabled={loading}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Generating..." : "Generate Roadmap"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {roadmapTimestamp && (
            <div className="text-xs text-gray-500 mb-2">Last generated: {new Date(roadmapTimestamp).toLocaleString()}</div>
          )}
          {aiRoadmap ? (
            <div className="space-y-6">
              {/* Pre-Session Preparation */}
              {aiRoadmap.preSessionPrep && (
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Pre-Session Preparation
                  </h4>
                  <p className="text-purple-800 text-sm">{aiRoadmap.preSessionPrep}</p>
                </div>
              )}

              {/* Session Objectives */}
              {aiRoadmap.sessionObjectives && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Session Objectives
                    </h4>
                    <ul className="space-y-1">
                      {aiRoadmap.sessionObjectives.map((goal: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-1 shrink-0" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Warning Signs */}
                  {aiRoadmap.warningSigns && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Warning Signs
                      </h4>
                      <ul className="space-y-1">
                        {aiRoadmap.warningSigns.map((sign: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-500 mt-1 shrink-0" />
                            {sign}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Conversation Starters */}
              {aiRoadmap.conversationStarters && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Conversation Starters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiRoadmap.conversationStarters.map((starter: string, index: number) => (
                      <div key={index} className="p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                        <p className="text-sm text-blue-800">"{starter}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Approach & Cultural Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRoadmap.recommendedApproach && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Recommended Approach</h4>
                    <p className="text-sm text-green-800">{aiRoadmap.recommendedApproach}</p>
                  </div>
                )}

                {aiRoadmap.culturalContext && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Cultural Context</h4>
                    <p className="text-sm text-orange-800">{aiRoadmap.culturalContext}</p>
                  </div>
                )}
              </div>

              {/* Expected Challenges */}
              {aiRoadmap.expectedChallenges && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Expected Challenges & Solutions
                  </h4>
                  <div className="space-y-2">
                    {aiRoadmap.expectedChallenges.map((challenge: string, index: number) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded border-l-2 border-yellow-300">
                        <p className="text-sm text-yellow-800">{challenge}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Indicators & Follow-up Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRoadmap.successIndicators && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Success Indicators
                    </h4>
                    <ul className="space-y-1">
                      {aiRoadmap.successIndicators.map((indicator: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <Star className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiRoadmap.followUpActions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Follow-up Actions
                    </h4>
                    <ul className="space-y-1">
                      {aiRoadmap.followUpActions.map((action: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-blue-500 mt-1 shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Stories */}
              {aiRoadmap.recommendedStories && aiRoadmap.recommendedStories.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Recommended Cultural Stories
                  </h4>
                  <div className="space-y-2">
                    {aiRoadmap.recommendedStories.map((storyTitle: string, index: number) => (
                      <div key={index} className="text-orange-800 text-sm p-2 bg-white rounded border">
                        📖 {storyTitle}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Click "Generate Roadmap" to get AI-powered session recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Concerns Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Concerns Management
          </CardTitle>
          <Dialog open={showAddConcern} onOpenChange={setShowAddConcern}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="ml-2">Add Concern</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Concern</DialogTitle>
                <DialogDescription>Document a new concern for this child.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Title"
                  value={newConcern.title}
                  onChange={e => setNewConcern({ ...newConcern, title: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newConcern.description}
                  onChange={e => setNewConcern({ ...newConcern, description: e.target.value })}
                />
                <select
                  className="w-full border rounded p-2"
                  value={newConcern.category}
                  onChange={e => setNewConcern({ ...newConcern, category: e.target.value })}
                >
                  <option value="" disabled>Select Category</option>
                  {CONCERN_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  className="w-full border rounded p-2"
                  value={newConcern.severity}
                  onChange={e => setNewConcern({ ...newConcern, severity: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <DialogFooter>
                <Button onClick={handleAddConcern} disabled={savingConcern || !newConcern.title}>
                  {savingConcern ? "Saving..." : "Add Concern"}
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open" className="w-full">
            <TabsList>
              <TabsTrigger value="open">Open Concerns</TabsTrigger>
              <TabsTrigger value="resolved">Resolved Concerns</TabsTrigger>
            </TabsList>
            <TabsContent value="open">
              {openConcerns.length > 0 ? (
                <div className="space-y-3">
                  {openConcerns.map((concern: any) => (
                    <div
                      key={concern.id}
                      className={`p-4 rounded-lg border-l-4 ${getSeverityColor(concern.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{concern.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{concern.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {concern.category}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${concern.severity === "HIGH" ? "bg-red-100 text-red-800" :
                                concern.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-green-100 text-green-800"}`}
                            >
                              {concern.severity}
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleResolveConcern(concern.id)}>
                            Mark as Resolved
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No open concerns - great progress!</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="resolved">
              {resolvedConcerns.length > 0 ? (
                <div className="space-y-3">
                  {resolvedConcerns.map((concern: any) => (
                    <div
                      key={concern.id}
                      className="p-4 rounded-lg border-l-4 border-l-green-500 bg-green-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{concern.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{concern.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {concern.category}
                            </Badge>
                            <Badge className="text-xs bg-green-100 text-green-800">
                              {concern.severity}
                            </Badge>
                            <Badge className="text-xs bg-green-100 text-green-800">
                              RESOLVED
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Resolved on {concern.resolvedAt ? new Date(concern.resolvedAt).toLocaleDateString() : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No resolved concerns yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
