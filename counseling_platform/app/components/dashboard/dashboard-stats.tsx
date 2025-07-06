"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BookOpen, TrendingUp, Heart, UserCheck } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || user?.app_metadata?.role;
      if (!user || role !== 'ADMIN') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      // Fetch children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*, assignments(*), concerns(*), sessions(*)')
        .eq('isActive', true);
      if (childrenError) throw childrenError;
      // Fetch volunteers
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role, state, isActive, approvalStatus');
      if (usersError) throw usersError;
      const volunteers = (allUsers || []).filter(u => {
        return u.role === 'VOLUNTEER' && u.approvalStatus === 'APPROVED' && u.isActive;
      });
      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*');
      if (sessionsError) throw sessionsError;
      // Aggregate stats
      setStats({
        totalChildren: childrenData.length,
        assignedChildren: childrenData.filter(child => child.assignments && child.assignments.length > 0).length,
        unassignedChildren: childrenData.filter(child => !child.assignments || child.assignments.length === 0).length,
        totalVolunteers: volunteers.length,
        activeAssignments: childrenData.reduce((acc, child) => acc + (child.assignments ? child.assignments.length : 0), 0),
        totalSessions: sessionsData.length,
        // Add more stats as needed
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Unauthorized</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Children</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold count-up">{stats?.totalChildren || 0}</div>
          <p className="text-xs text-muted-foreground">Active profiles</p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold count-up">{stats?.totalVolunteers || 0}</div>
          <p className="text-xs text-muted-foreground">Active volunteers</p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold count-up">{stats?.totalSessions || 0}</div>
          <p className="text-xs text-muted-foreground">Counseling sessions</p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold count-up">{stats?.sessionsByState?.resolutionRate || 0}%</div>
          <p className="text-xs text-muted-foreground">Concerns resolved</p>
        </CardContent>
      </Card>
    </div>
  );
}
