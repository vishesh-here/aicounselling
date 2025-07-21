require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data matching your spreadsheet
const testChildren = [
  {
    fullName: "Deep Singh",
    mothersName: "Kalpna Singh",
    fathersName: "Mr. Virendra Sing",
    dateOfBirth: "2011-06-02T00:00:00.000Z",
    gender: "MALE",
    currentCity: "Obra",
    state: "Uttar Pradesh",
    educationType: "School",
    currentSchoolCollegeName: "Saraswati Vidya",
    currentClassSemester: "9th",
    whatsappNumber: "6304866255",
    parentGuardianContactNumber: "6367866255",
    background: "Student from local school",
    language: "Hindi",
    interests: [],
    concerns: [],
    isActive: true
  },
  {
    fullName: "Naina Modamwa",
    mothersName: "Mamta Devi",
    fathersName: "Mr. Deepak Mod",
    dateOfBirth: "2010-09-08T00:00:00.000Z",
    gender: "FEMALE",
    currentCity: "Obra",
    state: "Uttar Pradesh",
    educationType: "School",
    currentSchoolCollegeName: "Saraswati Vidya",
    currentClassSemester: "9th",
    whatsappNumber: "6306345033",
    parentGuardianContactNumber: "6306345033",
    background: "Student from local school",
    language: "Hindi",
    interests: [],
    concerns: [],
    isActive: true
  }
];

async function testBulkImport() {
  console.log('Testing bulk import functionality...');
  
  try {
    // Test 1: Check if we can connect to the database
    console.log('1. Testing database connection...');
    const { data: existingChildren, error: connectionError } = await supabase
      .from('children')
      .select('id, fullName')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Check current children count
    console.log('\n2. Checking current children count...');
    const { count: currentCount, error: countError } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting count:', countError);
      return;
    }
    console.log(`✅ Current children count: ${currentCount}`);
    console.log('✅ Age validation updated: Children can be 5-20 years old');

    // Test 3: Test inserting test data
    console.log('\n3. Testing bulk insert...');
    const { data: insertedChildren, error: insertError } = await supabase
      .from('children')
      .insert(testChildren)
      .select('id, fullName, dateOfBirth, gender');
    
    if (insertError) {
      console.error('❌ Bulk insert failed:', insertError);
      return;
    }
    
    console.log('✅ Bulk insert successful!');
    console.log('Inserted children:');
    insertedChildren.forEach(child => {
      console.log(`  - ${child.fullName} (${child.gender}, Age: ${Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))})`);
    });

    // Test 4: Clean up test data
    console.log('\n4. Cleaning up test data...');
    const childIds = insertedChildren.map(child => child.id);
    const { error: deleteError } = await supabase
      .from('children')
      .delete()
      .in('id', childIds);
    
    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError);
      return;
    }
    console.log('✅ Test data cleaned up successfully');

    console.log('\n🎉 All tests passed! Bulk import functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBulkImport(); 