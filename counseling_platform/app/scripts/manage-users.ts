import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function listAllUsers() {
  try {
    console.log('=== CURRENT USERS ===\n');
    
    // Get users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} users in Supabase Auth:\n`);
    
    authUsers.users.forEach((user, index) => {
      const role = user.user_metadata?.role || 'NO_ROLE';
      const status = user.email_confirmed_at ? '✅ Confirmed' : '⏳ Pending';
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${role}`);
      console.log(`   Status: ${status}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log('');
    });
    
    // Get users from local database
    const localUsers = await prisma.user.findMany();
    console.log(`\n=== LOCAL DATABASE USERS (${localUsers.length}) ===\n`);
    
    localUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.approvalStatus}`);
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function addNewUser(email: string, password: string, role: 'ADMIN' | 'VOLUNTEER' = 'VOLUNTEER', name?: string) {
  try {
    console.log(`\n=== ADDING NEW USER ===`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Name: ${name || 'Not specified'}\n`);
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: role,
        name: name
      }
    });
    
    if (error) {
      console.error('❌ Error creating user in Supabase Auth:', error);
      return;
    }
    
    console.log('✅ Successfully created user in Supabase Auth!');
    console.log(`User ID: ${data.user.id}`);
    console.log(`Role: ${data.user.user_metadata?.role}`);
    
    // Create user in local database
    try {
      const localUser = await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          name: name || data.user.email!.split('@')[0],
          password: '', // Empty as auth is handled by Supabase
          role: role,
          approvalStatus: 'APPROVED',
          isActive: true,
          phone: '',
          state: '',
          specialization: '',
          experience: '',
          motivation: ''
        }
      });
      
      console.log('✅ Successfully created user in local database!');
      console.log(`Local user ID: ${localUser.id}`);
      
    } catch (dbError) {
      console.error('❌ Error creating user in local database:', dbError);
      console.log('You may need to run the sync-auth-users.ts script to sync');
    }
    
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

async function changeUserRole(email: string, newRole: 'ADMIN' | 'VOLUNTEER') {
  try {
    console.log(`\n=== CHANGING USER ROLE ===`);
    console.log(`Email: ${email}`);
    console.log(`New Role: ${newRole}\n`);
    
    // Find user in Supabase Auth
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error fetching users:', listError);
      return;
    }
    
    const user = users.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.error(`❌ User with email ${email} not found in Supabase Auth`);
      return;
    }
    
    console.log(`Found user: ${user.email} (${user.id})`);
    console.log(`Current role: ${user.user_metadata?.role || 'NO_ROLE'}`);
    
    if (user.user_metadata?.role === newRole) {
      console.log(`⚠️  User already has role: ${newRole}`);
      return;
    }
    
    // Update role in Supabase Auth
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: newRole
      }
    });
    
    if (error) {
      console.error('❌ Error updating user role in Supabase Auth:', error);
      return;
    }
    
    console.log('✅ Successfully updated role in Supabase Auth!');
    
    // Update role in local database
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole }
      });
      
      console.log('✅ Successfully updated role in local database!');
      
    } catch (dbError) {
      console.error('❌ Error updating role in local database:', dbError);
    }
    
    console.log('\nNote: The user will need to log out and log back in to see the new permissions');
    
  } catch (error) {
    console.error('Error changing user role:', error);
  }
}

// Main function - uncomment the function you want to run
async function main() {
  // List all users
  await listAllUsers();
  
  // Add a new user (uncomment and modify as needed)
  // await addNewUser('newuser@example.com', 'securepassword123', 'VOLUNTEER', 'New User Name');
  
  // Change user role (uncomment and modify as needed)
  // await changeUserRole('visheshsoni05@gmail.com', 'VOLUNTEER');
}

// Run the script
main().finally(() => prisma.$disconnect()); 