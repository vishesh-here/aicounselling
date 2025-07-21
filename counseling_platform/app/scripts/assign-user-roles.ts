import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function assignUserRoles() {
  try {
    console.log('Starting user role assignment...');
    
    // Get all users from local database
    const localUsers = await prisma.user.findMany();
    console.log(`Found ${localUsers.length} users in local database`);
    
    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} users in Supabase Auth`);
    
    // Create a map of email to local user for easy lookup
    const localUserMap = new Map(localUsers.map(user => [user.email.toLowerCase(), user]));
    
    // Process each auth user
    for (const authUser of authUsers.users) {
      const localUser = localUserMap.get(authUser.email.toLowerCase());
      
      if (localUser) {
        console.log(`\nProcessing: ${authUser.email}`);
        console.log(`  Local role: ${localUser.role}`);
        console.log(`  Current auth metadata:`, authUser.user_metadata);
        
        // Check if role needs to be updated
        const currentRole = authUser.user_metadata?.role;
        if (currentRole !== localUser.role) {
          console.log(`  Updating role from "${currentRole}" to "${localUser.role}"`);
          
          // Update user metadata in Supabase Auth
          const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
            user_metadata: {
              ...authUser.user_metadata,
              role: localUser.role
            }
          });
          
          if (error) {
            console.error(`  Error updating user ${authUser.email}:`, error);
          } else {
            console.log(`  ✅ Successfully updated role for ${authUser.email}`);
          }
        } else {
          console.log(`  ✅ Role already correct: ${localUser.role}`);
        }
      } else {
        console.log(`\n⚠️  Auth user ${authUser.email} not found in local database`);
        console.log(`  Current metadata:`, authUser.user_metadata);
        
        // Ask if you want to assign a default role
        console.log(`  Consider assigning a default role (VOLUNTEER) to this user`);
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Processed ${authUsers.users.length} auth users`);
    console.log(`Found ${localUsers.length} local users`);
    
    // Show users by role
    const roleCounts = localUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nLocal users by role:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });
    
  } catch (error) {
    console.error('Error assigning user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
assignUserRoles(); 