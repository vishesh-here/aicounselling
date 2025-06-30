
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignmentManager } from "@/components/admin/assignment-manager";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getAssignmentData() {
  const [children, volunteers, assignments] = await Promise.all([
    prisma.child.findMany({
      where: { isActive: true },
      include: {
        assignments: {
          where: { isActive: true },
          include: {
            volunteer: {
              select: { id: true, name: true, email: true, specialization: true }
            }
          }
        },
        concerns: {
          where: { status: { not: "RESOLVED" } }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.user.findMany({
      where: { 
        role: "VOLUNTEER",
        approvalStatus: "APPROVED",
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialization: true,
        state: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.assignment.findMany({
      where: { isActive: true },
      include: {
        child: {
          select: { id: true, name: true, age: true, state: true }
        },
        volunteer: {
          select: { id: true, name: true, email: true, specialization: true }
        }
      },
      orderBy: { assignedAt: "desc" }
    })
  ]);

  return { children, volunteers, assignments };
}

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You need admin privileges to access this page.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { children, volunteers, assignments } = await getAssignmentData();

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
