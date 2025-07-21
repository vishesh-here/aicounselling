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
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            Session Summary Details
          </DialogTitle>
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(session.startedAt || session.createdAt).toLocaleString(undefined, {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {session.volunteer?.name || "Unknown Volunteer"}
            </div>
            <Badge className={`${getStatusColor(session.status)}`}>
              {session.status || "Completed"}
            </Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[70vh]">
          <div className="space-y-6 p-6">
            {/* Session Summary */}
            {summary?.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Session Summary
                </h3>
                <p className="text-blue-800 leading-relaxed">{summary.summary}</p>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary?.effectiveness && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Session Effectiveness
                  </h4>
                  <span className={`font-semibold text-lg ${getEffectivenessColor(summary.effectiveness)}`}>
                    {summary.effectiveness}
                  </span>
                </div>
              )}
              
              {summary?.next_session_date && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next Session
                  </h4>
                  <span className="text-purple-800 font-medium">
                    {format(new Date(summary.next_session_date), "PPP")}
                  </span>
                </div>
              )}
            </div>

            {/* Follow-up Notes */}
            {summary?.followup_notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Follow-up Notes
                </h3>
                <p className="text-yellow-800 leading-relaxed">{summary.followup_notes}</p>
              </div>
            )}

            {/* Concerns Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Concerns */}
              {summary?.new_concerns && Array.isArray(summary.new_concerns) && summary.new_concerns.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    New Concerns Raised
                  </h3>
                  <ul className="space-y-2">
                    {summary.new_concerns.map((concern: any, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-red-800">{typeof concern === 'string' ? concern : concern.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resolved Concerns */}
              {summary?.resolved_concerns && Array.isArray(summary.resolved_concerns) && summary.resolved_concerns.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Resolved Concerns
                  </h3>
                  <ul className="space-y-2">
                    {summary.resolved_concerns.map((concernId: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-green-800">Concern resolved</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Additional Information */}
            {(summary?.additionalNotes || summary?.recommendations) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Information
                </h3>
                {summary.additionalNotes && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-800 mb-1">Notes:</h4>
                    <p className="text-gray-700">{summary.additionalNotes}</p>
                  </div>
                )}
                {summary.recommendations && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Recommendations:</h4>
                    <p className="text-gray-700">{summary.recommendations}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
