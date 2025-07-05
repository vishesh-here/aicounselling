"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionInterface } from "@/components/session/session-interface";

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [childData, setChildData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("VOLUNTEER");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get session
        const { data: sessionObj, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionObj.session) throw sessionError || new Error("No session");
        const user = sessionObj.session.user;
        console.log('SessionPage user:', user);
        const role = user.user_metadata?.role || user.app_metadata?.role || "VOLUNTEER";
        setUserRole(role);
        setUserId(user.id);
        // Get child_id from params
        const child_id = params?.id as string;
        // Fetch child data
        const { data: child, error: childError } = await supabase
          .from("children")
          .select("*, assignments(*), concerns(*), isActive")
          .eq("id", child_id)
          .maybeSingle();
        if (childError || !child) throw childError || new Error("Child not found");
        setChildData(child);
        // Access control for volunteers
        if (role === "VOLUNTEER") {
          const hasAccess = (child.assignments || []).some(
            (assignment: any) => assignment.volunteerId === user.id && assignment.isActive
          );
          if (!hasAccess) throw new Error("Access denied");
        }
        // Fetch active session for this child
        const { data: activeSession, error: sessionFetchError } = await supabase
          .from("sessions")
          .select("*")
          .eq("child_id", child_id)
          .in("status", ["PLANNED", "IN_PROGRESS"])
          .maybeSingle();
        if (sessionFetchError) throw sessionFetchError;
        setSessionData(activeSession);
      } catch (err: any) {
        setError(err.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  if (loading) {
    return <div className="p-6">Loading session...</div>;
  }
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/children">
              <Button variant="outline">Back to Children</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/children/${params?.id}`}>
            <Button variant="outline" size="sm">
              ← Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Session with {childData?.name}
            </h1>
            <p className="text-gray-600">
              {childData?.age} years old • {childData?.state}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {sessionData ? (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sessionData.status === "IN_PROGRESS" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
              {sessionData.status === "IN_PROGRESS" ? "Session Active" : "Session Planned"}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
              No Active Session
            </span>
          )}
        </div>
      </div>
      {/* Session Interface */}
      <SessionInterface
        child={childData}
        activeSession={sessionData}
        userId={userId}
        userRole={userRole}
      />
    </div>
  );
}
