
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

    // Only admin users can access comprehensive state-wise data
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get children count by state
    const childrenByState = await prisma.child.groupBy({
      by: ["state"],
      _count: { state: true },
      where: { isActive: true }
    });

    // Get volunteers count by state  
    const volunteersByState = await prisma.user.groupBy({
      by: ["state"],
      _count: { state: true },
      where: { 
        role: "VOLUNTEER", 
        isActive: true,
        state: { not: null } // Only count volunteers with state information
      }
    });

    // Get sessions count by state (through children)
    const sessionsByState = await prisma.$queryRaw`
      SELECT 
        c.state,
        COUNT(s.id) as session_count
      FROM "sessions" s
      JOIN "children" c ON s."childId" = c.id
      WHERE c."isActive" = true AND c.state IS NOT NULL
      GROUP BY c.state
    ` as { state: string; session_count: bigint }[];

    // Get concerns count by state (through children)
    const concernsByState = await prisma.$queryRaw`
      SELECT 
        c.state,
        COUNT(co.id) as concern_count,
        COUNT(CASE WHEN co.status = 'RESOLVED' THEN 1 END) as resolved_count
      FROM "concerns" co
      JOIN "children" c ON co."childId" = c.id
      WHERE c."isActive" = true AND c.state IS NOT NULL
      GROUP BY c.state
    ` as { state: string; concern_count: bigint; resolved_count: bigint }[];

    // Combine all data by state
    const stateDataMap: { [key: string]: any } = {};

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
      } else if (item.state) {
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
    const stateData = Object.values(stateDataMap).sort((a: any, b: any) => b.children - a.children);

    // Calculate summary statistics
    const summary = {
      totalStates: stateData.length,
      totalChildren: stateData.reduce((sum: number, state: any) => sum + state.children, 0),
      totalVolunteers: stateData.reduce((sum: number, state: any) => sum + state.volunteers, 0),
      totalSessions: stateData.reduce((sum: number, state: any) => sum + state.sessions, 0),
      totalConcerns: stateData.reduce((sum: number, state: any) => sum + state.concerns, 0),
      totalResolvedConcerns: stateData.reduce((sum: number, state: any) => sum + state.resolvedConcerns, 0),
      resolutionRate: 0
    };

    summary.resolutionRate = summary.totalConcerns > 0 
      ? Math.round((summary.totalResolvedConcerns / summary.totalConcerns) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: stateData,
      summary
    });

  } catch (error) {
    console.error("Error fetching map data:", error);
    return NextResponse.json(
      { error: "Failed to fetch map data" },
      { status: 500 }
    );
  }
}
