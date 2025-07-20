import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from "openai";

export const dynamic = "force-dynamic";



export async function GET(request: NextRequest) {
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

    // Fetch all knowledge base resources
    const { data: resources, error: resourcesError } = await supabaseAdmin
      .from("knowledge_base")
      .select("*")
      .order("createdAt", { ascending: false });

    if (resourcesError) {
      console.error("Error fetching knowledge resources:", resourcesError);
      return NextResponse.json({ error: resourcesError.message }, { status: 500 });
    }

    return NextResponse.json(resources || []);

  } catch (error) {
    console.error("Knowledge resources fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      summary,
      content,
      type, // 'knowledge_base' or 'cultural_story'
      category,
      subCategory,
      source = null,
      themes = [],
      tags = [],
      applicableFor = [],
      // Any additional fields can be added here
    } = body;

    if (!title || !summary || !content || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Create the knowledge resource entry in Supabase
    const { data: resourceData, error: resourceError } = await supabaseAdmin
      .from("knowledge_base")
      .insert([
        {
          id: crypto.randomUUID(), // Generate a UUID for the id field
          title,
          summary,
          content,
          type, // Use the new type field
          category: category || (type === 'cultural_story' ? 'CULTURAL_WISDOM' : 'CAREER_GUIDANCE'), // Use provided category or default
          subCategory: subCategory || null,
          tags, // Use the new tags array field
          source: source || null, // Use source for cultural stories
          themes: themes || [], // Use themes for cultural stories
          applicableFor: applicableFor || [], // Use applicableFor field
          createdById: user.id,
          createdAt: new Date().toISOString(), // Set creation timestamp
          updatedAt: new Date().toISOString(), // Set update timestamp
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
      const { error: chunkError } = await supabaseAdmin
        .from("document_chunks")
        .insert([
          {
            id: crypto.randomUUID(), // Generate a UUID for the id field
            knowledgeBaseId: resourceData.id,
            content: chunks[i],
            chunkIndex: i,
            embedding: embeddings[i] // Store in the vector column, not jsonb
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