require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample data from your spreadsheet
const childrenData = [
  {
    fullName: "Deep Singh",
    mothersName: "Kalpna Singh",
    fathersName: "Mr. Virendra Sing",
    dateOfBirth: "02/06/2011",
    gender: "Male",
    currentCity: "Obra",
    schoolName: "Saraswati Vidya",
    grade: "9th",
    phoneNumber: "6304866255",
    guardianPhone: "6367866255, 6307466255"
  },
  {
    fullName: "Naina Modamwa",
    mothersName: "Mamta Devi",
    fathersName: "Mr. Deepak Mod",
    dateOfBirth: "08/09/2010",
    gender: "Female",
    currentCity: "Obra",
    schoolName: "Saraswati Vidya",
    grade: "9th",
    phoneNumber: "6306345033",
    guardianPhone: "6306345033"
  },
  {
    fullName: "Astha Kumari",
    mothersName: "Mrs. Chanda De",
    fathersName: "Mr. Rajesh Kuma",
    dateOfBirth: "10/03/2009",
    gender: "Female",
    currentCity: "Obra",
    schoolName: "Raja Narendra S",
    grade: "12th",
    phoneNumber: "8400065191",
    guardianPhone: "8400065199, 8400065194"
  },
  {
    fullName: "Sakshi Singh",
    mothersName: "Smt. Sudha Dev",
    fathersName: "Shri Dharmendra",
    dateOfBirth: "21/08/2010",
    gender: "Female",
    currentCity: "Obra",
    schoolName: "Raja Narendra S",
    grade: "11th",
    phoneNumber: "9889685884",
    guardianPhone: "7355357697, 9889685884"
  },
  {
    fullName: "Prakhar Shukla",
    mothersName: "Mrs. Upasana S",
    fathersName: "Mr. Dhirendra Sh",
    dateOfBirth: "08/07/2010",
    gender: "Male",
    currentCity: "Obra",
    schoolName: "Raja Narendra S",
    grade: "11th",
    phoneNumber: "7525893930",
    guardianPhone: "8318864202"
  },
  {
    fullName: "Anjali Kashyap",
    mothersName: "Geeta Devi",
    fathersName: "Babu Lal Keshar",
    dateOfBirth: "09/07/2008",
    gender: "Female",
    currentCity: "Obra",
    schoolName: "Raja Narendra S",
    grade: "12th",
    phoneNumber: "9170306688",
    guardianPhone: "9170306688, 8090954363"
  },
  {
    fullName: "Shraddha Mishra",
    mothersName: "Mrs. Sunita Devi",
    fathersName: "Mr. Dharmendra",
    dateOfBirth: "18/09/2006",
    gender: "Female",
    currentCity: "Obra",
    schoolName: "Raja Narendra S",
    grade: "12th",
    phoneNumber: "7800654945",
    guardianPhone: "9935337883, 9935337883"
  },
  {
    fullName: "Khushi",
    mothersName: "Seema Devi",
    fathersName: "Santosh Kumar",
    dateOfBirth: "02/03/2009",
    gender: "Female",
    currentCity: "Obra",
    schoolName: "Raja Narendra S",
    grade: "12th",
    phoneNumber: "9005035952",
    guardianPhone: "9005035253, 9005035253"
  }
];

// Helper function to convert DD/MM/YYYY to ISO date
function convertDate(dateString) {
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day).toISOString();
}

// Helper function to calculate age
function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to validate child data
function validateChildData(child) {
  const errors = [];
  
  if (!child.fullName) errors.push('Full name is required');
  if (!child.dateOfBirth) errors.push('Date of birth is required');
  if (!child.gender) errors.push('Gender is required');
  if (!child.currentCity) errors.push('City is required');
  if (!child.schoolName) errors.push('School name is required');
  if (!child.grade) errors.push('Grade is required');
  if (!child.phoneNumber) errors.push('Phone number is required');
  
  // Validate age
  const age = calculateAge(convertDate(child.dateOfBirth));
  if (age < 5 || age > 18) {
    errors.push(`Child must be between 5 and 18 years old. Current age: ${age}`);
  }
  
  return errors;
}

// Transform spreadsheet data to database format
function transformChildData(spreadsheetData) {
  return spreadsheetData.map(child => {
    const transformedChild = {
      fullName: child.fullName,
      mothersName: child.mothersName || null,
      fathersName: child.fathersName || null,
      dateOfBirth: convertDate(child.dateOfBirth),
      gender: child.gender.toUpperCase(),
      currentCity: child.currentCity,
      state: "Uttar Pradesh", // Default state based on Obra location
      educationType: "SCHOOL",
      currentSchoolCollegeName: child.schoolName,
      currentClassSemester: child.grade,
      parentGuardianContactNumber: child.phoneNumber,
      guardianPhone: child.guardianPhone || null,
      background: "Student from Obra region",
      language: "Hindi, English",
      interests: [],
      concerns: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return transformedChild;
  });
}

// Main import function
async function bulkImportChildren() {
  console.log('🚀 Starting bulk import of children...');
  console.log(`📊 Processing ${childrenData.length} children...`);
  
  // Transform data
  const transformedData = transformChildData(childrenData);
  
  // Validate all children
  console.log('✅ Validating data...');
  for (let i = 0; i < transformedData.length; i++) {
    const child = transformedData[i];
    const errors = validateChildData(childrenData[i]);
    
    if (errors.length > 0) {
      console.error(`❌ Validation failed for ${child.fullName}:`, errors);
      return;
    }
    
    console.log(`✅ ${child.fullName} (Age: ${calculateAge(child.dateOfBirth)}) - Valid`);
  }
  
  // Check for existing children to avoid duplicates
  console.log('🔍 Checking for existing children...');
  const existingNames = transformedData.map(child => child.fullName);
  const { data: existingChildren, error: checkError } = await supabase
    .from('children')
    .select('fullName')
    .in('fullName', existingNames);
  
  if (checkError) {
    console.error('❌ Error checking existing children:', checkError);
    return;
  }
  
  const existingNamesSet = new Set(existingChildren.map(child => child.fullName));
  const newChildren = transformedData.filter(child => !existingNamesSet.has(child.fullName));
  
  if (newChildren.length === 0) {
    console.log('ℹ️ All children already exist in the database');
    return;
  }
  
  console.log(`📝 Found ${newChildren.length} new children to import`);
  
  // Import children in batches
  const batchSize = 3; // Import 3 at a time to avoid rate limits
  const results = {
    success: [],
    failed: []
  };
  
  for (let i = 0; i < newChildren.length; i += batchSize) {
    const batch = newChildren.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newChildren.length / batchSize)}`);
    
    const { data, error } = await supabase
      .from('children')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      results.failed.push(...batch.map(child => ({ child, error: error.message })));
    } else {
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} successful:`, data.map(child => child.fullName));
      results.success.push(...data);
    }
    
    // Small delay between batches
    if (i + batchSize < newChildren.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${results.success.length} children`);
  console.log(`❌ Failed to import: ${results.failed.length} children`);
  
  if (results.success.length > 0) {
    console.log('\n✅ Successfully imported children:');
    results.success.forEach(child => {
      console.log(`  - ${child.fullName} (ID: ${child.id})`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed imports:');
    results.failed.forEach(({ child, error }) => {
      console.log(`  - ${child.fullName}: ${error}`);
    });
  }
  
  console.log('\n🎉 Bulk import completed!');
}

// Run the import
if (require.main === module) {
  bulkImportChildren()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { bulkImportChildren, transformChildData, validateChildData }; 