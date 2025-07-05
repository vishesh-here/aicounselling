'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, MapPin, Calendar, Heart, Brain, BookOpen, 
  MessageCircle, AlertCircle, Clock, CheckCircle 
} from "lucide-react";
import { PreSessionBriefing } from "@/components/children/pre-session-briefing";
import { SessionHistory } from "@/components/children/session-history";
import ProfileDetails from "@/components/children/profile-details";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { supabase } from '@/lib/supabaseClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default function ChildDetailPage({ params }: PageProps) {
  const [session, setSession] = useState<any>(null);
  const [child, setChild] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (!data.session?.user) {
        setError('Unauthorized');
        return;
      }
      let query = supabase
        .from('children')
        .select('*, assignments(*, volunteer:users(id, name, specialization)), concerns(*), sessions(*, volunteer:users(id, name), summary:session_summaries(*))')
        .eq('id', params.id)
        .eq('isActive', true)
        .single();
      const user = data.session.user;
      const userRole = user.user_metadata?.role || user.app_metadata?.role;
      const { data: childData, error: childError } = await query;
      if (childError || !childData) {
        setError('Child not found or access denied');
        return;
      }
      if (userRole === 'VOLUNTEER') {
        const assigned = (childData.assignments || []).some((a: any) => a.volunteerId === user.id && a.isActive);
        if (!assigned) {
          setError('Unauthorized');
          return;
        }
      }
      let sortedSessions = (childData.sessions || []).sort((a: any, b: any) => {
        const aTime = new Date(a.endedAt || a.startedAt).getTime();
        const bTime = new Date(b.endedAt || b.startedAt).getTime();
        return bTime - aTime;
      });
      childData.sessions = sortedSessions;
      setChild(childData);
    };
    fetchData();
  }, [params.id]);
  if (error) {
    return <div>{error}</div>;
  }
  if (!child) {
    return <div>Loading...</div>;
  }
  const activeAssignment = child.assignments.find((a: any) => a.isActive);
  const activeConcerns = child.concerns.filter((c: any) => c.status !== "RESOLVED");
  const lastSession = child.sessions[0];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH": return "bg-red-100 text-red-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "OPEN": return "bg-yellow-100 text-yellow-800";
      case "CLOSED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{child.name}</h1>
            <div className="flex items-center gap-4 text-gray-600 mt-1">
              <span>{child.age} years old</span>
              <span>•</span>
              <span className="capitalize">{child.gender.toLowerCase()}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{child.state}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">Assigned to:</span>
              <Badge variant="outline">
                {activeAssignment?.volunteer?.name || "Unassigned"}
              </Badge>
              {activeAssignment?.volunteer?.specialization && (
                <Badge variant="secondary" className="text-xs">
                  {activeAssignment.volunteer.specialization}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {activeConcerns.length > 0 && (
            <Link href={`/session/${child.id}`}>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </Link>
          )}
          <Button variant="outline">
            <Heart className="h-4 w-4 mr-2" />
            Add to Favorites
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{child.sessions.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Concerns</p>
                <p className="text-2xl font-bold text-gray-900">{activeConcerns.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Session</p>
                <p className="text-sm font-medium text-gray-900">
                  {lastSession 
                    ? formatDistanceToNow(new Date(lastSession.endedAt || lastSession.startedAt)) + " ago"
                    : "No sessions yet"
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-sm font-medium text-gray-900">
                  {lastSession?.summary?.resolution_status || "Assessment needed"}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Concerns Alert */}
      {activeConcerns.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 mb-2">Active Concerns Requiring Attention</h4>
                <div className="flex flex-wrap gap-2">
                  {activeConcerns.map((concern: any) => (
                    <Badge 
                      key={concern.id}
                      className={getSeverityColor(concern.severity)}
                    >
                      {concern.category}: {concern.title}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="briefing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="briefing" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Pre-Session Briefing
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Session History
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="briefing">
          <PreSessionBriefing child={child} />
        </TabsContent>

        <TabsContent value="history">
          <SessionHistory sessions={child.sessions} />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileDetails child={child} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
