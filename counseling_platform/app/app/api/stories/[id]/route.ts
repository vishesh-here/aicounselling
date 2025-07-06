import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { prisma } from "@/lib/db";

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseWithAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const story = await prisma.culturalStory.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      }
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(story);

  } catch (error) {
    console.error("Story fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
