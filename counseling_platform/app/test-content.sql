-- Test to see if content is actually stored
SELECT 
    id,
    title,
    type,
    LENGTH(content) as content_length,
    LEFT(content, 200) as content_preview
FROM knowledge_base 
WHERE content IS NOT NULL 
  AND content != ''
ORDER BY "createdAt" DESC 
LIMIT 3; 