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
            const { searchParams } = new URL(request.url);
            const month = searchParams.get('month');
            const year = searchParams.get('year') || new Date().getFullYear().toString();
            // Calculate date range based on month filter
            let startDate;
            let endDate;
            if (month) {
                // Filter by specific month
                startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
            }
            else {
                // Default to last 12 weeks
                endDate = new Date();
                startDate = new Date();
                startDate.setDate(startDate.getDate() - (12 * 7)); // 12 weeks ago
            }
            // Generate weekly buckets
            const weeks = [];
            const currentWeekStart = new Date(startDate);
            // Start from Monday of the week containing startDate
            const startOfWeek = new Date(currentWeekStart);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
            while (startOfWeek <= endDate) {
                const weekEnd = new Date(startOfWeek);
                weekEnd.setDate(weekEnd.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                weeks.push({
                    startDate: new Date(startOfWeek),
                    endDate: new Date(weekEnd),
                    weekLabel: `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`
                });
                startOfWeek.setDate(startOfWeek.getDate() + 7);
            }
            // Get sessions completed per week
            const sessionsData = yield Promise.all(weeks.map((week) => __awaiter(this, void 0, void 0, function* () {
                const count = yield db_1.prisma.session.count({
                    where: {
                        createdAt: {
                            gte: week.startDate,
                            lte: week.endDate
                        }
                    }
                });
                return { week: week.weekLabel, sessions: count };
            })));
            // Get concerns recorded per week
            const concernsRecordedData = yield Promise.all(weeks.map((week) => __awaiter(this, void 0, void 0, function* () {
                const count = yield db_1.prisma.concern.count({
                    where: {
                        createdAt: {
                            gte: week.startDate,
                            lte: week.endDate
                        }
                    }
                });
                return { week: week.weekLabel, concernsRecorded: count };
            })));
            // Get concerns resolved per week
            const concernsResolvedData = yield Promise.all(weeks.map((week) => __awaiter(this, void 0, void 0, function* () {
                const count = yield db_1.prisma.concern.count({
                    where: {
                        status: "RESOLVED",
                        updatedAt: {
                            gte: week.startDate,
                            lte: week.endDate
                        }
                    }
                });
                return { week: week.weekLabel, concernsResolved: count };
            })));
            // Combine all data
            const trendData = weeks.map((week, index) => {
                var _a, _b, _c;
                return ({
                    week: week.weekLabel,
                    fullDate: week.startDate.toISOString().split('T')[0],
                    sessions: ((_a = sessionsData[index]) === null || _a === void 0 ? void 0 : _a.sessions) || 0,
                    concernsRecorded: ((_b = concernsRecordedData[index]) === null || _b === void 0 ? void 0 : _b.concernsRecorded) || 0,
                    concernsResolved: ((_c = concernsResolvedData[index]) === null || _c === void 0 ? void 0 : _c.concernsResolved) || 0
                });
            });
            // Get available months for filter dropdown
            const oldestSession = yield db_1.prisma.session.findFirst({
                orderBy: { createdAt: "asc" },
                select: { createdAt: true }
            });
            const oldestConcern = yield db_1.prisma.concern.findFirst({
                orderBy: { createdAt: "asc" },
                select: { createdAt: true }
            });
            const oldestDate = (oldestSession === null || oldestSession === void 0 ? void 0 : oldestSession.createdAt) || (oldestConcern === null || oldestConcern === void 0 ? void 0 : oldestConcern.createdAt) || new Date();
            const availableMonths = [];
            const currentDate = new Date();
            const iterDate = new Date(oldestDate);
            while (iterDate <= currentDate) {
                availableMonths.push({
                    value: `${iterDate.getFullYear()}-${(iterDate.getMonth() + 1).toString().padStart(2, '0')}`,
                    label: iterDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                });
                iterDate.setMonth(iterDate.getMonth() + 1);
            }
            return server_1.NextResponse.json({
                success: true,
                data: trendData,
                availableMonths: availableMonths.reverse() // Most recent first
            });
        }
        catch (error) {
            console.error("Trend data fetch error:", error);
            return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    });
}
exports.GET = GET;
