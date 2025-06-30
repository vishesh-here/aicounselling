
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      summary, 
      content: fullStory, 
      source, 
      themes = [], 
      applicableFor = [], 
      moralLessons = [],
      tags = []
    } = body;

    if (!title || !summary || !fullStory || !source) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const culturalStory = await prisma.culturalStory.create({
      data: {
        title,
        summary,
        fullStory,
        source,
        themes,
        applicableFor,
        moralLessons,
        tags,
        createdById: session.user.id
      }
    });

    return NextResponse.json(
      { message: "Cultural story created successfully", id: culturalStory.id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Cultural story creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const culturalStories = await prisma.culturalStory.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ culturalStories });

  } catch (error) {
    console.error("Cultural stories fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
