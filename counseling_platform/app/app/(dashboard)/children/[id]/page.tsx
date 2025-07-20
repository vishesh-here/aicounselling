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
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        if (!data.session?.user) {
          setError('Unauthorized');
          return;
        }
        
        const accessToken = data.session.access_token;
        
        // Fetch child data from API endpoint
        const response = await fetch(`/api/children/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Child not found');
          } else if (response.status === 401) {
            setError('Unauthorized');
          } else {
            setError('Failed to load child data');
          }
          return;
        }
        
        const responseData = await response.json();
        const childData = responseData.child;
        
        if (!childData) {
          setError('Child not found');
          return;
        }
        
        // Check volunteer permissions
        const user = data.session.user;
        const userRole = user.user_metadata?.role || user.app_metadata?.role;
        if (userRole === 'VOLUNTEER') {
          const assigned = (childData.assignments || []).some((a: any) => a.volunteerId === user.id && a.isActive);
          if (!assigned) {
            setError('Unauthorized');
            return;
          }
        }
        
        // Sort sessions by date
        let sortedSessions = (childData.sessions || []).sort((a: any, b: any) => {
          const aTime = new Date(a.endedAt || a.startedAt).getTime();
          const bTime = new Date(b.endedAt || b.startedAt).getTime();
          return bTime - aTime;
        });
        
        // Fetch session summaries for each session
        for (const session of sortedSessions) {
          try {
            const summaryResponse = await fetch(`/api/sessions/summary?sessionId=${session.id}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (summaryResponse.ok) {
              const summaryData = await summaryResponse.json();
              session.summary = summaryData.summary;
            } else if (summaryResponse.status === 404) {
              // Session doesn't have a summary yet (e.g., IN_PROGRESS sessions)
              session.summary = null;
            } else {
              console.error('Error fetching session summary:', summaryResponse.status, summaryResponse.statusText);
              session.summary = null;
            }
          } catch (error) {
            console.error('Error fetching session summary:', error);
            session.summary = null;
          }
        }
        
        childData.sessions = sortedSessions;
        
        setChild(childData);
      } catch (error) {
        console.error('Error fetching child data:', error);
        setError('Failed to load child data');
      }
    };
    fetchData();
  }, [params.id]);

  const refetchChildData = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return;
      
      const accessToken = data.session.access_token;
      
      const response = await fetch(`/api/children/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return;
      
      const responseData = await response.json();
      const childData = responseData.child;
      
      if (!childData) return;
      
      // Sort sessions by date
      let sortedSessions = (childData.sessions || []).sort((a: any, b: any) => {
        const aTime = new Date(a.endedAt || a.startedAt).getTime();
        const bTime = new Date(b.endedAt || b.startedAt).getTime();
        return bTime - aTime;
      });
      
      // Fetch session summaries for each session
      for (const session of sortedSessions) {
        try {
          const summaryResponse = await fetch(`/api/sessions/summary?sessionId=${session.id}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            session.summary = summaryData.summary;
          } else if (summaryResponse.status === 404) {
            // Session doesn't have a summary yet (e.g., IN_PROGRESS sessions)
            session.summary = null;
          } else {
            console.error('Error fetching session summary:', summaryResponse.status, summaryResponse.statusText);
            session.summary = null;
          }
        } catch (error) {
          console.error('Error fetching session summary:', error);
          session.summary = null;
        }
      }
      
      childData.sessions = sortedSessions;
      
      setChild(childData);
    } catch (error) {
      console.error('Error refetching child data:', error);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">{child.fullName}</h1>
            <div className="flex items-center gap-4 text-gray-600 mt-1">
              <span>{child.dateOfBirth ? Math.floor((new Date().getTime() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 'Unknown'} years old</span>
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
          <Link href={`/session/${child.id}`}>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          </Link>
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
