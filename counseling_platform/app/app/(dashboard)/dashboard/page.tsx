"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BookOpen, TrendingUp, MapPin, Heart } from "lucide-react";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import { ConcernAnalytics } from "@/components/dashboard/concern-analytics";
import { IndiaMap } from "@/components/dashboard/india-map";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { TrendAnalytics } from "@/components/dashboard/trend-analytics";
import BirthdayNotifications from "@/components/dashboard/birthday-notifications";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("VOLUNTEER");
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [childrenByState, setChildrenByState] = useState<any[]>([]);
  const [volunteersByState, setVolunteersByState] = useState<any[]>([]);
  const [selectedHeatmap, setSelectedHeatmap] = useState<'children' | 'volunteers'>('children');
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        
        // Fetch all dashboard data from API endpoint with auth header
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        setUserRole(data.userRole);
        setAssignments(data.assignments || []);
        setRecentSessions(data.recentSessions || []);
        setChildrenByState(data.childrenByState || []);
        setVolunteersByState(data.volunteersByState || []);
        setDashboardStats({}); // Placeholder if you want to add stats
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {userRole === "ADMIN" 
              ? "Overview of the Talesmith.ai platform" 
              : "Your counseling activities and assigned children"
            }
          </p>
        </div>
        <div className="flex items-center space-x-2 text-orange-600">
          <Heart className="h-6 w-6" />
          <span className="font-medium">Talesmith.ai</span>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Birthday Notifications */}
      <BirthdayNotifications />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {userRole === "ADMIN" && (
            <>
              <TrendAnalytics />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Children & Volunteers Distribution Across India
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IndiaMap
                    childrenData={childrenByState}
                    volunteersData={volunteersByState}
                    selectedHeatmap={selectedHeatmap}
                    onHeatmapChange={setSelectedHeatmap}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Concern Analytics by Age Groups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConcernAnalytics />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Sessions */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentSessions sessions={recentSessions} userRole={userRole} />
            </CardContent>
          </Card> */}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="/children" className="block p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">View Children</p>
                    <p className="text-sm text-gray-600">Manage child profiles</p>
                  </div>
                </div>
              </a>
              
              <a href="/knowledge-base" className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Knowledge Base</p>
                    <p className="text-sm text-gray-600">Access resources</p>
                  </div>
                </div>
              </a>

              {userRole === "ADMIN" && (
                <a href="/admin/manage-kb" className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Manage Knowledge Base</p>
                      <p className="text-sm text-gray-600">Add resources</p>
                    </div>
                  </div>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
