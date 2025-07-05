"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const db_1 = require("@/lib/db");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const dashboard_stats_1 = require("@/components/dashboard/dashboard-stats");
const concern_analytics_1 = require("@/components/dashboard/concern-analytics");
const india_map_1 = require("@/components/dashboard/india-map");
const recent_sessions_1 = require("@/components/dashboard/recent-sessions");
const trend_analytics_1 = require("@/components/dashboard/trend-analytics");
exports.dynamic = "force-dynamic";
function getDashboardData(userRole, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const isAdmin = userRole === "ADMIN";
        if (isAdmin) {
            // Admin sees all data
            const [totalChildren, totalVolunteers, totalSessions, resolvedConcerns, totalConcerns] = yield Promise.all([
                db_1.prisma.child.count({ where: { isActive: true } }),
                db_1.prisma.user.count({ where: { role: "VOLUNTEER", isActive: true } }),
                db_1.prisma.session.count(),
                db_1.prisma.concern.count({ where: { status: "RESOLVED" } }),
                db_1.prisma.concern.count()
            ]);
            const resolutionRate = totalConcerns > 0 ? Math.round((resolvedConcerns / totalConcerns) * 100) : 0;
            // Get state-wise distribution
            const stateData = yield db_1.prisma.child.groupBy({
                by: ["state"],
                _count: { state: true },
                where: { isActive: true }
            });
            // Get concern analytics by age group
            const concernsByAge = yield db_1.prisma.$queryRaw `
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
      JOIN "concerns" co ON c.id = co."child_id"
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
                concernsByAge: concernsByAge || [],
                recentSessions: yield db_1.prisma.session.findMany({
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: {
                        child: { select: { name: true, age: true } },
                        volunteer: { select: { name: true } },
                        summary: { select: { resolutionStatus: true } }
                    }
                })
            };
        }
        else {
            // Volunteer sees only their data
            const assignments = yield db_1.prisma.assignment.findMany({
                where: { volunteerId: userId, isActive: true },
                include: { child: true }
            });
            const assignedchild_ids = assignments.map(a => a.child_id);
            const [mySessions, myOpenConcerns] = yield Promise.all([
                db_1.prisma.session.count({ where: { volunteerId: userId } }),
                db_1.prisma.concern.count({
                    where: {
                        child_id: { in: assignedchild_ids },
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
                recentSessions: yield db_1.prisma.session.findMany({
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
    });
}
function DashboardPage() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
        const userRole = ((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) || "VOLUNTEER";
        const userId = ((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id) || "";
        const dashboardData = yield getDashboardData(userRole, userId);
        return (<div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {userRole === "ADMIN"
                ? "Overview of the Talesmith.ai platform"
                : "Your counseling activities and assigned children"}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-orange-600">
          <lucide_react_1.Heart className="h-6 w-6"/>
          <span className="font-medium">Talesmith.ai</span>
        </div>
      </div>

      {/* Stats Cards */}
      <dashboard_stats_1.DashboardStats data={dashboardData} userRole={userRole}/>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {userRole === "ADMIN" && (<>
              {/* Trend Analytics - Featured prominently */}
              <trend_analytics_1.TrendAnalytics />

              {/* India Map */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.MapPin className="h-5 w-5"/>
                    Children Distribution Across India
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <india_map_1.IndiaMap data={dashboardData.stateData || []}/>
                </card_1.CardContent>
              </card_1.Card>

              {/* Concern Analytics */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.TrendingUp className="h-5 w-5"/>
                    Concern Analytics by Age Groups
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <concern_analytics_1.ConcernAnalytics data={dashboardData.concernsByAge || []}/>
                </card_1.CardContent>
              </card_1.Card>
            </>)}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Sessions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Calendar className="h-5 w-5"/>
                Recent Sessions
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recent_sessions_1.RecentSessions sessions={dashboardData.recentSessions} userRole={userRole}/>
            </card_1.CardContent>
          </card_1.Card>

          {/* Quick Actions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Quick Actions</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              <a href="/children" className="block p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <lucide_react_1.Users className="h-5 w-5 text-orange-600"/>
                  <div>
                    <p className="font-medium text-gray-900">View Children</p>
                    <p className="text-sm text-gray-600">Manage child profiles</p>
                  </div>
                </div>
              </a>
              
              <a href="/knowledge-base" className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <lucide_react_1.BookOpen className="h-5 w-5 text-blue-600"/>
                  <div>
                    <p className="font-medium text-gray-900">Knowledge Base</p>
                    <p className="text-sm text-gray-600">Access resources</p>
                  </div>
                </div>
              </a>

              {userRole === "ADMIN" && (<a href="/admin/manage-kb" className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <lucide_react_1.BookOpen className="h-5 w-5 text-green-600"/>
                    <div>
                      <p className="font-medium text-gray-900">Manage Knowledge Base</p>
                      <p className="text-sm text-gray-600">Add resources</p>
                    </div>
                  </div>
                </a>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>);
    });
}
exports.default = DashboardPage;
