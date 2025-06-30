
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, childId, volunteerId, assignmentId } = body;

    if (action === "assign") {
      // Check if assignment already exists
      const existingAssignment = await prisma.assignment.findFirst({
        where: {
          childId: childId,
          volunteerId: volunteerId,
          isActive: true
        }
      });

      if (existingAssignment) {
        return NextResponse.json(
          { error: "Assignment already exists for this volunteer and child" },
          { status: 400 }
        );
      }

      // Create new assignment
      const assignment = await prisma.assignment.create({
        data: {
          childId: childId,
          volunteerId: volunteerId,
          isActive: true
        },
        include: {
          child: {
            select: { name: true, age: true, state: true }
          },
          volunteer: {
            select: { name: true, email: true, specialization: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: "Assignment created successfully",
        assignment
      });
    }

    if (action === "remove" && assignmentId) {
      // Deactivate assignment instead of deleting
      const assignment = await prisma.assignment.update({
        where: { id: assignmentId },
        data: { isActive: false }
      });

      return NextResponse.json({
        success: true,
        message: "Assignment removed successfully",
        assignment
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Assignment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await prisma.assignment.findMany({
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
    });

    return NextResponse.json({ assignments });

  } catch (error) {
    console.error("Assignment fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
