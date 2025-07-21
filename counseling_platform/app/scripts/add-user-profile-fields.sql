-- Add missing profile fields to users table
-- Run this script in your Supabase database to add the new fields

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "college" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "preferredLanguages" TEXT[] DEFAULT '{}';

-- Update existing users to have empty values for new fields
UPDATE users SET 
  "whatsappNumber" = COALESCE("whatsappNumber", ''),
  "address" = COALESCE("address", ''),
  "college" = COALESCE("college", ''),
  "city" = COALESCE("city", ''),
  "preferredLanguages" = COALESCE("preferredLanguages", '{}')
WHERE "whatsappNumber" IS NULL 
   OR "address" IS NULL 
   OR "college" IS NULL 
   OR "city" IS NULL 
   OR "preferredLanguages" IS NULL;

-- Verify the changes
SELECT 
  id, 
  email, 
  name, 
  "whatsappNumber", 
  "address", 
  "college", 
  "city", 
  state, 
  specialization, 
  "preferredLanguages",
  role,
  "approvalStatus"
FROM users 
LIMIT 5;

-- Show summary
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN "whatsappNumber" != '' THEN 1 END) as with_whatsapp,
  COUNT(CASE WHEN "address" != '' THEN 1 END) as with_address,
  COUNT(CASE WHEN "college" != '' THEN 1 END) as with_college,
  COUNT(CASE WHEN "city" != '' THEN 1 END) as with_city,
  COUNT(CASE WHEN array_length("preferredLanguages", 1) > 0 THEN 1 END) as with_languages
FROM users; 