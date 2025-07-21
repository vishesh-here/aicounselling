import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function assignChildToVolunteer() {
  try {
    console.log('=== ASSIGNING CHILD TO VOLUNTEER ===\n');
    
    // Find your volunteer user (visheshsoni05@gmail.com)
    const { data: volunteer, error: volunteerError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'visheshsoni05@gmail.com')
      .single();
    
    if (volunteerError || !volunteer) {
      console.error('❌ Volunteer not found:', volunteerError);
      return;
    }
    
    console.log('✅ Found volunteer:', volunteer.name, `(${volunteer.email})`);
    
    // Find a test child (or get the first available child)
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('*')
      .eq('isActive', true)
      .limit(1);
    
    if (childrenError || !children || children.length === 0) {
      console.error('❌ No children found:', childrenError);
      return;
    }
    
    const child = children[0];
    console.log('✅ Found child:', child.fullName, `(ID: ${child.id})`);
    
    // Check if assignment already exists
    const { data: existingAssignment } = await supabase
      .from('assignments')
      .select('*')
      .eq('child_id', child.id)
      .eq('volunteerId', volunteer.id)
      .single();
    
    if (existingAssignment) {
      console.log('✅ Assignment already exists!');
      console.log(`Assignment ID: ${existingAssignment.id}`);
      console.log(`Active: ${existingAssignment.isActive}`);
      
      if (!existingAssignment.isActive) {
        // Reactivate the assignment
        const { error: updateError } = await supabase
          .from('assignments')
          .update({ isActive: true })
          .eq('id', existingAssignment.id);
        
        if (updateError) {
          console.error('❌ Error reactivating assignment:', updateError);
          return;
        }
        
        console.log('✅ Assignment reactivated!');
      }
    } else {
      // Create new assignment
      const { data: newAssignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          child_id: child.id,
          volunteerId: volunteer.id,
          isActive: true,
          assignedAt: new Date().toISOString(),
          assignedBy: volunteer.id // Self-assigned for testing
        })
        .select()
        .single();
      
      if (assignmentError) {
        console.error('❌ Error creating assignment:', assignmentError);
        return;
      }
      
      console.log('✅ New assignment created!');
      console.log(`Assignment ID: ${newAssignment.id}`);
    }
    
    console.log('\n=== ASSIGNMENT COMPLETE ===');
    console.log(`✅ ${volunteer.name} is now assigned to ${child.fullName}`);
    console.log(`✅ The volunteer should now see this child in the Children tab`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

assignChildToVolunteer(); 