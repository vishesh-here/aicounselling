
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
    const { title, summary, content, category, subCategory } = body;

    if (!title || !summary || !content || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const knowledgeBase = await prisma.knowledgeBase.create({
      data: {
        title,
        summary,
        content,
        category,
        subCategory: subCategory || null,
        createdById: session.user.id
      }
    });

    return NextResponse.json(
      { message: "Knowledge base entry created successfully", id: knowledgeBase.id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Knowledge base creation error:", error);
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

    const knowledgeBase = await prisma.knowledgeBase.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
          select: { name: true }
        },
        tags: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ knowledgeBase });

  } catch (error) {
    console.error("Knowledge base fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
