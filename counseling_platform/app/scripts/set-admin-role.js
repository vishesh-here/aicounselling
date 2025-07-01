const { createClient } = require('@supabase/supabase-js');

// TODO: Replace with your actual values
const SUPABASE_URL = "https://oueikgbxlqgwhfdfesso.supabase.co"; // e.g., https://xyzcompany.supabase.co
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZWlrZ2J4bHFnd2hmZGZlc3NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMxMjkxMiwiZXhwIjoyMDY2ODg4OTEyfQ.2LfifDvdn1QCKGs4-kbz10LRM55-0W0Nw2FvRKprSqA'; // Get from Supabase dashboard > Settings > API
const USER_ID = 'fa1987d3-27db-41cf-931d-66b4e94a1008'; // The UID of the user to make admin

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setAdminRole() {
  const { data, error } = await supabase.auth.admin.updateUserById(USER_ID, {
    user_metadata: { role: 'ADMIN' }
  });
  if (error) {
    console.error('Error updating user:', error);
  } else {
    console.log('User updated:', data);
  }
}

setAdminRole(); 