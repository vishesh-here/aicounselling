'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, Target, AlertTriangle, ArrowRight, 
  MessageSquare, Lightbulb, Clock, User, Heart, Brain,
  CheckCircle, Plus
} from "lucide-react";
import { StoryViewerDialog } from "@/components/knowledge-base/story-viewer-dialog";
import { supabase } from "@/lib/supabaseClient";
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(false);
  const [roadmapTimestamp, setRoadmapTimestamp] = useState<string | null>(null);
  const [showAddConcern, setShowAddConcern] = useState(false);
  const [newConcern, setNewConcern] = useState({ title: "", description: "", category: "", severity: "LOW" });
  const [savingConcern, setSavingConcern] = useState(false);
  const [concerns, setConcerns] = useState(child.concerns || []);

  const activeConcerns = concerns.filter((c: any) => c.status !== "RESOLVED");
  const resolvedConcerns = concerns.filter((c: any) => c.status === "RESOLVED");

  const generateAiRoadmap = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/ai/enhanced-roadmap', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          child_id: child.id,
          action: 'generate'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate roadmap');
      }

      const data = await response.json();
      setAiRoadmap(data.roadmap);
      setRoadmapTimestamp(new Date().toISOString());
      toast.success('Roadmap generated successfully');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestRoadmap = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch(`/api/ai/enhanced-roadmap?child_id=${child.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.roadmap) {
          setAiRoadmap(data.roadmap);
          setRoadmapTimestamp(data.generated_at);
        }
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    }
  };

  const handleAddConcern = async () => {
    setSavingConcern(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch("/api/concerns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
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
        toast.success('Concern added successfully');
      } else {
        console.error("Failed to add concern:", result.error);
        toast.error('Failed to add concern');
      }
    } catch (error) {
      console.error("Error adding concern:", error);
      toast.error('Error adding concern');
    } finally {
      setSavingConcern(false);
    }
  };

  const handleResolveConcern = async (concernId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const response = await fetch(`/api/concerns/${concernId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
      });
      const result = await response.json();
      if (response.ok && result.concern) {
        setConcerns(
          concerns.map((c: any) =>
            c.id === concernId ? result.concern : c
          )
        );
        toast.success('Concern marked as resolved');
      } else {
        console.error("Failed to resolve concern:", result.error);
        toast.error('Failed to resolve concern');
      }
    } catch (err) {
      console.error("Error resolving concern:", err);
      toast.error('Error resolving concern');
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

  useEffect(() => {
    fetchLatestRoadmap();
  }, [child.id]);

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
            <div className="text-xs text-gray-500 mb-2">Last generated: {new Date(roadmapTimestamp).toLocaleString(undefined, {
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
                {/* Session Summary */}
                {aiRoadmap.sessionSummary && (
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        Session Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {aiRoadmap.sessionSummary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Active Concerns */}
                {aiRoadmap.activeConcerns && aiRoadmap.activeConcerns.length > 0 && (
                  <Card className="border-l-4 border-l-red-500 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Active Concerns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiRoadmap.activeConcerns.map((concern: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                            <span className="text-red-600">•</span>
                            <span className="text-sm text-red-800">{concern}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Session Focus */}
                {aiRoadmap.sessionFocus && (
                  <Card className="border-l-4 border-l-green-500 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Session Focus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-green-800 leading-relaxed">
                        {aiRoadmap.sessionFocus}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Recommended Stories */}
                {aiRoadmap.recommendedStories && aiRoadmap.recommendedStories.length > 0 && (
                  <Card className="border-l-4 border-l-orange-500 bg-orange-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-orange-600" />
                        Recommended Stories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiRoadmap.recommendedStories.map((story: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                            <BookOpen className="h-4 w-4 text-orange-600 flex-shrink-0" />
                            {story.id === "no-stories" ? (
                              <span className="text-sm text-gray-500">{story.title}</span>
                            ) : (
                              <StoryViewerDialog story={story}>
                                <Button variant="ghost" className="p-0 h-auto text-left font-normal text-sm text-gray-700 hover:text-orange-600">
                                  {story.title}
                                </Button>
                              </StoryViewerDialog>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Action Items */}
              <div className="space-y-4">
                {/* Key Questions */}
                {aiRoadmap.keyQuestions && aiRoadmap.keyQuestions.length > 0 && (
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        Key Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiRoadmap.keyQuestions.map((question: string, index: number) => (
                          <div key={index} className="p-3 bg-white rounded border-l-2 border-blue-300">
                            <p className="text-sm text-blue-800 leading-relaxed">"{question}"</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Warning Signs */}
                {aiRoadmap.warningSigns && aiRoadmap.warningSigns.length > 0 && (
                  <Card className="border-l-4 border-l-red-500 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Warning Signs to Watch For
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiRoadmap.warningSigns.map((sign: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                            <span className="text-red-600">•</span>
                            <span className="text-sm text-red-800">{sign}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps */}
                {aiRoadmap.nextSteps && aiRoadmap.nextSteps.length > 0 && (
                  <Card className="border-l-4 border-l-green-500 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-green-600" />
                        Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiRoadmap.nextSteps.map((step: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                            <span className="text-green-600">•</span>
                            <span className="text-sm text-green-800">{step}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
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
              {activeConcerns.length > 0 ? (
                <div className="space-y-3">
                  {activeConcerns.map((concern: any) => (
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
