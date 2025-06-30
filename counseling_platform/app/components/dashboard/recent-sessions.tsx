
"use client";

import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface RecentSessionsProps {
  sessions: any[];
  userRole: string;
}

export function RecentSessions({ sessions, userRole }: RecentSessionsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "ESCALATED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!sessions?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No recent sessions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session: any) => (
        <div key={session.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">
                {session.child?.name || "Unknown Child"}
              </p>
              <p className="text-xs text-gray-600">
                Age: {session.child?.age || "N/A"}
                {userRole === "ADMIN" && session.volunteer?.name && (
                  <span> • Volunteer: {session.volunteer.name}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(session.createdAt))} ago
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge 
                variant="secondary"
                className={getStatusColor(session.summary?.resolutionStatus || "PENDING")}
              >
                {session.summary?.resolutionStatus || "Pending"}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
