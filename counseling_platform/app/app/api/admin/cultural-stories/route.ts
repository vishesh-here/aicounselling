//This file is obsolete, we are not using it anymore.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth-config";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { OpenAI } from "openai";
import { supabase as supabaseClient } from "@/lib/supabaseClient";

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

    // 1. Create the cultural story entry in Supabase
    const { data: storyData, error: storyError } = await supabaseClient
      .from("cultural_stories")
      .insert([
        {
          title,
          summary,
          fullStory,
          source,
          themes,
          applicableFor,
          moralLessons,
          tags,
          createdById: user.id
        }
      ])
      .select()
      .single();
    if (storyError) {
      return NextResponse.json({ error: storyError.message }, { status: 500 });
    }

    // 2. Chunk the fullStory
    function chunkText(text: string, chunkSize: number, overlap: number): string[] {
      const chunks = [];
      let start = 0;
      while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
      }
      return chunks;
    }
    const chunkSize = 300;
    const chunkOverlap = 50;
    const chunks = chunkText(fullStory, chunkSize, chunkOverlap);

    // 3. Embed each chunk using OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const embeddings: number[][] = [];
    for (const chunk of chunks) {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk
      });
      embeddings.push(response.data[0].embedding);
    }

    // 4. Store each chunk in document_chunks with the embedding (vector) column
    for (let i = 0; i < chunks.length; i++) {
      const { error: chunkError } = await supabaseClient
        .from("document_chunks")
        .insert([
          {
            knowledgeBaseId: storyData.id, // Use the same field for linking
            content: chunks[i],
            chunkIndex: i,
            embedding: embeddings[i]
          }
        ]);
      if (chunkError) {
        return NextResponse.json({ error: chunkError.message }, { status: 500 });
      }
    }

    return NextResponse.json(
      { message: "Cultural story created and chunked successfully", id: storyData.id },
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
    const supabase = getSupabaseWithAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
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
