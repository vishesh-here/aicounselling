const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSqlFile(filePath) {
  try {
    console.log(`📄 Reading SQL file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`🚀 Executing SQL from: ${filePath}`);
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`❌ Error executing ${filePath}:`, error);
      return false;
    }
    
    console.log(`✅ Successfully executed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error reading/executing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔄 Starting schema update process...');
  
  // Run the session summaries schema update
  const schemaUpdatePath = path.join(__dirname, 'update-session-summaries-schema.sql');
  const success = await runSqlFile(schemaUpdatePath);
  
  if (success) {
    console.log('✅ Schema update completed successfully!');
    console.log('📊 The session_summaries table has been simplified to match frontend expectations.');
    console.log('🔧 You can now run the application without schema mismatches.');
  } else {
    console.log('❌ Schema update failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error); 