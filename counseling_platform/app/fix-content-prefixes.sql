-- Fix content prefixes - Remove "cultural_story" and "knowledge_base" from content
-- This script will clean up the content by removing the type prefixes

-- Step 1: Remove "cultural_story " prefix from content
UPDATE knowledge_base 
SET content = TRIM(SUBSTRING(content FROM 16))  -- 16 = length of "cultural_story "
WHERE content LIKE 'cultural_story %';

-- Step 2: Remove "knowledge_base " prefix from content  
UPDATE knowledge_base 
SET content = TRIM(SUBSTRING(content FROM 16))  -- 16 = length of "knowledge_base "
WHERE content LIKE 'knowledge_base %';

-- Step 3: Verify the changes
SELECT 
    id,
    title,
    type,
    LEFT(content, 100) as content_preview
FROM knowledge_base 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Step 4: Count how many records were affected
SELECT 
    type,
    COUNT(*) as count
FROM knowledge_base 
GROUP BY type; 