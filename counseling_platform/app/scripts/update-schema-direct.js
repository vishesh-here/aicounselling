const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSql(sql) {
  try {
    console.log('🚀 Executing SQL...');
    // Use the REST API to execute SQL directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ SQL execution error:', error);
      return false;
    }
    
    console.log('✅ SQL executed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error executing SQL:', error);
    return false;
  }
}

async function executeSqlCommands() {
  try {
    console.log('🚀 Executing SQL commands directly...');
    
    // Command 1: Drop the table
    console.log('📋 Dropping existing session_summaries table...');
    const { error: dropError } = await supabase
      .from('session_summaries')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (dropError) {
      console.log('Note: Could not delete existing records:', dropError.message);
    }
    
    // Command 2: Create the new table structure
    console.log('📋 Creating new session_summaries table...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS session_summaries_new (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sessionId UUID NOT NULL,
          summary TEXT NOT NULL,
          effectiveness VARCHAR(50) NOT NULL,
          followup_notes TEXT,
          new_concerns JSONB,
          resolved_concerns TEXT[],
          next_session_date DATE,
          createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Try to execute via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sql',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: createTableSQL
    });
    
    if (!response.ok) {
      console.log('Note: Could not create table via REST API, will try alternative approach');
    }
    
    // Alternative: Use the SQL editor approach
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('='.repeat(80));
    console.log(`
-- Drop the complex session_summaries table and recreate it with simple schema
DROP TABLE IF EXISTS session_summaries CASCADE;

-- Create new simplified session_summaries table
CREATE TABLE session_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sessionId UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    effectiveness VARCHAR(50) NOT NULL,
    followup_notes TEXT,
    new_concerns JSONB,
    resolved_concerns TEXT[],
    next_session_date DATE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_session_summaries_session_id ON session_summaries(sessionId);

-- Grant permissions
GRANT ALL ON session_summaries TO authenticated;
GRANT ALL ON session_summaries TO service_role;

-- Enable RLS
ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view session summaries for sessions they are involved in" ON session_summaries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sessions s 
            WHERE s.id = session_summaries.sessionId 
            AND (s.volunteerId = auth.uid() OR s.child_id IN (
                SELECT child_id FROM children WHERE volunteerId = auth.uid()
            ))
        )
    );

CREATE POLICY "Volunteers can create session summaries for their sessions" ON session_summaries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions s 
            WHERE s.id = session_summaries.sessionId 
            AND s.volunteerId = auth.uid()
        )
    );

CREATE POLICY "Volunteers can update session summaries for their sessions" ON session_summaries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sessions s 
            WHERE s.id = session_summaries.sessionId 
            AND s.volunteerId = auth.uid()
        )
    );

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
    `);
    console.log('='.repeat(80));
    
    return true;
  } catch (error) {
    console.error('❌ Error executing SQL commands:', error);
    return false;
  }
}

async function main() {
  console.log('🔄 Starting session_summaries schema update...');
  
  const success = await executeSqlCommands();
  
  if (success) {
    console.log('✅ Schema update instructions provided!');
    console.log('📊 Please run the SQL above in your Supabase SQL Editor.');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/[YOUR-PROJECT]/sql');
    console.log('📋 Copy and paste the SQL code above into the SQL Editor and run it.');
    console.log('🔧 After running the SQL, your application should work without schema mismatches.');
  } else {
    console.log('❌ Schema update failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error); 