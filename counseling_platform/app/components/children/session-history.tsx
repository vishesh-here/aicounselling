"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, User, BookOpen, Target, 
  MessageCircle, TrendingUp, FileText 
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { SessionSummaryDetailsDialog } from "@/components/session/session-summary-details-dialog";

interface SessionHistoryProps {
  sessions: any[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "ESCALATED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "CAREER_GUIDANCE": return <Target className="h-4 w-4" />;
      case "PSYCHOLOGICAL_SUPPORT": return <MessageCircle className="h-4 w-4" />;
      case "FOLLOW_UP": return <TrendingUp className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "CAREER_GUIDANCE": return "bg-purple-100 text-purple-800";
      case "PSYCHOLOGICAL_SUPPORT": return "bg-orange-100 text-orange-800";
      case "FOLLOW_UP": return "bg-green-100 text-green-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  if (!sessions?.length) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Yet</h3>
          <p className="text-gray-600 mb-4">
            This child hasn't had any counseling sessions yet.
          </p>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <MessageCircle className="h-4 w-4 mr-2" />
            Start First Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session: any, index: number) => (
              <div key={session.id} className="relative">
                {/* Timeline line */}
                {index < sessions.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    {getSessionTypeIcon(session.sessionType)}
                  </div>
                  
                  {/* Session content */}
                  <div className="flex-1 min-w-0">
                    <Card className="border border-gray-200 hover:border-orange-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              Session #{sessions.length - index}
                            </h4>
                            <Badge 
                              className={`text-xs ${getSessionTypeColor(session.sessionType)}`}
                            >
                              {session.sessionType.replace('_', ' ').toLowerCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={`text-xs ${getStatusColor(session.status || "PENDING")}`}
                            >
                              {session.status || "Pending"}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(session.startedAt || session.createdAt).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'long', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDistanceToNow(new Date(session.startedAt || session.createdAt))} ago</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>Conducted by: {session.volunteer?.name || "Unknown"}</span>
                          </div>

                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{session.summary?.summary || "No summary available."}</p>
                          </div>

                          {/* Concerns Discussed */}
                          {session.summary?.concernsDiscussed?.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 mb-1">Concerns Discussed:</h5>
                              <div className="flex flex-wrap gap-1">
                                {session.summary.concernsDiscussed.map((concern: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {concern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Cultural Stories Used */}
                          {session.summary?.culturalStoriesUsed?.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 mb-1 flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                Cultural Stories Used:
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {session.summary.culturalStoriesUsed.map((story: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {story}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Next Steps */}
                          {session.summary?.nextSteps?.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-900 mb-1">Next Steps:</h5>
                              <ul className="text-xs text-gray-700 space-y-1">
                                {session.summary.nextSteps.map((step: string, i: number) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <span className="text-orange-600">•</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Follow-up Info */}
                          {session.summary?.followUpNeeded && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center gap-1 text-xs text-yellow-800">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">Follow-up needed</span>
                                {session.summary.followUpDate && (
                                  <span>
                                    by {format(new Date(session.summary.followUpDate), "PP")}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* View Details Button */}
                          {session.summary && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <SessionSummaryDetailsDialog 
                                session={session}
                                trigger={
                                  <Button variant="outline" size="sm" className="w-full">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Detailed Summary
                                  </Button>
                                }
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
