# Migration & Troubleshooting Tracker

## Objective
Migrate the AI Counseling Web App's database from a previous PostgreSQL instance to Supabase, seed it with demo data, and ensure the app works locally with the new setup.

---

## Steps & Actions Taken

1. **Initial Setup & Migration Plan**
   - Pushed code to GitHub for backup.
   - Created a new Supabase project and updated `.env` with the new connection string.
   - Outlined safe migration steps: update `.env`, run Prisma migrations, seed the database, and test the app.

2. **Prisma & Supabase Integration**
   - Updated `.env` with Supabase connection string.
   - Attempted to run Prisma migrations and seed the database.

3. **Dependency & Compatibility Issues**
   - Encountered npm dependency conflicts (e.g., `date-fns` and `eslint` version mismatches).
   - Used `npm install --legacy-peer-deps` to bypass strict dependency checks and install all packages.

4. **Seeding the Database**
   - Tried to run the TypeScript seed script with `ts-node`, but faced issues due to Node.js ESM/CommonJS and TypeScript config.
   - Attempted to compile the seed script to JavaScript, but got TypeScript errors (target version, bcrypt import, etc.).
   - Updated `tsconfig.json` for compatibility (`target: es2015`, `module: commonjs`, `esModuleInterop: true`, `skipLibCheck: true`).
   - Fixed the `bcryptjs` import in the seed script.

5. **Prisma Client Generation Issues**
   - When running the compiled seed script, got an error: `@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.`
   - Running `npx prisma generate` produced an error about trying to create a directory at `/home/ubuntu`, which does not exist on Mac.

6. **Root Cause Identified**
   - Discovered that `schema.prisma` had a custom `output` path in the `generator client` block, pointing to `/home/ubuntu/...`.
   - This was causing Prisma to fail when generating the client on the local machine.

---

## Issues Encountered
- npm dependency conflicts (date-fns, eslint, etc.)
- TypeScript/Node.js compatibility issues (ESM vs CommonJS, target version, bcrypt import)
- Prisma client generation error due to a custom output path in `schema.prisma`
- Prisma engine trying to write to a non-existent directory (`/home/ubuntu`)

---

## Final Solution
- Removed the `output` line from the `generator client` block in `prisma/schema.prisma`.
- Regenerated the Prisma client with `npx prisma generate`.
- Ran the seed script (`node scripts/seed.js`) to successfully seed the Supabase database.

---

**This file tracks all major changes, issues, and solutions during the Supabase migration and seeding process.**

---

## Supabase Auth Migration, UI Refactor & React Error Debugging (June 2024)

### Objective
Fully migrate authentication/session management from NextAuth/Prisma to Supabase Auth, refactor all UI and API logic to use Supabase, and resolve all runtime errors for a stable, modern stack.

### Key Work & Steps
1. **Supabase Auth Migration**
   - Removed all NextAuth/Prisma-based authentication and session logic.
   - Set up Supabase client and updated login/signup flows to use Supabase Auth.
   - Added scripts to set user roles (admin/volunteer) in Supabase metadata.
   - Refactored all role-based UI and access control to use Supabase session/user metadata.

2. **API & Data Fetching Refactor**
   - Deprecated legacy API routes that relied on NextAuth/Prisma session checks.
   - Moved all protected data fetching (sessions, assignments, analytics) to the client using Supabase SDK.
   - Updated dashboard, analytics, and session pages to fetch and aggregate data client-side.

3. **UI Component Refactor**
   - Removed all custom toast/toaster code and switched to Sonner for notifications.
   - Updated all session/role checks in sidebar, profile, and providers to use Supabase.
   - Cleaned up all references to NextAuth, SessionProvider, and related hooks.

4. **Major Runtime Error: `destroy is not a function`**
   - After upgrading Sonner and React, encountered a persistent error: `TypeError: destroy is not a function`.
   - Systematically removed all custom toasts, cleaned dependencies, and updated all UI libraries (Sonner, Radix, Recharts, React Simple Maps).
   - Discovered the root cause: an incorrect return value in a `useEffect` cleanup in `DashboardStats` (was returning a React element instead of a function/undefined).
   - Fixed the cleanup logic and ensured all intervals are cleared properly.

5. **Component Isolation & Debugging**
   - Used binary search commenting to isolate the error to `DashboardStats`.
   - Verified all other dashboard widgets and shared components.
   - Confirmed the fix resolved the error for all user roles.

6. **Supabase Relationship Error (Volunteer Dashboard)**
   - Volunteers saw: `Could not find a relationship between 'assignment' and 'child' in the schema cache`.
   - Root cause: missing foreign key from `assignment.childId` to `child.id` in Supabase.
   - Solution: Add the foreign key constraint and refresh the schema cache in Supabase.

7. **Final Merge & Cleanup**
   - Committed and merged all changes into `main`.
   - Ensured all code, dependencies, and UI are stable and up to date.

---

### Key Challenges & Learnings
- React effect cleanups **must only return a function or undefined**—never a React element or object.
- Upgrading libraries (Sonner, Radix, Recharts) requires careful alignment with React/Next.js versions.
- Systematic isolation (commenting out components) is effective for debugging persistent runtime errors.
- Supabase joins require explicit foreign key relationships in the database schema.
- Clean up all legacy code and dependencies after a major migration to avoid subtle bugs.

---

**This section tracks the full Supabase Auth migration, UI refactor, and major debugging/fixes in June 2024.** 