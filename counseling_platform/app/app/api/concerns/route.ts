import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { child_id, title, description, category, severity } = body;
    if (!child_id || !title || !category || !severity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("concerns").insert([
      {
        child_id,
        title,
        description: description || "",
        category,
        severity,
        status: "OPEN",
        createdAt: now,
      },
    ]).select().single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ concern: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 