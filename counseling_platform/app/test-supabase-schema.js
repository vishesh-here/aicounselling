require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSupabaseSchema() {
  console.log('🔍 Checking Supabase Database Schema...\n');
  
  try {
    // Test different table names to see what exists
    const tablesToTest = [
      'children',
      'concerns', 
      'concern_records',
      'knowledge_base',
      'knowledge_resources',
      'session_summaries',
      'sessions',
      'users',
      'assignments'
    ];
    
    for (const tableName of tablesToTest) {
      try {
        console.log(`Testing table: ${tableName}`);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: EXISTS (${data?.length || 0} records)`);
          if (data && data.length > 0) {
            console.log(`   Sample columns: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }
    
    console.log('\n🔍 Checking specific relationships...');
    
    // Test children with concerns relationship
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*, concerns(*)')
        .limit(1);
      
      if (error) {
        console.log(`❌ Children-Concerns relationship: ${error.message}`);
      } else {
        console.log(`✅ Children-Concerns relationship: WORKS`);
      }
    } catch (err) {
      console.log(`❌ Children-Concerns relationship: ${err.message}`);
    }
    
    // Test children with concern_records relationship
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*, concern_records(*)')
        .limit(1);
      
      if (error) {
        console.log(`❌ Children-Concern_Records relationship: ${error.message}`);
      } else {
        console.log(`✅ Children-Concern_Records relationship: WORKS`);
      }
    } catch (err) {
      console.log(`❌ Children-Concern_Records relationship: ${err.message}`);
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSupabaseSchema(); 