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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detailed Session Summary
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-2">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {session.createdAt && (
              <>
                <Calendar className="h-4 w-4" />
                {new Date(session.createdAt).toLocaleString()}
              </>
            )}
            <User className="h-4 w-4 ml-4" />
            {session.volunteer?.name || "Unknown Volunteer"}
            <Badge className={`ml-4 ${getStatusColor(session.status)}`}>{session.status || "Pending"}</Badge>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mb-2">{summary.summary || "No summary available."}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Session Effectiveness</h4>
                  <span className="font-medium">{summary.effectiveness || "Not rated"}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Next Scheduled Session</h4>
                  <span className="font-medium">{summary.next_session_date || "Not scheduled"}</span>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-1">Follow-up Notes</h4>
                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{summary.followup_notes || "None"}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-1">New Concerns Raised</h4>
                {Array.isArray(summary.new_concerns) && summary.new_concerns.length ? (
                  <ul className="list-disc list-inside text-gray-700">
                    {summary.new_concerns.map((c: any, i: number) => (
                      <li key={i}>{typeof c === 'string' ? c : c.title}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-1">Resolved Concerns</h4>
                {Array.isArray(summary.resolved_concerns) && summary.resolved_concerns.length ? (
                  <ul className="list-disc list-inside text-gray-700">
                    {summary.resolved_concerns.map((c: any, i: number) => (
                      <li key={i}>{typeof c === 'string' ? c : c.title}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
