import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create service role client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from authorization header for authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore: raw_user_meta_data may exist in runtime user object
    const role = user?.user_metadata?.role || user?.raw_user_meta_data?.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Fetch the knowledge base resource
    const { data: resource, error: resourceError } = await supabaseAdmin
      .from("knowledge_base")
      .select("*")
      .eq("id", id)
      .single();

    console.log("API: Raw database response:", {
      hasData: !!resource,
      error: resourceError,
      columnNames: resource ? Object.keys(resource) : []
    });

    if (resourceError || !resource) {
      console.error("Error fetching knowledge resource:", resourceError);
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    console.log("API: Resource fetched:", {
      id: resource.id,
      title: resource.title,
      contentLength: resource.content ? resource.content.length : 0,
      hasContent: !!resource.content,
      contentPreview: resource.content ? resource.content.substring(0, 100) : 'NO CONTENT'
    });

    console.log("API: Full resource object:", JSON.stringify(resource, null, 2));

    return NextResponse.json(resource);

  } catch (error) {
    console.error("Knowledge resource fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create service role client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from authorization header for authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore: raw_user_meta_data may exist in runtime user object
    const role = user?.user_metadata?.role || user?.raw_user_meta_data?.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // First, delete associated document chunks
    const { error: chunksError } = await supabaseAdmin
      .from("document_chunks")
      .delete()
      .eq("knowledgeBaseId", id);

    if (chunksError) {
      console.error("Error deleting document chunks:", chunksError);
      return NextResponse.json({ error: chunksError.message }, { status: 500 });
    }

    // Then, delete the knowledge base resource
    const { error: resourceError } = await supabaseAdmin
      .from("knowledge_base")
      .delete()
      .eq("id", id);

    if (resourceError) {
      console.error("Error deleting knowledge resource:", resourceError);
      return NextResponse.json({ error: resourceError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Knowledge resource deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Knowledge resource deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 