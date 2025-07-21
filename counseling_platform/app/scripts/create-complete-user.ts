import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration - Fill in all the details for the new user
const NEW_USER = {
  // Basic auth info
  email: 'newvolunteer@example.com', // Change this
  password: 'securepassword123', // Change this
  role: 'VOLUNTEER', // 'ADMIN' or 'VOLUNTEER'
  
  // Profile information
  name: 'John Doe', // Full name
  phone: '+91-9876543210', // Phone number
  state: 'Maharashtra', // State
  specialization: 'Child Psychology', // Area of specialization
  experience: '5 years of experience working with children in counseling and therapy. Specialized in trauma-informed care and behavioral interventions.', // Experience description
  motivation: 'Passionate about helping children overcome challenges and develop healthy coping mechanisms. Committed to making a positive impact in their lives through compassionate counseling.', // Motivation
  
  // Approval status
  approvalStatus: 'APPROVED', // 'PENDING', 'APPROVED', 'REJECTED'
  isActive: true
};

async function createCompleteUser() {
  try {
    console.log('=== CREATING COMPLETE USER ===');
    console.log(`Email: ${NEW_USER.email}`);
    console.log(`Name: ${NEW_USER.name}`);
    console.log(`Role: ${NEW_USER.role}`);
    console.log(`State: ${NEW_USER.state}`);
    console.log(`Specialization: ${NEW_USER.specialization}`);
    console.log(`Status: ${NEW_USER.approvalStatus}`);
    console.log('');
    
    // Step 1: Create user in Supabase Auth
    console.log('1. Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: NEW_USER.email,
      password: NEW_USER.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: NEW_USER.role,
        name: NEW_USER.name
      }
    });
    
    if (authError) {
      console.error('❌ Error creating user in Supabase Auth:', authError);
      return;
    }
    
    console.log('✅ Successfully created user in Supabase Auth!');
    console.log(`Auth User ID: ${authData.user.id}`);
    
    // Step 2: Create user in local database with complete profile
    console.log('\n2. Creating user in local database...');
    const localUser = await prisma.user.create({
      data: {
        id: authData.user.id, // Use the same ID as Supabase Auth
        email: NEW_USER.email,
        name: NEW_USER.name,
        password: '', // Empty as auth is handled by Supabase
        phone: NEW_USER.phone,
        state: NEW_USER.state,
        specialization: NEW_USER.specialization,
        experience: NEW_USER.experience,
        motivation: NEW_USER.motivation,
        role: NEW_USER.role,
        approvalStatus: NEW_USER.approvalStatus,
        isActive: NEW_USER.isActive
      }
    });
    
    console.log('✅ Successfully created user in local database!');
    console.log(`Local User ID: ${localUser.id}`);
    
    // Step 3: Verify the user was created correctly
    console.log('\n3. Verifying user creation...');
    
    // Check Supabase Auth
    const { data: verifyAuth } = await supabase.auth.admin.getUserById(authData.user.id);
    console.log(`Supabase Auth - Role: ${verifyAuth?.user?.user_metadata?.role}`);
    
    // Check local database
    const verifyLocal = await prisma.user.findUnique({
      where: { id: authData.user.id }
    });
    console.log(`Local Database - Role: ${verifyLocal?.role}, Status: ${verifyLocal?.approvalStatus}`);
    
    console.log('\n=== USER CREATION COMPLETE ===');
    console.log(`✅ User can now log in with email: ${NEW_USER.email}`);
    console.log(`✅ User has role: ${NEW_USER.role}`);
    console.log(`✅ User status: ${NEW_USER.approvalStatus}`);
    console.log(`✅ Profile is complete and ready for assignments`);
    
  } catch (error) {
    console.error('❌ Error creating complete user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createCompleteUser(); 