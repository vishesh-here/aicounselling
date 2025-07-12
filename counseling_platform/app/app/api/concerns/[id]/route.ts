import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const concernId = params.id;
    if (!concernId) {
      return NextResponse.json({ error: "Missing concern id" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("concerns")
      .update({ status: "RESOLVED", resolvedAt: now })
      .eq("id", concernId)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ concern: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 