'use client';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignmentManager } from "@/components/admin/assignment-manager";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = "force-dynamic";

export default function AssignmentsPage() {
  const [children, setChildren] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
        .select('*, assignments(*, volunteer:users(id, name, specialization)), concerns(*)')
        .eq('isActive', true);
      if (childrenError) throw childrenError;
      console.log('Fetched children:', childrenData);
      setChildren(childrenData || []);
      // Fetch all users, then filter for volunteers in client
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, specialization, state, user_metadata, app_metadata, approval_status, isActive');
      if (usersError) throw usersError;
      const volunteersData = (allUsers || []).filter(u => {
        const role = u.user_metadata?.role || u.app_metadata?.role;
        return role === 'VOLUNTEER' && u.approval_status === 'APPROVED' && u.isActive;
      });
      console.log('Fetched volunteers:', volunteersData);
      setVolunteers(volunteersData);
      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*, child_id, volunteerId')
        .eq('isActive', true);
      if (assignmentsError) throw assignmentsError;
      console.log('Fetched assignments:', assignmentsData);
      setAssignments(assignmentsData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = {
    totalChildren: children.length,
    assignedChildren: children.filter(child => child.assignments.length > 0).length,
    unassignedChildren: children.filter(child => child.assignments.length === 0).length,
    totalVolunteers: volunteers.length,
    activeAssignments: assignments.length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600 mt-1">
            Manage volunteer-child assignments and track coverage
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalChildren}</p>
              <p className="text-sm text-gray-600">Total Children</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.assignedChildren}</p>
              <p className="text-sm text-gray-600">Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.unassignedChildren}</p>
              <p className="text-sm text-gray-600">Unassigned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.totalVolunteers}</p>
              <p className="text-sm text-gray-600">Active Volunteers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.activeAssignments}</p>
              <p className="text-sm text-gray-600">Total Assignments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Manager Component */}
      <AssignmentManager 
        children={children}
        volunteers={volunteers}
        assignments={assignments}
      />
    </div>
  );
}
