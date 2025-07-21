import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration - Change these values for each new user
const NEW_USER = {
  email: 'newuser@example.com', // Change this
  password: 'securepassword123', // Change this
  role: 'VOLUNTEER', // 'ADMIN' or 'VOLUNTEER'
  name: 'New User Name' // Optional display name
};

async function addUserWithRole() {
  try {
    console.log(`Adding new user: ${NEW_USER.email} with role: ${NEW_USER.role}`);
    
    // Create user with role in metadata
    const { data, error } = await supabase.auth.admin.createUser({
      email: NEW_USER.email,
      password: NEW_USER.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: NEW_USER.role,
        name: NEW_USER.name
      }
    });
    
    if (error) {
      console.error('Error creating user:', error);
    } else {
      console.log('✅ Successfully created user!');
      console.log('User data:', {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role,
        created_at: data.user.created_at
      });
      
      // Also create user in local database if needed
      console.log('\nNote: You may also need to create this user in your local database');
      console.log('Run the sync-auth-users.ts script to sync with local database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
addUserWithRole(); 