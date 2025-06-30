
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Clock, Heart, MessageCircle, 
  Lightbulb, Target, BookOpen, TrendingUp, 
  User, Calendar, CheckCircle, AlertTriangle,
  Brain, Star, Activity, ClipboardList
} from "lucide-react";
import { format } from "date-fns";

interface SessionSummaryDetailsDialogProps {
  session: any;
  trigger: React.ReactNode;
}

export function SessionSummaryDetailsDialog({ session, trigger }: SessionSummaryDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const summary = session.summary;

  if (!summary) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Summary</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No detailed summary available for this session.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "ESCALATED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getEffectivenessColor = (rating: string) => {
    const num = parseInt(rating);
    if (num >= 4) return "text-green-600";
    if (num >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detailed Session Summary
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(summary.resolutionStatus)}>
                {summary.resolutionStatus}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(session.createdAt), "PPP")}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {session.volunteer?.name || "Unknown Volunteer"}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {summary.sessionDuration || "Duration not recorded"}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mood">Mood & State</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="techniques">Techniques</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Session Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Session Summary</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{summary.summary}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Session Type</h4>
                    <Badge variant="outline">{summary.sessionType || session.sessionType}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Engagement Level</h4>
                    <span className={`font-medium ${getEngagementColor(summary.engagementLevel)}`}>
                      {summary.engagementLevel || "Not assessed"}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Session Effectiveness</h4>
                    <span className={`font-medium ${getEffectivenessColor(summary.sessionEffectiveness)}`}>
                      {summary.sessionEffectiveness ? `${summary.sessionEffectiveness}/5` : "Not rated"}
                    </span>
                  </div>
                </div>

                {summary.participationNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Participation Notes</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{summary.participationNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mood & State Tab */}
          <TabsContent value="mood" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Mood & Emotional State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Initial Mood</h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                      {summary.initialMood || "Not recorded"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Final Mood</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                      {summary.finalMood || "Not recorded"}
                    </p>
                  </div>
                </div>

                {summary.moodChanges && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Mood Changes During Session</h4>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{summary.moodChanges}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Session Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.topicsDiscussed?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Topics Discussed</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.topicsDiscussed.map((topic: string, index: number) => (
                        <Badge key={index} variant="secondary">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {summary.concernsDiscussed?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Concerns Addressed</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.concernsDiscussed.map((concern: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-orange-50 text-orange-800">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Techniques Tab */}
          <TabsContent value="techniques" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Techniques & Cultural Elements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.techniquesUsed?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Counseling Techniques Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.techniquesUsed.map((technique: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                          {technique}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {summary.culturalStoriesUsed?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cultural Stories Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.culturalStoriesUsed.map((story: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {story}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {summary.storyResponse && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Response to Cultural Stories</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{summary.storyResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Insights & Breakthroughs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.breakthroughs && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Breakthroughs & Key Moments
                    </h4>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                      {summary.breakthroughs}
                    </p>
                  </div>
                )}

                {summary.keyInsights && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Insights About the Child</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{summary.keyInsights}</p>
                  </div>
                )}

                {summary.challengesFaced && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Challenges Faced
                    </h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg">{summary.challengesFaced}</p>
                  </div>
                )}

                {summary.challengeHandling && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How Challenges Were Handled</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{summary.challengeHandling}</p>
                  </div>
                )}

                {summary.progressMade && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Progress Made
                    </h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{summary.progressMade}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="planning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Planning & Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.actionItems?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                    <ul className="space-y-2">
                      {summary.actionItems.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.nextSteps?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                    <ul className="space-y-2">
                      {summary.nextSteps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.recommendations && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{summary.recommendations}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Volunteer Confidence</h4>
                    <span className={`font-medium ${getEffectivenessColor(summary.volunteerConfidence)}`}>
                      {summary.volunteerConfidence ? `${summary.volunteerConfidence}/5` : "Not rated"}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Session Timing</h4>
                    <span className="text-gray-700">{summary.nextSessionTiming || "Not specified"}</span>
                  </div>
                </div>

                {summary.nextSessionFocus && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Session Focus</h4>
                    <p className="text-gray-700 bg-purple-50 p-3 rounded-lg">{summary.nextSessionFocus}</p>
                  </div>
                )}

                {summary.followUpNeeded && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Follow-up Required
                    </div>
                    {summary.followUpDate && (
                      <p className="text-yellow-800 text-sm">
                        Scheduled for: {format(new Date(summary.followUpDate), "PPP")}
                      </p>
                    )}
                  </div>
                )}

                {summary.additionalNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{summary.additionalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
