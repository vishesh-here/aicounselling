-- Update session_summaries table to match frontend expectations
-- Drop all the complex fields and keep only what the frontend needs

-- First, let's see what the current table looks like
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'session_summaries' 
ORDER BY ordinal_position;

-- Drop the complex session_summaries table and recreate it with simple schema
DROP TABLE IF EXISTS session_summaries CASCADE;

-- Create new simplified session_summaries table
CREATE TABLE session_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sessionId UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    effectiveness VARCHAR(50) NOT NULL, -- 'Very Effective', 'Effective', 'Neutral', 'Not Effective', 'Needs Support'
    followup_notes TEXT,
    new_concerns JSONB, -- Array of objects: [{ title: string, description?: string, category?: string, severity?: string }]
    resolved_concerns TEXT[], -- Array of concern IDs that were resolved
    next_session_date DATE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_session_summaries_session_id ON session_summaries(sessionId);

-- Grant permissions
GRANT ALL ON session_summaries TO authenticated;
GRANT ALL ON session_summaries TO service_role;


-- Create trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_summaries_updated_at 
    BEFORE UPDATE ON session_summaries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the new table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'session_summaries' 
ORDER BY ordinal_position; 