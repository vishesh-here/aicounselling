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
    
    // Calculate age from dateOfBirth
    let age = null;
    if (childProfile.dateOfBirth) {
      const birthDate = new Date(childProfile.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    
    // Enhance child profile with calculated fields
    const enhancedChildProfile = {
      ...childProfile,
      name: childProfile.fullName, // Map fullName to name
      age: age,
      district: childProfile.currentCity, // Map currentCity to district
      schoolLevel: childProfile.currentClassSemester // Map currentClassSemester to schoolLevel
    };
    
    console.log('[RAG] Enhanced child profile:', {
      originalName: childProfile.fullName,
      mappedName: enhancedChildProfile.name,
      calculatedAge: enhancedChildProfile.age,
      district: enhancedChildProfile.district,
      schoolLevel: enhancedChildProfile.schoolLevel
    });
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
          .in('sessionid', sessionIds);
        if (summariesError) {
          throw new Error('Failed to fetch session summaries: ' + (typeof summariesError === 'object' && summariesError !== null && 'message' in summariesError ? (summariesError as any).message : String(summariesError)));
        }
        // 3. Show all session summaries for the child (less restrictive filtering)
        sessionSummaries = allSummaries || [];
        console.log('[RAG] Session summaries found:', sessionSummaries.length);
        sessionSummaries.forEach((summary: any) => {
          console.log('[RAG] Session summary:', {
            sessionId: summary.sessionid,
            summaryLength: summary.summary?.length || 0
          });
        });
      }
    }
    staticContext = {
      data: {
        childProfile: enhancedChildProfile,
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
  
  // Improve query text for better matching
  let queryText = query || child_id;
  
  // If query is too generic, enhance it with context
  if (!query || query.toLowerCase().includes('summary') || query.toLowerCase().includes('tell me about')) {
    // Use child's active concerns to create a more specific query
    const concernTitles = (staticContext.data.activeConcerns || []).map((c: any) => c.title).join(' ');
    if (concernTitles) {
      queryText = `${query} ${concernTitles}`;
      console.log('[RAG] Enhanced query text:', queryText);
    }
  }
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
  let ragChunks = [];
  let ragError;
  try {
    const { supabase: supabaseClient } = await import("@/lib/supabaseClient");
    console.log('[RAG] Query text:', queryText);
    console.log('[RAG] Query embedding length:', queryEmbedding.length);
    
    const rpcRes = await supabaseClient.rpc(
      "match_document_chunks",
      {
        query_embedding: queryEmbedding,
        match_count: 8
      }
    );
    ragChunks = rpcRes.data || [];
    ragError = rpcRes.error;
    
    console.log('[RAG] Vector search results:', {
      chunksFound: ragChunks.length,
      error: ragError,
      firstChunk: ragChunks[0] ? { 
        id: ragChunks[0].id, 
        similarity: ragChunks[0].similarity,
        content: ragChunks[0].content.substring(0, 100) + '...' 
      } : null,
      allChunks: ragChunks.map((chunk: any) => ({
        id: chunk.id,
        similarity: chunk.similarity,
        contentLength: chunk.content.length
      }))
    });
  } catch (rpcErr: any) {
    console.warn('Vector search failed, continuing without knowledge chunks:', rpcErr?.message || String(rpcErr));
    ragChunks = [];
  }
  if (ragError) {
    console.warn('Supabase RPC returned error, continuing without knowledge chunks:', ragError);
    ragChunks = [];
  }
  
  // Fallback: If no chunks found, get some general knowledge base chunks
  if (ragChunks.length === 0) {
    console.log('[RAG] No chunks found, getting fallback knowledge base chunks');
    try {
      const { data: fallbackChunks, error: fallbackError } = await supabase
        .from('document_chunks')
        .select('id, knowledgeBaseId, content, chunkIndex')
        .limit(3)
        .order('chunkIndex', { ascending: true });
      
      if (!fallbackError && fallbackChunks && fallbackChunks.length > 0) {
        ragChunks = fallbackChunks.map((chunk: any) => ({
          ...chunk,
          similarity: 0.5 // Default similarity for fallback chunks
        }));
        console.log('[RAG] Fallback chunks added:', ragChunks.length);
      }
    } catch (fallbackErr) {
      console.warn('[RAG] Fallback chunk retrieval failed:', fallbackErr);
    }
  }
  
  // Always ensure we have some knowledge chunks (minimum 2)
  if (ragChunks.length < 2) {
    console.log('[RAG] Ensuring minimum knowledge chunks');
    try {
      const { data: additionalChunks, error: additionalError } = await supabase
        .from('document_chunks')
        .select('id, knowledgeBaseId, content, chunkIndex')
        .limit(2 - ragChunks.length)
        .order('chunkIndex', { ascending: true });
      
      if (!additionalError && additionalChunks && additionalChunks.length > 0) {
        const newChunks = additionalChunks.map((chunk: any) => ({
          ...chunk,
          similarity: 0.3 // Lower similarity for additional chunks
        }));
        ragChunks = [...ragChunks, ...newChunks];
        console.log('[RAG] Additional chunks added, total:', ragChunks.length);
      }
    } catch (additionalErr) {
      console.warn('[RAG] Additional chunk retrieval failed:', additionalErr);
    }
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
        console.log('[RAG] Latest roadmap found for session:', sessionId);
      } catch (e) {
        console.warn('[RAG] Failed to parse roadmap content:', e);
        latestSessionRoadmap = null;
      }
    } else {
      console.log('[RAG] No roadmap found for session:', sessionId);
    }
  } else {
    console.log('[RAG] No sessionId provided, skipping roadmap fetch');
  }
  const finalContext = {
    knowledgeChunks: ragChunks,
    childProfile: staticContext.data.childProfile,
    activeConcerns: staticContext.data.activeConcerns,
    sessionSummaries: staticContext.data.sessionSummaries,
    latestSessionRoadmap
  };
  
  console.log('[RAG] Final context summary:', {
    knowledgeChunksCount: ragChunks.length,
    activeConcernsCount: staticContext.data.activeConcerns.length,
    sessionSummariesCount: staticContext.data.sessionSummaries.length,
    hasRoadmap: !!latestSessionRoadmap,
    chunkDetails: ragChunks.slice(0, 2).map((chunk: any) => ({
      id: chunk.id,
      similarity: chunk.similarity,
      contentPreview: chunk.content.substring(0, 50) + '...'
    }))
  });
  
  return finalContext;
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
