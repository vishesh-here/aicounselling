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
exports.GET = exports.dynamic = void 0;
const server_1 = require("next/server");
const next_auth_1 = require("next-auth");
const auth_config_1 = require("@/lib/auth-config");
const db_1 = require("@/lib/db");
exports.dynamic = "force-dynamic";
function GET(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
            if (!(session === null || session === void 0 ? void 0 : session.user)) {
                return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            // Only admin users can access comprehensive state-wise data
            if (session.user.role !== "ADMIN") {
                return server_1.NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            // Get children count by state
            const childrenByState = yield db_1.prisma.child.groupBy({
                by: ["state"],
                _count: { state: true },
                where: { isActive: true }
            });
            // Get volunteers count by state  
            const volunteersByState = yield db_1.prisma.user.groupBy({
                by: ["state"],
                _count: { state: true },
                where: {
                    role: "VOLUNTEER",
                    isActive: true,
                    state: { not: null } // Only count volunteers with state information
                }
            });
            // Get sessions count by state (through children)
            const sessionsByState = yield db_1.prisma.$queryRaw `
      SELECT 
        c.state,
        COUNT(s.id) as session_count
      FROM "sessions" s
      JOIN "children" c ON s."childId" = c.id
      WHERE c."isActive" = true AND c.state IS NOT NULL
      GROUP BY c.state
    `;
            // Get concerns count by state (through children)
            const concernsByState = yield db_1.prisma.$queryRaw `
      SELECT 
        c.state,
        COUNT(co.id) as concern_count,
        COUNT(CASE WHEN co.status = 'RESOLVED' THEN 1 END) as resolved_count
      FROM "concerns" co
      JOIN "children" c ON co."childId" = c.id
      WHERE c."isActive" = true AND c.state IS NOT NULL
      GROUP BY c.state
    `;
            // Combine all data by state
            const stateDataMap = {};
            // Initialize with children data
            childrenByState.forEach(item => {
                if (item.state) {
                    stateDataMap[item.state] = {
                        state: item.state,
                        children: item._count.state,
                        volunteers: 0,
                        sessions: 0,
                        concerns: 0,
                        resolvedConcerns: 0,
                        resolutionRate: 0
                    };
                }
            });
            // Add volunteers data
            volunteersByState.forEach(item => {
                if (item.state && stateDataMap[item.state]) {
                    stateDataMap[item.state].volunteers = item._count.state;
                }
                else if (item.state) {
                    stateDataMap[item.state] = {
                        state: item.state,
                        children: 0,
                        volunteers: item._count.state,
                        sessions: 0,
                        concerns: 0,
                        resolvedConcerns: 0,
                        resolutionRate: 0
                    };
                }
            });
            // Add sessions data
            sessionsByState.forEach(item => {
                if (item.state && stateDataMap[item.state]) {
                    stateDataMap[item.state].sessions = Number(item.session_count);
                }
            });
            // Add concerns data
            concernsByState.forEach(item => {
                if (item.state && stateDataMap[item.state]) {
                    const totalConcerns = Number(item.concern_count);
                    const resolvedConcerns = Number(item.resolved_count);
                    stateDataMap[item.state].concerns = totalConcerns;
                    stateDataMap[item.state].resolvedConcerns = resolvedConcerns;
                    stateDataMap[item.state].resolutionRate = totalConcerns > 0
                        ? Math.round((resolvedConcerns / totalConcerns) * 100)
                        : 0;
                }
            });
            // Convert to array and sort by children count (descending)
            const stateData = Object.values(stateDataMap).sort((a, b) => b.children - a.children);
            // Calculate summary statistics
            const summary = {
                totalStates: stateData.length,
                totalChildren: stateData.reduce((sum, state) => sum + state.children, 0),
                totalVolunteers: stateData.reduce((sum, state) => sum + state.volunteers, 0),
                totalSessions: stateData.reduce((sum, state) => sum + state.sessions, 0),
                totalConcerns: stateData.reduce((sum, state) => sum + state.concerns, 0),
                totalResolvedConcerns: stateData.reduce((sum, state) => sum + state.resolvedConcerns, 0),
                resolutionRate: 0
            };
            summary.resolutionRate = summary.totalConcerns > 0
                ? Math.round((summary.totalResolvedConcerns / summary.totalConcerns) * 100)
                : 0;
            return server_1.NextResponse.json({
                success: true,
                data: stateData,
                summary
            });
        }
        catch (error) {
            console.error("Error fetching map data:", error);
            return server_1.NextResponse.json({ error: "Failed to fetch map data" }, { status: 500 });
        }
    });
}
exports.GET = GET;
