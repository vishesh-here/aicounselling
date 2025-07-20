-- SQL Script to Fix Knowledge Base Data
-- This script will:
-- 1. Update the type column based on content
-- 2. Remove "Type: " prefixes from content
-- 3. Fix any other data inconsistencies

-- Step 1: Update type column based on content
UPDATE knowledge_base 
SET type = 'cultural_story' 
WHERE content LIKE 'Type: cultural_story%' 
   OR content LIKE 'Type: cultural_story%';

UPDATE knowledge_base 
SET type = 'knowledge_base' 
WHERE content LIKE 'Type: knowledge_base%' 
   OR content LIKE 'Type: knowledge_base%';

-- Step 2: Remove "Type: " prefixes from content
UPDATE knowledge_base 
SET content = TRIM(SUBSTRING(content FROM POSITION(' ' IN content) + 1))
WHERE content LIKE 'Type: cultural_story%' 
   OR content LIKE 'Type: knowledge_base%';

-- Step 3: Set default category for resources that don't have proper category
UPDATE knowledge_base 
SET category = 'CULTURAL_WISDOM' 
WHERE type = 'cultural_story' 
  AND category IS NULL;

UPDATE knowledge_base 
SET category = 'CAREER_GUIDANCE' 
WHERE type = 'knowledge_base' 
  AND category IS NULL;

-- Step 4: Set isActive to true for all resources (if not already set)
UPDATE knowledge_base 
SET isActive = true 
WHERE isActive IS NULL;

-- Step 5: Verify the changes
SELECT 
    id,
    title,
    type,
    category,
    LEFT(content, 100) as content_preview
FROM knowledge_base 
ORDER BY createdAt DESC 
LIMIT 10;

-- Step 6: Count by type to verify distribution
SELECT 
    type,
    COUNT(*) as count
FROM knowledge_base 
GROUP BY type;

-- Step 7: Count by category to verify distribution
SELECT 
    category,
    COUNT(*) as count
FROM knowledge_base 
GROUP BY category; 