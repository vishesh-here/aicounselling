import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration - Change this to the email of the user you want to promote
const USER_EMAIL_TO_PROMOTE = 'visheshsoni05@gmail.com'; // Change this

async function promoteToAdmin() {
  try {
    console.log(`Promoting user to ADMIN: ${USER_EMAIL_TO_PROMOTE}`);
    
    // First, find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error fetching users:', listError);
      return;
    }
    
    const user = users.users.find(u => u.email.toLowerCase() === USER_EMAIL_TO_PROMOTE.toLowerCase());
    
    if (!user) {
      console.error(`User with email ${USER_EMAIL_TO_PROMOTE} not found in Supabase Auth`);
      console.log('\nAvailable users:');
      users.users.forEach(u => {
        const role = u.user_metadata?.role || 'NO_ROLE';
        console.log(`  - ${u.email} (${role})`);
      });
      return;
    }
    
    console.log(`Found user: ${user.email} (${user.id})`);
    console.log(`Current role: ${user.user_metadata?.role || 'NO_ROLE'}`);
    
    if (user.user_metadata?.role === 'ADMIN') {
      console.log('⚠️  User is already an ADMIN');
      return;
    }
    
    // Promote the user to admin
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: 'ADMIN'
      }
    });
    
    if (error) {
      console.error('Error promoting user:', error);
    } else {
      console.log('✅ Successfully promoted user to ADMIN!');
      console.log('Updated user data:', {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role
      });
      
      console.log('\nNote: The user will need to log out and log back in to see the new permissions');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
promoteToAdmin(); 