
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Lightbulb, BookOpen, Target, Star, 
  TrendingUp, AlertTriangle, CheckCircle 
} from "lucide-react";

interface PreSessionBriefingProps {
  child: any;
}

export function PreSessionBriefing({ child }: PreSessionBriefingProps) {
  const [aiRoadmap, setAiRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const activeConcerns = child.concerns?.filter((c: any) => c.status !== "RESOLVED") || [];
  const recentSessions = child.sessions?.slice(0, 3) || [];

  // Generate AI roadmap based on child's profile and concerns
  const generateAiRoadmap = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/enhanced-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: child.id,
          childProfile: {
            name: child.name,
            age: child.age,
            state: child.state,
            interests: child.interests,
            challenges: child.challenges,
            background: child.background
          },
          activeConcerns: activeConcerns.map((c: any) => ({
            category: c.category,
            title: c.title,
            description: c.description,
            severity: c.severity
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiRoadmap(data.roadmap);
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Active Concerns Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>No active concerns - great progress!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Cultural Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Recommended Cultural Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getRecommendedStories().map((story, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">{story.title}</h4>
                <p className="text-sm text-blue-800 mb-2">{story.relevance}</p>
                <div className="flex flex-wrap gap-1">
                  {story.themes.map((theme, themeIndex) => (
                    <Badge key={themeIndex} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Progress Summary */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Recent Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session: any, index: number) => (
                <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Session {recentSessions.length - index}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {session.summary?.summary || "No summary available"}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`text-xs ${
                        session.summary?.resolutionStatus === "RESOLVED" ? "bg-green-100 text-green-800" :
                        session.summary?.resolutionStatus === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {session.summary?.resolutionStatus || "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
