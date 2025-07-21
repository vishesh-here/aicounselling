import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { staticContextCache } from "../../ai/rag-context/route";
import crypto from 'crypto';

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to get user from authorization header (consistent with other APIs)
async function getUserFromAuthHeader(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization header' };
  }
  
  const accessToken = authHeader.replace('Bearer ', '');
  
  // Create client with anon key
  const client = createClient(supabaseUrl, supabaseAnonKey);
  
  // Get user directly using the access token
  const { data: { user }, error } = await client.auth.getUser(accessToken);
  
  return { user, error };
}

function getSupabaseWithAuth(req: NextRequest) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== SESSION SUMMARY POST REQUEST ===');
    
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(req);
    
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const requestData = await req.json();
    console.log('Summary data received:', requestData);

    const { sessionId, summaryData, isDraft = false } = requestData;
    const { summary, effectiveness, followup_notes, new_concerns, resolved_concerns, next_session_date } = summaryData || {};

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Check if session exists and belongs to the user
    const { data: sessionRecord, error: sessionError } = await supabaseAdmin
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
      summary: summary,
      effectiveness: effectiveness,
      followup_notes: followup_notes,
      new_concerns: new_concerns,
      resolved_concerns: resolved_concerns,
      next_session_date: next_session_date ? next_session_date : null,
      updatedat: new Date().toISOString(),
    };

    // Upsert session summary
    const { data: existingSummary, error: findError } = await supabaseAdmin
      .from('session_summaries')
      .select('*')
      .eq('sessionid', sessionId)
      .maybeSingle();
    if (findError) throw findError;
    let result;
    if (existingSummary) {
      result = await supabaseAdmin
        .from('session_summaries')
        .update(summaryPayload)
        .eq('sessionid', sessionId);
    } else {
      result = await supabaseAdmin
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
    
    console.log('Processing concerns for child:', childId);
    console.log('New concerns received:', new_concerns);
    console.log('Resolved concerns received:', resolved_concerns);
    
    // Insert new concerns
    if (new_concerns && Array.isArray(new_concerns) && new_concerns.length > 0) {
      console.log('=== PROCESSING NEW CONCERNS ===');
      console.log('Raw new_concerns data:', JSON.stringify(new_concerns, null, 2));
      
      // Map concerns to match Supabase table schema exactly
      const concernRows = new_concerns.map((c: any) => ({
        id: crypto.randomUUID(),
        child_id: childId,
        title: c.title || 'Untitled Concern',
        description: c.description || 'Identified during session',
        category: (c.category || 'BEHAVIORAL').toUpperCase(),
        severity: (c.severity || 'MEDIUM').toUpperCase(),
        status: 'OPEN',
        identifiedAt: now, // Required field - when the concern was identified
        createdAt: now,    // Using exact column names from schema
        updatedAt: now
      }));
      
      console.log('=== CONCERN ROWS TO INSERT ===');
      console.log(JSON.stringify(concernRows, null, 2));
      
      try {
        const { data: insertedConcerns, error: insertError } = await supabaseAdmin
          .from('concerns')
          .insert(concernRows)
          .select();
        
        if (insertError) {
          console.error('=== CONCERN INSERT ERROR ===');
          console.error('Error details:', insertError);
          console.error('Error message:', insertError.message);
          console.error('Error hint:', insertError.hint);
          console.error('Error code:', insertError.code);
          console.error('Failed concern rows:', JSON.stringify(concernRows, null, 2));
          
          // Don't fail the entire request, just log the error
          console.error('Continuing despite concern insertion failure...');
        } else {
          console.log('=== SUCCESSFULLY INSERTED CONCERNS ===');
          console.log('Inserted concerns:', JSON.stringify(insertedConcerns, null, 2));
        }
      } catch (err) {
        console.error('=== UNEXPECTED ERROR DURING CONCERN INSERTION ===');
        console.error('Exception:', err);
      }
    } else {
      console.log('=== NO NEW CONCERNS TO PROCESS ===');
      console.log('new_concerns data:', new_concerns);
    }
    // Resolve concerns
    if (resolved_concerns && Array.isArray(resolved_concerns) && resolved_concerns.length > 0) {
      const { error: updateError } = await supabaseAdmin.from('concerns')
        .update({ status: 'RESOLVED', resolvedAt: now })
        .in('id', resolved_concerns);
      if (updateError) console.error("UPDATE ERROR:", updateError);
      console.log("Resolved concern IDs:", resolved_concerns);
    }

    // If not a draft, also update the session status
    if (!isDraft) {
      const { error: sessionUpdateError } = await supabaseAdmin
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
    
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
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
