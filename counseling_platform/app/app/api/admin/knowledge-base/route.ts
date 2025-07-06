import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

function getSupabaseWithAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  let globalHeaders: Record<string, string> = {};
  if (authHeader) {
    globalHeaders['Authorization'] = authHeader;
  } else {
    const cookieStore = cookies();
    globalHeaders['Cookie'] = cookieStore.toString();
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { global: { headers: globalHeaders } });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseWithAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || user.user_metadata.role !== "ADMIN") {
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
        createdById: user.id
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
    const supabase = getSupabaseWithAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
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
