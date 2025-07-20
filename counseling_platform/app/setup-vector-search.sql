-- Enable pgvector extension
create extension if not exists vector;

-- Update document_chunks table to add vector column for embeddings
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create vector search RPC function
create or replace function match_document_chunks(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id text,
  "knowledgeBaseId" text,
  content text,
  "chunkIndex" int,
  embedding vector(1536),
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      dc.id,
      dc."knowledgeBaseId",
      dc.content,
      dc."chunkIndex",
      dc.embedding,
      1 - (dc.embedding <#> query_embedding) as similarity
    from document_chunks dc
    where dc.embedding is not null
    order by dc.embedding <#> query_embedding
    limit match_count;
end;
$$; 