import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
config();

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration - Change these values as needed
const USER_EMAIL = 'visheshsoni05@gmail.com'; // The email of the user to update
const NEW_ROLE = 'VOLUNTEER'; // The role to assign: 'ADMIN' or 'VOLUNTEER'

async function assignRoleToUser() {
  try {
    console.log(`Assigning role "${NEW_ROLE}" to user: ${USER_EMAIL}`);
    
    // First, find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error fetching users:', listError);
      return;
    }
    
    const user = users.users.find(u => u.email.toLowerCase() === USER_EMAIL.toLowerCase());
    
    if (!user) {
      console.error(`User with email ${USER_EMAIL} not found in Supabase Auth`);
      console.log('Available users:');
      users.users.forEach(u => console.log(`  - ${u.email} (${u.id})`));
      return;
    }
    
    console.log(`Found user: ${user.email} (${user.id})`);
    console.log(`Current metadata:`, user.user_metadata);
    
    // Update the user's role in Supabase Auth
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: NEW_ROLE
      }
    });
    
    if (error) {
      console.error('Error updating user:', error);
    } else {
      console.log('✅ Successfully updated user role in Supabase Auth!');
      console.log('Updated user data:', data);
    }
    
    // Also update the role in the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ role: NEW_ROLE })
      .eq('id', user.id)
      .select();
    
    if (userError) {
      console.error('Error updating user in users table:', userError);
    } else {
      console.log('✅ Successfully updated user role in users table!');
      console.log('Updated user data:', userData);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
assignRoleToUser(); 