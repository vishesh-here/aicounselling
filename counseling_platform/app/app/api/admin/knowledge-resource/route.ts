import { NextRequest, NextResponse } from "next/server";
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
    // @ts-ignore: raw_user_meta_data may exist in runtime user object
    const role = user?.user_metadata?.role || user?.raw_user_meta_data?.role;
    if (!user || role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      summary,
      content,
      type, // 'knowledge_base' or 'cultural_story'
      tags = [],
      source = null,
      // Any additional fields can be added here
    } = body;

    if (!title || !summary || !content || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Create the knowledge resource entry in Supabase
    const { data: resourceData, error: resourceError } = await supabaseClient
      .from("knowledge_resources")
      .insert([
        {
          title,
          summary,
          content,
          type,
          tags,
          source,
        }
      ])
      .select()
      .single();
    if (resourceError) {
      return NextResponse.json({ error: resourceError.message }, { status: 500 });
    }

    // 2. Chunk the content
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
    const chunks = chunkText(content, chunkSize, chunkOverlap);

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
            knowledgeResourceId: resourceData.id,
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
      { message: "Knowledge resource created and chunked successfully", id: resourceData.id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Knowledge resource creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 