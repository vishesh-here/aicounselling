-- Debug script to see what's in the content column
-- Run this first to understand the data format

-- 1. Check what types of prefixes we have
SELECT 
    id,
    LEFT(content, 30) as content_start,
    type
FROM knowledge_base 
ORDER BY createdAt DESC 
LIMIT 10;

-- 2. Check for cultural_story prefix specifically
SELECT 
    id,
    LEFT(content, 50) as content_start,
    type
FROM knowledge_base 
WHERE content LIKE 'cultural_story%'
LIMIT 5;

-- 3. Check for knowledge_base prefix specifically  
SELECT 
    id,
    LEFT(content, 50) as content_start,
    type
FROM knowledge_base 
WHERE content LIKE 'knowledge_base%'
LIMIT 5;

-- 4. Test REPLACE function on one record
SELECT 
    id,
    content as original_content,
    REPLACE(content, 'cultural_story ', '') as after_replace,
    LENGTH(content) as original_length,
    LENGTH(REPLACE(content, 'cultural_story ', '')) as new_length
FROM knowledge_base 
WHERE content LIKE 'cultural_story%'
LIMIT 1; 