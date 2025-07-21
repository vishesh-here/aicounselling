import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
config();

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration - Fill in the basic details for the new user
const NEW_USER = {
  // Basic auth info (required)
  email: 'newvolunteer@example.com', // Change this
  password: 'securepassword123', // Change this
  role: 'VOLUNTEER', // 'ADMIN' or 'VOLUNTEER'
  
  // Basic profile info (will be completed by user later)
  name: 'New Volunteer', // Basic name, user will update
};

async function createBasicUser() {
  try {
    console.log('=== CREATING BASIC USER ===');
    console.log(`Email: ${NEW_USER.email}`);
    console.log(`Role: ${NEW_USER.role}`);
    console.log(`Basic Name: ${NEW_USER.name}`);
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
    
    // Step 2: Create user in users table with basic info
    console.log('\n2. Creating user in users table...');
    const { data: localUser, error: localError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Use the same ID as Supabase Auth
        email: NEW_USER.email,
        name: NEW_USER.name,
        password: '', // Empty as auth is handled by Supabase
        role: NEW_USER.role,
        approvalStatus: 'APPROVED', // Auto-approve since admin is creating
        isActive: true,
        // Profile fields (empty - user will complete later)
        whatsappNumber: '',
        address: '',
        college: '',
        specialization: '',
        city: '',
        state: '',
        preferredLanguages: [],
        experience: '',
        motivation: ''
      })
      .select()
      .single();
    
    if (localError) {
      console.error('❌ Error creating user in users table:', localError);
      return;
    }
    
    console.log('✅ Successfully created user in users table!');
    console.log(`Local User ID: ${localUser.id}`);
    
    // Step 3: Verify the user was created correctly
    console.log('\n3. Verifying user creation...');
    
    // Check Supabase Auth
    const { data: verifyAuth } = await supabase.auth.admin.getUserById(authData.user.id);
    console.log(`Supabase Auth - Role: ${verifyAuth?.user?.user_metadata?.role}`);
    
    // Check users table
    const { data: verifyLocal } = await supabase
      .from('users')
      .select('role, approvalStatus')
      .eq('id', authData.user.id)
      .single();
    console.log(`Users Table - Role: ${verifyLocal?.role}, Status: ${verifyLocal?.approvalStatus}`);
    
    console.log('\n=== USER CREATION COMPLETE ===');
    console.log(`✅ User can now log in with email: ${NEW_USER.email}`);
    console.log(`✅ User has role: ${NEW_USER.role}`);
    console.log(`✅ User status: APPROVED`);
    console.log(`⚠️  User needs to complete profile on first login`);
    console.log(`📧 Send login credentials to: ${NEW_USER.email}`);
    
    console.log('\n=== NEXT STEPS ===');
    console.log('1. Send login credentials to the user');
    console.log('2. User will be prompted to complete profile on first login');
    console.log('3. User can access all features after profile completion');
    
  } catch (error) {
    console.error('❌ Error creating basic user:', error);
  }
}

// Run the script
createBasicUser(); 