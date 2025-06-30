
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    
    // Calculate date range based on month filter
    let startDate: Date;
    let endDate: Date;
    
    if (month) {
      // Filter by specific month
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    } else {
      // Default to last 12 weeks
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - (12 * 7)); // 12 weeks ago
    }

    // Generate weekly buckets
    const weeks: { startDate: Date; endDate: Date; weekLabel: string }[] = [];
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
    const sessionsData = await Promise.all(
      weeks.map(async (week) => {
        const count = await prisma.session.count({
          where: {
            createdAt: {
              gte: week.startDate,
              lte: week.endDate
            }
          }
        });
        return { week: week.weekLabel, sessions: count };
      })
    );

    // Get concerns recorded per week
    const concernsRecordedData = await Promise.all(
      weeks.map(async (week) => {
        const count = await prisma.concern.count({
          where: {
            createdAt: {
              gte: week.startDate,
              lte: week.endDate
            }
          }
        });
        return { week: week.weekLabel, concernsRecorded: count };
      })
    );

    // Get concerns resolved per week
    const concernsResolvedData = await Promise.all(
      weeks.map(async (week) => {
        const count = await prisma.concern.count({
          where: {
            status: "RESOLVED",
            updatedAt: {
              gte: week.startDate,
              lte: week.endDate
            }
          }
        });
        return { week: week.weekLabel, concernsResolved: count };
      })
    );

    // Combine all data
    const trendData = weeks.map((week, index) => ({
      week: week.weekLabel,
      fullDate: week.startDate.toISOString().split('T')[0],
      sessions: sessionsData[index]?.sessions || 0,
      concernsRecorded: concernsRecordedData[index]?.concernsRecorded || 0,
      concernsResolved: concernsResolvedData[index]?.concernsResolved || 0
    }));

    // Get available months for filter dropdown
    const oldestSession = await prisma.session.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true }
    });

    const oldestConcern = await prisma.concern.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true }
    });

    const oldestDate = oldestSession?.createdAt || oldestConcern?.createdAt || new Date();
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

    return NextResponse.json({
      success: true,
      data: trendData,
      availableMonths: availableMonths.reverse() // Most recent first
    });

  } catch (error) {
    console.error("Trend data fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
