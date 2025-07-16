# Prisma Usage Audit Report

This report documents all files in the codebase that reference Prisma, their purpose, and recommendations for migration or removal as you transition fully to Supabase.

---

## Summary
- **Total files referencing Prisma:** 12
- **Most usage is legacy or related to seeding/migrations.**
- **Some API endpoints still use Prisma for data access.**
- **Safe migration/removal is possible, but some endpoints/features will break until fully ported to Supabase.**

---

## File-by-File Audit

### 1. `counseling_platform/app/lib/db.ts`
- **Purpose:** Exposes a singleton Prisma client for backend use.
- **Prisma Usage:** Instantiates and exports the Prisma client.
- **Status:** Legacy. Only needed if any API routes still use Prisma.
- **Migration:** Safe to remove once all API routes use Supabase.
- **Recommendation:** Remove after all API routes are migrated.

### 2. `counseling_platform/app/scripts/seed.ts` & `seed.js`
- **Purpose:** Seeds the database with demo/test data using Prisma.
- **Prisma Usage:** Creates, updates, and deletes records in all tables.
- **Status:** Legacy. Only needed for local development or migration.
- **Migration:** Safe to remove after Supabase is fully seeded and used in all environments.
- **Recommendation:** Archive or remove after confirming Supabase seeding is complete.

### 3. `counseling_platform/app/prisma/schema.prisma`
- **Purpose:** Defines the Prisma schema for the old PostgreSQL database.
- **Prisma Usage:** N/A (schema only).
- **Status:** Legacy. Not used at runtime.
- **Migration:** Safe to archive/remove after full Supabase migration.
- **Recommendation:** Archive for reference, then remove.

### 4. `counseling_platform/app/app/api/sessions/summary/route.ts`
- **Purpose:** Handles session summary GET/POST endpoints.
- **Prisma Usage:** Used for fetching session summaries (GET) and possibly for upserts.
- **Status:** Still in use for some endpoints.
- **Migration:** Needs to be refactored to use Supabase for all data access.
- **What breaks:** Session summary fetching via API will break if Prisma is removed before migration.
- **Recommendation:** Refactor to Supabase, then remove Prisma.

### 5. `counseling_platform/app/app/api/children/[id]/route.ts`
- **Purpose:** Handles child profile CRUD.
- **Prisma Usage:** Used for finding, updating, and deleting child records.
- **Status:** Still in use for some endpoints.
- **Migration:** Needs to be refactored to use Supabase.
- **What breaks:** Child profile management via API will break if Prisma is removed before migration.
- **Recommendation:** Refactor to Supabase, then remove Prisma.

### 6. `counseling_platform/app/app/api/stories/[id]/route.ts`
- **Purpose:** Handles fetching cultural stories by ID.
- **Prisma Usage:** Used for finding stories.
- **Status:** Still in use for some endpoints.
- **Migration:** Needs to be refactored to use Supabase.
- **What breaks:** Story fetching via API will break if Prisma is removed before migration.
- **Recommendation:** Refactor to Supabase, then remove Prisma.

### 7. `counseling_platform/app/app/api/ai/conversations/[conversationId]/route.ts`
- **Purpose:** Handles fetching and deleting AI chat conversations.
- **Prisma Usage:** Used for finding and deleting conversations.
- **Status:** Still in use for some endpoints.
- **Migration:** Needs to be refactored to use Supabase.
- **What breaks:** AI chat conversation management via API will break if Prisma is removed before migration.
- **Recommendation:** Refactor to Supabase, then remove Prisma.

### 8. `counseling_platform/app/app/api/admin/assignments/route.ts`
- **Purpose:** Handles admin assignment management.
- **Prisma Usage:** Used for finding assignments.
- **Status:** Still in use for some endpoints.
- **Migration:** Needs to be refactored to use Supabase.
- **What breaks:** Assignment management via API will break if Prisma is removed before migration.
- **Recommendation:** Refactor to Supabase, then remove Prisma.

### 9. `counseling_platform/app/app/api/auth/signup/route.ts`
- **Purpose:** Handles user signup.
- **Prisma Usage:** Used for user creation and lookup.
- **Status:** Still in use for some endpoints.
- **Migration:** Needs to be refactored to use Supabase Auth and user tables.
- **What breaks:** User signup via API will break if Prisma is removed before migration.
- **Recommendation:** Refactor to Supabase Auth, then remove Prisma.

### 10. `counseling_platform/app/app/api/admin/knowledge-base/route.ts`
- **Purpose:** Handles knowledge base CRUD for admin.
- **Prisma Usage:** Used for fetching knowledge base entries.
- **Status:** Still in use for some endpoints.
- **Migration:** Needs to be refactored to use Supabase.
- **What breaks:** Knowledge base management via API will break if Prisma is removed before migration.
- **Recommendation:** Refactor to Supabase, then remove Prisma.

### 11. `counseling_platform/app/app/api/admin/cultural-stories/route.ts`
- **Purpose:** Handles cultural stories CRUD for admin.
- **Prisma Usage:** Used for fetching cultural stories.
- **Status:** Still in use for some endpoints.
- **Migration:** Needs to be refactored to use Supabase.
- **What breaks:** Cultural story management via API will break if Prisma is removed before migration.
- **Recommendation:** Refactor to Supabase, then remove Prisma.

### 12. `counseling_platform/app/app/api/admin/knowledge-base/route.ts`
- **Purpose:** Handles knowledge base CRUD for admin (duplicate entry, see above).
- **Prisma Usage:** Used for fetching knowledge base entries.
- **Status:** Still in use for some endpoints.
- **Migration:** Needs to be refactored to use Supabase.
- **What breaks:** Knowledge base management via API will break if Prisma is removed before migration.
- **Recommendation:** Refactor to Supabase, then remove Prisma.

---

## General Recommendations
- **Do not remove Prisma until all API endpoints and scripts are migrated to Supabase.**
- **Archive or remove seed scripts and schema after migration is complete.**
- **Test all features after migration to ensure nothing is broken.**

---

If you need a more granular breakdown or want to prioritize certain files/features for migration, let me know! 