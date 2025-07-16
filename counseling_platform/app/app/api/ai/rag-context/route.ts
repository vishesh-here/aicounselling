export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabase as supabaseClient } from "@/lib/supabaseClient";
import { OpenAI } from "openai";

// In-memory cache for static context
export const staticContextCache = new Map(); // key: child_id, value: { data, expiresAt }
const STATIC_CONTEXT_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

export async function getRagContext(
  supabase: any,
  child_id: string,
  sessionId?: string,
  conversationId?: string,
  query?: string
): Promise<any> {
  // 1. Get static context (profile, concerns, session summaries) from cache or DB
  let staticContext = staticContextCache.get(child_id);
  const now = Date.now();
  if (!staticContext || staticContext.expiresAt < now) {
    // Fetch child profile
    const { data: childProfile, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', child_id)
      .eq('isActive', true)
      .single();
    if (childError || !childProfile) {
      throw new Error('Child not found');
    }
    // Fetch active concerns
    const { data: activeConcerns, error: concernsError } = await supabase
      .from('concerns')
      .select('*')
      .eq('child_id', child_id)
      .eq('status', 'OPEN');
    if (concernsError) {
      throw new Error('Failed to fetch concerns: ' + (typeof concernsError === 'object' && concernsError !== null && 'message' in concernsError ? (concernsError as any).message : String(concernsError)));
    }
    // Get all concern IDs
    const concernIds = (activeConcerns || []).map((c: any) => c.id);
    // Fetch session summaries where these concerns were discussed
    let sessionSummaries: any[] = [];
    if (concernIds.length > 0) {
      // 1. Get all sessions for this child
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id')
        .eq('child_id', child_id);
      if (sessionsError) {
        throw new Error('Failed to fetch sessions: ' + (typeof sessionsError === 'object' && sessionsError !== null && 'message' in sessionsError ? (sessionsError as any).message : String(sessionsError)));
      }
      const sessionIds = (sessions || []).map((s: any) => s.id);
      if (sessionIds.length > 0) {
        // 2. Get all session summaries for these session IDs
        const { data: allSummaries, error: summariesError } = await supabase
          .from('session_summaries')
          .select('*')
          .in('sessionId', sessionIds);
        if (summariesError) {
          throw new Error('Failed to fetch session summaries: ' + (typeof summariesError === 'object' && summariesError !== null && 'message' in summariesError ? (summariesError as any).message : String(summariesError)));
        }
        // 3. Filter summaries where new_concerns or resolved_concerns contains any active concern id
        sessionSummaries = (allSummaries || []).filter((summary: any) => {
          const newConcerns = Array.isArray(summary.new_concerns) ? summary.new_concerns : [];
          const resolvedConcerns = Array.isArray(summary.resolved_concerns) ? summary.resolved_concerns : [];
          return (newConcerns.concat(resolvedConcerns) as string[]).some((cid: string) => concernIds.includes(cid));
        });
      }
    }
    staticContext = {
      data: {
        childProfile,
        activeConcerns,
        sessionSummaries
      },
      expiresAt: now + STATIC_CONTEXT_TTL_MS
    };
    staticContextCache.set(child_id, staticContext);
  }

  // 2. Generate embedding for the query/context
  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const queryText = query || child_id;
  let embeddingResponse;
  try {
    embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryText
    });
  } catch (embeddingErr: any) {
    throw new Error('OpenAI embedding failed: ' + (embeddingErr?.message || String(embeddingErr)));
  }
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // 3. Call the vector search RPC to get relevant chunks
  let ragChunks, ragError;
  try {
    const { supabase: supabaseClient } = await import("@/lib/supabaseClient");
    const rpcRes = await supabaseClient.rpc(
      "match_document_chunks",
      {
        query_embedding: queryEmbedding,
        match_count: 8
      }
    );
    ragChunks = rpcRes.data;
    ragError = rpcRes.error;
  } catch (rpcErr: any) {
    throw new Error('Supabase RPC failed: ' + (rpcErr?.message || String(rpcErr)));
  }
  if (ragError) {
    throw new Error('Supabase RPC returned error: ' + (typeof ragError === 'object' && ragError !== null && 'message' in ragError ? (ragError as any).message : String(ragError)));
  }

  // 4. Build and return the unified RAG context
  // Fetch latest session roadmap if sessionId is provided
  let latestSessionRoadmap = null;
  if (sessionId) {
    const { data: roadmapRows, error: roadmapError } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('session_id', sessionId)
      .order('generated_at', { ascending: false })
      .limit(1);
    if (!roadmapError && roadmapRows && roadmapRows.length > 0) {
      const roadmapRow = roadmapRows[0];
      try {
        latestSessionRoadmap = typeof roadmapRow.roadmap_content === 'string'
          ? JSON.parse(roadmapRow.roadmap_content)
          : roadmapRow.roadmap_content;
      } catch (e) {
        latestSessionRoadmap = null;
      }
    }
  }
  return {
    knowledgeChunks: ragChunks,
    childProfile: staticContext.data.childProfile,
    activeConcerns: staticContext.data.activeConcerns,
    sessionSummaries: staticContext.data.sessionSummaries,
    latestSessionRoadmap
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseWithAuth(request);
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('[RAG] Incoming request body:', requestBody);
    } catch (parseErr) {
      console.error('[RAG] Failed to parse request body:', parseErr);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      console.error('[RAG] Unauthorized: No user found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { child_id, sessionId, conversationId, query } = requestBody;
    if (!child_id) {
      console.error('[RAG] Missing child_id in request body');
      return NextResponse.json({ error: "Child ID is required" }, { status: 400 });
    }

    const ragContext = await getRagContext(supabase, child_id, sessionId, conversationId, query);
    console.log('[RAG] Returning unified context:', ragContext);
    return NextResponse.json(ragContext);
  } catch (error) {
    console.error("[RAG] Error building RAG context (outer catch):", error);
    return NextResponse.json(
      { error: "Failed to build RAG context", details: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error) },
      { status: 500 }
    );
  }
}
