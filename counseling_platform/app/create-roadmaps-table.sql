-- Create roadmaps table for AI-generated session roadmaps
-- Run this in your Supabase SQL Editor

-- Create roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
    roadmap_content JSONB NOT NULL,
    generated_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roadmaps_child_id ON roadmaps(child_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_session_id ON roadmaps(session_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_generated_at ON roadmaps(generated_at);

-- Grant permissions
GRANT ALL ON roadmaps TO authenticated;
GRANT ALL ON roadmaps TO service_role;

-- Enable RLS
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view roadmaps for children they have access to" ON roadmaps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM children c
            LEFT JOIN assignments a ON c.id = a.child_id
            WHERE c.id = roadmaps.child_id 
            AND (a.volunteerId = auth.uid() OR auth.uid() IN (
                SELECT id FROM users WHERE role = 'ADMIN'
            ))
        )
    );

CREATE POLICY "Users can create roadmaps for children they have access to" ON roadmaps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM children c
            LEFT JOIN assignments a ON c.id = a.child_id
            WHERE c.id = roadmaps.child_id 
            AND (a.volunteerId = auth.uid() OR auth.uid() IN (
                SELECT id FROM users WHERE role = 'ADMIN'
            ))
        )
    );

CREATE POLICY "Users can update roadmaps they created" ON roadmaps
    FOR UPDATE USING (
        generated_by = auth.uid()
    );

-- Create trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roadmaps_updated_at 
    BEFORE UPDATE ON roadmaps 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'roadmaps' 
ORDER BY ordinal_position; 