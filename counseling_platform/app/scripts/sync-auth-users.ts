import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncAuthUsers() {
  try {
    console.log('Starting Supabase Auth users sync...');
    
    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} users in Supabase Auth`);
    
    // Process each auth user
    for (const authUser of authUsers.users) {
      console.log(`Processing user: ${authUser.email} (${authUser.id})`);
      
      // Check if user already exists in local users table
      const existingUser = await prisma.user.findUnique({
        where: { id: authUser.id }
      });
      
      if (existingUser) {
        console.log(`User ${authUser.email} already exists, updating...`);
        
        // Update existing user
        await prisma.user.update({
          where: { id: authUser.id },
          data: {
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email.split('@')[0],
            role: (authUser.user_metadata?.role as 'ADMIN' | 'VOLUNTEER') || 'VOLUNTEER',
            // Don't update password as it's managed by Supabase Auth
          }
        });
      } else {
        console.log(`Creating new user: ${authUser.email}`);
        
        // Create new user
        await prisma.user.create({
          data: {
            id: authUser.id, // Use the Supabase Auth UUID
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email.split('@')[0],
            password: '', // Empty password as auth is handled by Supabase
            role: (authUser.user_metadata?.role as 'ADMIN' | 'VOLUNTEER') || 'VOLUNTEER'
          }
        });
      }
    }
    
    console.log('Auth users sync completed successfully!');
    
    // List all users in local table
    const localUsers = await prisma.user.findMany();
    console.log('\nLocal users table contents:');
    localUsers.forEach(user => {
      console.log(`- ${user.email} (${user.id}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('Error syncing auth users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncAuthUsers(); 