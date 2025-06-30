
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, sessionId, action, notes } = body;

    if (action === "start") {
      // Check if there's already an active session for this child
      const existingSession = await prisma.session.findFirst({
        where: {
          childId: childId,
          status: { in: ["PLANNED", "IN_PROGRESS"] }
        }
      });

      if (existingSession) {
        // Update existing session to IN_PROGRESS
        const updatedSession = await prisma.session.update({
          where: { id: existingSession.id },
          data: {
            status: "IN_PROGRESS",
            startedAt: new Date()
          },
          include: {
            child: true,
            volunteer: { select: { name: true, email: true } }
          }
        });

        return NextResponse.json({
          success: true,
          message: "Session started successfully",
          session: updatedSession
        });
      } else {
        // Create new session
        const newSession = await prisma.session.create({
          data: {
            childId: childId,
            volunteerId: session.user.id,
            status: "IN_PROGRESS",
            sessionType: "COUNSELING",
            startedAt: new Date()
          },
          include: {
            child: true,
            volunteer: { select: { name: true, email: true } }
          }
        });

        return NextResponse.json({
          success: true,
          message: "Session created and started successfully",
          session: newSession
        });
      }
    }

    if (action === "end" && sessionId) {
      // End the session
      const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
          notes: notes || undefined
        }
      });

      return NextResponse.json({
        success: true,
        message: "Session ended successfully",
        session: updatedSession
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
