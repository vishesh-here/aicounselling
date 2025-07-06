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

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("VOLUNTEER");
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [concernAnalytics, setConcernAnalytics] = useState<any[]>([]);
  const [stateData, setStateData] = useState<any[]>([]);
  const [childrenByState, setChildrenByState] = useState<any[]>([]);
  const [volunteersByState, setVolunteersByState] = useState<any[]>([]);
  const [selectedHeatmap, setSelectedHeatmap] = useState<'children' | 'volunteers'>('children');
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw sessionError || new Error("No session");
        const user = sessionData.session.user;
        console.log('Dashboard user:', user);
        const role = user.user_metadata?.role || user.app_metadata?.role || "VOLUNTEER";
        setUserRole(role);
        // Fetch assignments for volunteer
        let assignmentsData: any[] = [];
        if (role === "VOLUNTEER") {
          const { data: assign, error: assignError } = await supabase
            .from("assignments")
            .select("*, child(*)")
            .eq("volunteerId", user.id)
            .eq("isActive", true);
          if (assignError) throw assignError;
          assignmentsData = assign || [];
          setAssignments(assignmentsData);
        }
        // Fetch recent sessions for volunteer
        let sessionsData: any[] = [];
        if (role === "VOLUNTEER") {
          const { data: sessions, error: sessionsError } = await supabase
            .from("sessions")
            .select("*, child(name, age), summary(resolutionStatus)")
            .eq("volunteerId", user.id)
            .order("createdAt", { ascending: false })
            .limit(5);
          if (sessionsError) throw sessionsError;
          sessionsData = sessions || [];
          setRecentSessions(sessionsData);
        }
        // Fetch concern analytics data
        const { data: concernData, error: concernError } = await supabase
          .from('concerns')
          .select('id, category, child_id');
        if (concernError) throw concernError;
        // Fetch children for age
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('id, age, isActive');
        if (childrenError) throw childrenError;
        // Group by age group and category
        const analytics: any[] = [];
        (concernData || []).forEach((concern: any) => {
          const child = (childrenData || []).find((c: any) => c.id === concern.child_id && c.isActive);
          if (!child) return;
          let age_group = '';
          if (child.age >= 6 && child.age <= 10) age_group = '6-10';
          else if (child.age >= 11 && child.age <= 13) age_group = '11-13';
          else if (child.age >= 14 && child.age <= 16) age_group = '14-16';
          else age_group = '17+';
          const existing = analytics.find(a => a.age_group === age_group && a.category === concern.category);
          if (existing) existing.count += 1;
          else analytics.push({ age_group, category: concern.category, count: 1 });
        });
        setConcernAnalytics(analytics);
        // Fetch children and volunteers for IndiaMap heatmaps
        const { data: children, error: childrenMapError } = await supabase
          .from('children')
          .select('id, state')
          .neq('state', null);
        const { data: volunteers, error: volunteersError } = await supabase
          .from('users')
          .select('id, state, role')
          .eq('role', 'VOLUNTEER')
          .neq('state', null);
        if (childrenMapError || volunteersError) throw childrenMapError || volunteersError;
        // Aggregate children by state
        const childrenStateMap: Record<string, number> = {};
        (children || []).forEach((c: any) => {
          if (c.state) childrenStateMap[c.state] = (childrenStateMap[c.state] || 0) + 1;
        });
        setChildrenByState(Object.entries(childrenStateMap).map(([state, value]) => ({ state, value })));
        // Aggregate volunteers by state
        const volunteersStateMap: Record<string, number> = {};
        (volunteers || []).forEach((v: any) => {
          if (v.state) volunteersStateMap[v.state] = (volunteersStateMap[v.state] || 0) + 1;
        });
        setVolunteersByState(Object.entries(volunteersStateMap).map(([state, value]) => ({ state, value })));
        // For admin, you may want to fetch additional analytics data here (already handled in child components)
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
                  <ConcernAnalytics data={concernAnalytics} />
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
