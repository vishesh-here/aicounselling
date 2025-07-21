-- Simple check to see what's actually in the content column
SELECT 
    id,
    title,
    type,
    LEFT(content, 100) as content_preview
FROM knowledge_base 
ORDER BY createdAt DESC 
LIMIT 5; 