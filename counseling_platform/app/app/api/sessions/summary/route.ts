import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { staticContextCache } from "../../ai/rag-context/route";

export const dynamic = "force-dynamic";

function getSupabaseWithAuth(req: NextRequest) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseWithAuth(request);
    
    // Authenticate user separately
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader) {
      // Extract token from Authorization header
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
      if (userError) {
        console.error('Auth error:', userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = authUser;
    } else {
      // Try to get user from cookies
      const cookieStore = cookies();
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = authUser;
    }
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, summaryData, isDraft = false } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Check if session exists and belongs to the user
    const { data: sessionRecord, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    if (sessionError || !sessionRecord) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (sessionRecord.volunteerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to session" }, { status: 403 });
    }

    // Prepare the summary data for database
    const summaryPayload = {
      sessionid: sessionId,
      summary: summaryData.summary,
      effectiveness: summaryData.effectiveness,
      followup_notes: summaryData.followup_notes,
      new_concerns: summaryData.new_concerns,
      resolved_concerns: summaryData.resolved_concerns,
      next_session_date: summaryData.next_session_date ? summaryData.next_session_date : null,
      updatedat: new Date().toISOString(),
    };

    // Upsert session summary
    const { data: existingSummary, error: findError } = await supabase
      .from('session_summaries')
      .select('*')
      .eq('sessionid', sessionId)
      .maybeSingle();
    if (findError) throw findError;
    let result;
    if (existingSummary) {
      result = await supabase
        .from('session_summaries')
        .update(summaryPayload)
        .eq('sessionid', sessionId);
    } else {
      result = await supabase
        .from('session_summaries')
        .insert({ ...summaryPayload, createdat: new Date().toISOString() });
    }
    if (result.error) throw result.error;

    // Invalidate static RAG context cache for this child
    if (sessionRecord && sessionRecord.child_id) {
      staticContextCache.delete(sessionRecord.child_id);
    }

    // Update concerns table for new and resolved concerns
    const childId = sessionRecord.child_id;
    const now = new Date().toISOString();
    // Insert new concerns
    if (summaryData.new_concerns && Array.isArray(summaryData.new_concerns) && summaryData.new_concerns.length > 0) {
      // new_concerns should be array of objects: { title, category, severity, description }
      const concernRows = summaryData.new_concerns.map((c: any) => ({
        child_id: childId,
        title: c.title,
        description: c.description || "Identified during session",
        category: c.category || "SOCIAL",
        severity: c.severity || "MEDIUM",
        status: 'OPEN',
        createdAt: now
      }));
      const { error: insertError } = await supabase.from('concerns').insert(concernRows);
      if (insertError) console.error("INSERT ERROR:", insertError);
      console.log("Child ID for new concerns:", childId);
    }
    // Resolve concerns
    if (summaryData.resolved_concerns && Array.isArray(summaryData.resolved_concerns) && summaryData.resolved_concerns.length > 0) {
      const { error: updateError } = await supabase.from('concerns')
        .update({ status: 'RESOLVED', resolvedAt: now })
        .in('id', summaryData.resolved_concerns);
      if (updateError) console.error("UPDATE ERROR:", updateError);
      console.log("Resolved concern IDs:", summaryData.resolved_concerns);
    }

    // If not a draft, also update the session status
    if (!isDraft) {
      const { error: sessionUpdateError } = await supabase
        .from('sessions')
        .update({
          status: 'COMPLETED',
          endedAt: now,
          updatedAt: now
        })
        .eq('id', sessionId);
      if (sessionUpdateError) throw sessionUpdateError;
    }

    return NextResponse.json({
      success: true,
      message: isDraft ? "Summary saved as draft" : "Session summary submitted successfully",
      shouldRefetch: true
    });
  } catch (error) {
    console.error("Error saving session summary:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save session summary"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseWithAuth(request);
    
    // Authenticate user separately
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader) {
      // Extract token from Authorization header
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
      if (userError) {
        console.error('Auth error:', userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = authUser;
    } else {
      // Try to get user from cookies
      const cookieStore = cookies();
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = authUser;
    }
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Get session summary using Supabase
    const { data: summary, error: summaryError } = await supabase
      .from('session_summaries')
      .select('*, session:sessions(*, child:children(*), volunteer:users(*))')
      .eq('sessionid', sessionId)
      .single();

    if (summaryError || !summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error("Error fetching session summary:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch session summary"
    }, { status: 500 });
  }
}
