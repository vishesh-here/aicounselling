const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupVectorSearch() {
  try {
    console.log('Setting up vector search functionality...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../setup-vector-search.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // Fallback: try to execute the SQL directly
      console.log('Trying direct SQL execution...');
      const { error: directError } = await supabase.from('document_chunks').select('count').limit(1);
      
      if (directError) {
        console.error('Direct execution also failed:', directError);
        console.log('\nPlease manually execute the SQL in your Supabase SQL Editor:');
        console.log(sql);
      } else {
        console.log('Database connection successful. Please run the SQL manually in Supabase SQL Editor.');
        console.log(sql);
      }
    } else {
      console.log('Vector search setup completed successfully!');
    }
  } catch (error) {
    console.error('Setup failed:', error);
    console.log('\nPlease manually execute the SQL in your Supabase SQL Editor:');
    const sqlPath = path.join(__dirname, '../setup-vector-search.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(sql);
  }
}

setupVectorSearch(); 