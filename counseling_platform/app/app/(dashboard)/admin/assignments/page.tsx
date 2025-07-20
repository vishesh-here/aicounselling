'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignmentManager } from "@/components/admin/assignment-manager";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default function AssignmentsPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        
        if (!accessToken) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Get user info to check if admin
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role || user?.app_metadata?.role;
        if (!user || role !== 'ADMIN') {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        setIsAdmin(true);
        
        // Fetch children
        const childrenResponse = await fetch('/api/children', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (childrenResponse.ok) {
          const childrenData = await childrenResponse.json();
          setChildren(childrenData.children || []);
        }

        // Fetch volunteers
        const volunteersResponse = await fetch('/api/admin/volunteers', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (volunteersResponse.ok) {
          const volunteersData = await volunteersResponse.json();
          setVolunteers(volunteersData.volunteers || []);
        }

        // Fetch assignments
        const assignmentsResponse = await fetch('/api/admin/assignments', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setAssignments(assignmentsData.assignments || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
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
      <AssignmentManager />
    </div>
  );
}
