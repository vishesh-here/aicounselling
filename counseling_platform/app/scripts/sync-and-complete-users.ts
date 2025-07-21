import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
config();

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncAndCompleteUsers() {
  try {
    console.log('=== SYNCING AND COMPLETING USERS ===\n');
    
    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} users in Supabase Auth\n`);
    
    // Process each auth user
    for (const authUser of authUsers.users) {
      console.log(`Processing: ${authUser.email}`);
      
      // Check if user exists in users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error(`Error checking user in database:`, userError);
        continue;
      }
      
      if (existingUser) {
        console.log(`  ✅ User exists in users table`);
        console.log(`  Role: ${existingUser.role}`);
        console.log(`  Status: ${existingUser.approvalStatus}`);
        
        // Check if profile is complete
        const isProfileComplete = existingUser.whatsappNumber && 
                                 existingUser.state && 
                                 existingUser.specialization && 
                                 existingUser.experience && 
                                 existingUser.motivation &&
                                 existingUser.college &&
                                 existingUser.city &&
                                 existingUser.address;
        
        if (isProfileComplete) {
          console.log(`  ✅ Profile is complete`);
        } else {
          console.log(`  ⚠️  Profile is incomplete - missing:`, {
            whatsappNumber: !existingUser.whatsappNumber,
            state: !existingUser.state,
            specialization: !existingUser.specialization,
            experience: !existingUser.experience,
            motivation: !existingUser.motivation,
            college: !existingUser.college,
            city: !existingUser.city,
            address: !existingUser.address
          });
        }
        
        // Update role if needed
        const authRole = authUser.user_metadata?.role;
        if (authRole && authRole !== existingUser.role) {
          console.log(`  🔄 Updating role from "${existingUser.role}" to "${authRole}"`);
          await supabase
            .from('users')
            .update({ role: authRole })
            .eq('id', authUser.id);
        }
        
      } else {
        console.log(`  ❌ User not found in users table - creating...`);
        
        // Create user in users table
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'New User',
            password: '', // Empty as auth is handled by Supabase
            role: authUser.user_metadata?.role || 'VOLUNTEER',
            approvalStatus: 'APPROVED', // Auto-approve existing auth users
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
        
        if (createError) {
          console.error(`  ❌ Error creating user in database:`, createError);
        } else {
          console.log(`  ✅ Created user in users table`);
          console.log(`  ⚠️  Profile is incomplete - user needs to complete profile`);
        }
      }
      
      console.log('');
    }
    
    // Summary
    console.log('=== SUMMARY ===');
    const { data: localUsers, error: summaryError } = await supabase
      .from('users')
      .select('*');
    
    if (summaryError) {
      console.error('Error fetching users for summary:', summaryError);
      return;
    }
    
    const completeProfiles = localUsers.filter(user => 
      user.whatsappNumber && user.state && user.specialization && 
      user.experience && user.motivation && user.college && user.city && user.address
    );
    const incompleteProfiles = localUsers.filter(user => 
      !user.whatsappNumber || !user.state || !user.specialization || 
      !user.experience || !user.motivation || !user.college || !user.city || !user.address
    );
    
    console.log(`Total users: ${localUsers.length}`);
    console.log(`Complete profiles: ${completeProfiles.length}`);
    console.log(`Incomplete profiles: ${incompleteProfiles.length}`);
    
    if (incompleteProfiles.length > 0) {
      console.log('\nUsers with incomplete profiles:');
      incompleteProfiles.forEach(user => {
        console.log(`  - ${user.email} (${user.name})`);
      });
      console.log('\nThese users need to complete their profiles to access all features.');
    }
    
  } catch (error) {
    console.error('Error syncing users:', error);
  }
}

// Run the script
syncAndCompleteUsers(); 