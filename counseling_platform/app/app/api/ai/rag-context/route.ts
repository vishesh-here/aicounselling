export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabase as supabaseClient } from "@/lib/supabaseClient";
import { OpenAI } from "openai";

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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { child_id, sessionId, conversationId, query } = await request.json();
    if (!child_id) {
      return NextResponse.json({ error: "Child ID is required" }, { status: 400 });
    }

    // 2. Generate embedding for the query/context
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Use the provided query, or fallback to child_id as a string
    const queryText = query || child_id;
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryText
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 3. Call the vector search RPC to get relevant chunks
    const { data: ragChunks, error: ragError } = await supabaseClient.rpc(
      "match_document_chunks",
      {
        query_embedding: queryEmbedding,
        match_count: 8 // or any number you want
      }
    );
    if (ragError) {
      return NextResponse.json({ error: ragError.message }, { status: 500 });
    }

    // 4. Build and return the RAG context
    const ragContext = {
      relevant_knowledge_chunks: ragChunks
    };

    return NextResponse.json({ context: ragContext });
  } catch (error) {
    console.error("Error building RAG context:", error);
    return NextResponse.json(
      { error: "Failed to build RAG context" },
      { status: 500 }
    );
  }
}
