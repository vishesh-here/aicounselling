-- Seed script for Supabase database with simplified schema
-- This script should be run after updating the session_summaries table

-- First, let's run the session_summaries schema update
\i update-session-summaries-schema.sql

-- Now let's create some sample session summaries with the new schema
INSERT INTO session_summaries (sessionId, summary, effectiveness, followup_notes, new_concerns, resolved_concerns, next_session_date)
SELECT 
    s.id,
    'Productive counseling session with ' || c.name || '. Discussed academic challenges and provided guidance using cultural wisdom and evidence-based techniques.',
    CASE 
        WHEN s.status = 'COMPLETED' THEN 'Very Effective'
        WHEN s.status = 'IN_PROGRESS' THEN 'Effective'
        ELSE 'Neutral'
    END,
    CASE 
        WHEN s.status != 'COMPLETED' THEN 'Follow up needed to continue progress'
        ELSE 'Session completed successfully'
    END,
    CASE 
        WHEN s.status = 'PLANNED' THEN '[{"title": "Need additional support", "description": "Child may need more sessions"}]'::jsonb
        ELSE NULL
    END,
    CASE 
        WHEN s.status = 'COMPLETED' THEN ARRAY['concern-id-1', 'concern-id-2']
        ELSE NULL
    END,
    CASE 
        WHEN s.status != 'COMPLETED' THEN CURRENT_DATE + INTERVAL '7 days'
        ELSE NULL
    END
FROM sessions s
JOIN children c ON s.childId = c.id
WHERE s.status = 'COMPLETED'
LIMIT 10;

-- Update some sessions to have summaries
UPDATE sessions 
SET status = 'COMPLETED', 
    endedAt = startedAt + INTERVAL '1 hour'
WHERE status = 'IN_PROGRESS' 
LIMIT 5;

-- Create more session summaries for the updated sessions
INSERT INTO session_summaries (sessionId, summary, effectiveness, followup_notes, new_concerns, resolved_concerns, next_session_date)
SELECT 
    s.id,
    'Follow-up session with ' || c.name || '. Made good progress on previous concerns and identified new areas for support.',
    'Effective',
    'Continue with current approach, monitor progress',
    '[{"title": "Building confidence", "description": "Child needs support in building self-confidence"}]'::jsonb,
    ARRAY['concern-id-3'],
    CURRENT_DATE + INTERVAL '14 days'
FROM sessions s
JOIN children c ON s.childId = c.id
WHERE s.status = 'COMPLETED' 
AND s.id NOT IN (SELECT sessionId FROM session_summaries)
LIMIT 5;

-- Verify the data
SELECT 
    ss.id,
    ss.summary,
    ss.effectiveness,
    ss.followup_notes,
    ss.new_concerns,
    ss.resolved_concerns,
    ss.next_session_date,
    s.status as session_status,
    c.name as child_name
FROM session_summaries ss
JOIN sessions s ON ss.sessionId = s.id
JOIN children c ON s.childId = c.id
LIMIT 10; 