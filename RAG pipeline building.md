# RAG Pipeline Building: Step-by-Step Implementation Guide

This document details the end-to-end implementation of the Retrieval-Augmented Generation (RAG) pipeline and AI features for the volunteer-led child counseling platform. It is intended for knowledge transfer (KT) and onboarding of new team members.

---

## 1. **Architecture Overview**

- **Embedding Model:** OpenAI `text-embedding-3-small` (chunk size: 300, overlap: 50)
- **Vector DB:** Supabase with `pgvector` extension
- **LLM for Inference:** Google Gemini 1.5 Flash (mocked for now)
- **Knowledge Sources:** Cultural stories, counseling frameworks, and knowledge base documents
- **Frontend:** Next.js (React) with Supabase client

---

## 2. **Database Setup (Supabase)**

### a. Enable pgvector
- In Supabase SQL editor:
  ```sql
  create extension if not exists vector;
  ```

### b. Update `document_chunks` Table
- Add a vector column for embeddings:
  ```sql
  ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(1536);
  ```

### c. Create `session_roadmaps` Table
- Stores generated roadmaps for each session:
  ```sql
  create table if not exists session_roadmaps (
    id uuid primary key default gen_random_uuid(),
    session_id text references sessions(id),
    child_id text references children(id),
    roadmap_json jsonb not null,
    created_by text references users(id),
    created_at timestamptz default now()
  );
  ```

### d. Create `feature_flags` Table
- For global feature toggles (e.g., AI chat availability):
  ```sql
  create table if not exists feature_flags (
    key text primary key,
    value boolean not null,
    updated_at timestamptz default now()
  );
  ```

### e. Vector Search RPC Function
- Add a function for vector similarity search:
  ```sql
  create or replace function match_document_chunks(
    query_embedding vector(1536),
    match_count int default 5
  )
  returns table (
    id text,
    knowledgeBaseId text,
    content text,
    chunkIndex int,
    embedding vector(1536),
    similarity float
  )
  language plpgsql
  as $$
  begin
    return query
      select
        id,
        knowledgeBaseId,
        content,
        chunkIndex,
        embedding,
        1 - (embedding <#> query_embedding) as similarity
      from document_chunks
      order by embedding <#> query_embedding
      limit match_count;
  end;
  $$;
  ```

---

## 3. **Backend Implementation (API Routes)**

### a. Knowledge Ingestion (Admin UI)
- **Files:** `app/api/admin/knowledge-base/route.ts`, `app/api/admin/cultural-stories/route.ts`
- **Logic:**
  1. Accepts new knowledge/cultural story uploads from the admin UI.
  2. Chunks the content (size 300, overlap 50).
  3. Calls OpenAI to generate embeddings for each chunk.
  4. Inserts each chunk into `document_chunks` with the embedding (vector) column using Supabase client.
  5. No Prisma usage—only Supabase.

### b. RAG Context Retrieval
- **File:** `app/api/ai/rag-context/route.ts`
- **Logic:**
  1. Receives a query/context (e.g., child profile, session notes).
  2. Calls OpenAI to embed the query/context.
  3. Calls the Supabase RPC (`match_document_chunks`) to retrieve the most relevant knowledge chunks.
  4. Returns these chunks as part of the RAG context for downstream APIs.

### c. Roadmap Generation
- **File:** `app/api/ai/generate-roadmap/route.ts`
- **Logic:**
  1. Receives a POST request with `child_id`, `session_id`, and context.
  2. Calls `/api/ai/rag-context` to get relevant knowledge chunks.
  3. Builds a prompt for Gemini LLM (mocked for now) including child profile, session summaries, and retrieved chunks.
  4. Generates the roadmap and saves it to `session_roadmaps` in Supabase.
  5. Returns the roadmap to the UI.

### d. AI Chat
- **File:** `app/api/ai/chat/route.ts`
- **Logic:**
  1. Receives a POST request with user message, child_id, sessionId, conversationId.
  2. Calls `/api/ai/rag-context` to get relevant knowledge chunks for the chat turn.
  3. Builds a prompt for Gemini LLM (mocked for now) including chat history and RAG context.
  4. Generates the assistant’s response.
  5. Saves user and assistant messages to `ai_chat_messages` and conversation metadata to `ai_chat_conversations` in Supabase.
  6. Returns the response and updated conversationId to the UI.

---

## 4. **Frontend Integration (Next.js/React)**

### a. Roadmap Generation
- **Components:** `PreSessionBriefing`, `SessionInterface`
- **Flow:**
  1. User clicks “Generate Roadmap” button.
  2. Component sends a POST request to `/api/ai/enhanced-roadmap` or `/api/ai/generate-roadmap`.
  3. Displays the returned roadmap in a Card UI.

### b. AI Chat
- **Component:** `AiChatPanel`
- **Flow:**
  1. User opens the chat panel and sends a message.
  2. Component sends a POST request to `/api/ai/chat`.
  3. Displays the assistant’s response and maintains chat history in the UI.

---

## 5. **Feature Flags**
- The `feature_flags` table allows toggling features (e.g., enabling/disabling AI chat) globally from the admin panel or backend.

---

## 6. **Testing & Validation**
- Test knowledge uploads and ensure chunks/embeddings are created in `document_chunks`.
- Test roadmap and chat features from the UI and confirm data is saved in Supabase tables.
- Validate RAG retrieval by checking that relevant knowledge is surfaced in both roadmap and chat contexts.

---

## 7. **Next Steps & Recommendations**
- Replace the Gemini mock with the real API when available.
- Monitor Supabase usage and optimize chunk size or retrieval count as needed.
- Expand admin UI for better KB management and feature flag control.

---

**For questions or onboarding, contact the tech lead or refer to this document for the RAG pipeline architecture and flow.** 