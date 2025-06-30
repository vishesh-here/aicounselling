
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BookOpen, TrendingUp, MapPin, Heart } from "lucide-react";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ConcernAnalytics } from "@/components/dashboard/concern-analytics";
import { IndiaMap } from "@/components/dashboard/india-map";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { TrendAnalytics } from "@/components/dashboard/trend-analytics";

export const dynamic = "force-dynamic";

async function getDashboardData(userRole: string, userId: string) {
  const isAdmin = userRole === "ADMIN";

  if (isAdmin) {
    // Admin sees all data
    const [totalChildren, totalVolunteers, totalSessions, resolvedConcerns, totalConcerns] = await Promise.all([
      prisma.child.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "VOLUNTEER", isActive: true } }),
      prisma.session.count(),
      prisma.concern.count({ where: { status: "RESOLVED" } }),
      prisma.concern.count()
    ]);

    const resolutionRate = totalConcerns > 0 ? Math.round((resolvedConcerns / totalConcerns) * 100) : 0;

    // Get state-wise distribution
    const stateData = await prisma.child.groupBy({
      by: ["state"],
      _count: { state: true },
      where: { isActive: true }
    });

    // Get concern analytics by age group
    const concernsByAge = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN c.age BETWEEN 6 AND 10 THEN '6-10'
          WHEN c.age BETWEEN 11 AND 13 THEN '11-13'
          WHEN c.age BETWEEN 14 AND 16 THEN '14-16'
          ELSE '17+'
        END as age_group,
        co.category,
        COUNT(co.id) as count
      FROM "children" c
      JOIN "concerns" co ON c.id = co."childId"
      WHERE c."isActive" = true
      GROUP BY age_group, co.category
      ORDER BY age_group, co.category
    `;

    return {
      stats: {
        totalChildren,
        totalVolunteers, 
        totalSessions,
        resolutionRate
      },
      stateData: stateData || [],
      concernsByAge: (concernsByAge as any[]) || [],
      recentSessions: await prisma.session.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          child: { select: { name: true, age: true } },
          volunteer: { select: { name: true } },
          summary: { select: { resolutionStatus: true } }
        }
      })
    };
  } else {
    // Volunteer sees only their data
    const assignments = await prisma.assignment.findMany({
      where: { volunteerId: userId, isActive: true },
      include: { child: true }
    });

    const assignedChildIds = assignments.map(a => a.childId);

    const [mySessions, myOpenConcerns] = await Promise.all([
      prisma.session.count({ where: { volunteerId: userId } }),
      prisma.concern.count({ 
        where: { 
          childId: { in: assignedChildIds },
          status: { not: "RESOLVED" }
        }
      })
    ]);

    return {
      stats: {
        myChildren: assignments.length,
        mySessions,
        myOpenConcerns,
        upcomingSessions: 0 // We'll calculate this later
      },
      assignedChildren: assignments.map(a => a.child),
      recentSessions: await prisma.session.findMany({
        take: 5,
        where: { volunteerId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          child: { select: { name: true, age: true } },
          summary: { select: { resolutionStatus: true } }
        }
      })
    };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "VOLUNTEER";
  const userId = session?.user?.id || "";

  const dashboardData = await getDashboardData(userRole, userId);

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
      <DashboardStats data={dashboardData} userRole={userRole} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {userRole === "ADMIN" && (
            <>
              {/* Trend Analytics - Featured prominently */}
              <TrendAnalytics />

              {/* India Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Children Distribution Across India
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IndiaMap data={dashboardData.stateData || []} />
                </CardContent>
              </Card>

              {/* Concern Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Concern Analytics by Age Groups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConcernAnalytics data={dashboardData.concernsByAge || []} />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentSessions sessions={dashboardData.recentSessions} userRole={userRole} />
            </CardContent>
          </Card>

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
