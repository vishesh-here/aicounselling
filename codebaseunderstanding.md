# Codebase Supabase Column Usage & Query Logic

# Children Page Bug Fixes (July 2024)

## Summary of Changes

### 1. Add New Child - ReferenceError: session is not defined
- Added a useEffect to fetch the Supabase session using `supabase.auth.getSession()` and store it in state.
- Updated the role check to use `session?.user?.user_metadata?.role || session?.user?.app_metadata?.role`.
- Only allow admins to access the Add Child page; others see an unauthorized alert.

### 2. Child Details - Unauthorized Bug
- Refactored the details page to use a client-side effect to fetch the Supabase session and user.
- Removed unsupported `.contains` query; now fetches all assignments and filters for the current volunteer in JS.
- If a volunteer is not assigned to the child, or the volunteer does not exist in the users table, the UI now shows 'Unassigned' instead of blocking the page or showing 'Unauthorized'.
- Added robust error handling for missing volunteers and unauthorized access.

### 3. General Improvements
- Ensured all children-related pages/components use the Supabase session/user pattern for role checks and authorization.
- Improved UI fallback for missing volunteers and related data.

# Session Completion Sync (July 2024)

## Summary of Change

- Updated the session summary submission logic in `components/session/session-interface.tsx`.
- Now, when a session summary is submitted (not draft), the code also updates the corresponding row in the `sessions` table:
  - Sets `status` to `'COMPLETED'`
  - Sets `endedAt` to the current timestamp
  - Sets `updatedAt` to the current timestamp
- This ensures that the session's state and timeline are always in sync with the summary, and the child profile reflects the latest progress.

# Session Timeline & Last Session Card Fix (July 2024)

## Summary of Change

- Updated the child profile page to fetch sessions with joined volunteer and summary data: `sessions(*, volunteer:users(id, name), summary:session_summaries(*))`.
- Sessions are now sorted by `endedAt` (or `startedAt` if `endedAt` is null) in descending order.
- The "Last Session" card and session timeline now use `endedAt`/`startedAt` for timing, not `createdAt`.
- This ensures the timeline and cards display the correct, up-to-date session data and volunteer info.

# Summary of Changes (July 5, 2025)

## Major Fixes and Improvements

- **Session Timeline & Last Session Card:**
  - Updated session fetching to join volunteer and summary data.
  - Sessions are now sorted by `endedAt`/`startedAt` for accurate timeline and last session display.
  - UI now uses these fields for correct session timing and volunteer info.

- **Add Child Profile (Admin Only):**
  - Fixed payload to include all non-nullable fields (`createdAt`, `updatedAt`, `isActive`, etc.).
  - Ensured `interests` and `challenges` are sent as arrays for `_text[]` columns.
  - Improved error handling for API and validation errors.

- **Robust Admin Role Check:**
  - API routes now check for admin role in all possible locations: `user_metadata`, `app_metadata`, `raw_user_meta_data`, `raw_app_meta_data`.
  - Added debug logging to help diagnose role/session issues (logs to server, not browser).

- **Supabase Query Improvements:**
  - All queries now use correct table/column names and join related data as needed.
  - Consistent use of snake_case for DB fields.

- **Debugging & Logging:**
  - Added server-side logging for user/session objects and role checks.
  - Clarified difference between browser and server logs for troubleshooting.

---

**Ready to push and merge with the main branch.**

---

This file summarizes all Supabase table columns referenced in queries throughout the codebase, and the logic used for each major query. Use this as a reference for debugging data issues or schema mismatches.

---

## 1. `children` Table

**Columns Used:**
- `id`
- `name`
- `age`
- `gender`
- `state`
- `district`
- `background`
- `schoolLevel`
- `interests`
- `challenges`
- `language`
- `createdAt` / `created_at`
- `isActive` / `is_active` (case varies by schema)
- `assignments` (relation)
- `concerns` (relation)
- `sessions` (relation)

**Query Logic:**
- `.select('*, assignments(*, volunteer:users(id, name, specialization)), concerns(*), sessions(*)')`
- `.eq('isActive', true)` or `.eq('is_active', true)`
- `.order('created_at', { ascending: false })`
- Filtering in client: search by name, filter by state, gender, age, assigned only
- For volunteers: `.contains('assignments', [{ volunteerId: user.id, isActive: true }])`

---

## 2. `assignments` Table

**Columns Used:**
- `id`
- `childId` --> `childId`
- `volunteerId` --> `volunteerId`
- `isActive` / `is_active`
- `created_at` --> `assignedAt`
- `is_active` (if snake_case in DB)

**Query Logic:**
- `.select('*, childId, volunteerId')`
- `.eq('isActive', true)` or `.eq('is_active', true)`
- Used for filtering assignments by active status, child, or volunteer

---

## 3. `users` Table

**Columns Used:**
- `id`
- `name`
- `email`
- `phone`
- `state`
- `specialization`
- `experience`
- `motivation`
- `approval_status`
- `rejection_reason`
- `created_at`
- `approved_by`
- `approved_at`
- `user_metadata` (JSON, for role)
- `app_metadata` (JSON, for role)
- `role` (if present as a column)
- `isActive` / `is_active`

**Query Logic:**
- `.select('id, name, email, ... , user_metadata, app_metadata, approval_status, isActive')`
- Filter for volunteers in client: `user_metadata.role === 'VOLUNTEER' || app_metadata.role === 'VOLUNTEER'`
- `.eq('approval_status', 'APPROVED')`
- `.eq('isActive', true)` or `.eq('is_active', true)`

---

## 4. `sessions` Table

**Columns Used:**
- `id`
- `childId` --> `childId`
- `created_at` --> `createdAt`
- `isActive` / `is_active`

**Query Logic:**
- `.select('*')`
- `.eq('isActive', true)` or `.eq('is_active', true)`
- Used for analytics, session history, and trends

---

## 5. `concerns` Table

**Columns Used:**
- `id`
- `childId` / `childId`
- `title`
- `category`
- `severity`
- `status`
- `createdAt` / `created_at`
- `updatedAt` / `updated_at`

**Query Logic:**
- `.select('*')`
- Filter by `status`, e.g., `.eq('status', 'RESOLVED')`
- Used for analytics and child detail

---

## 6. General Notes

- **Case Sensitivity:** Supabase/Postgres is case-sensitive. Use the exact column name as in your DB schema. If your DB uses `is_active`, always use that in queries. If it uses `isActive`, use that.
- **Role Logic:** All role-based access is handled via `user_metadata.role` or `app_metadata.role` (not a top-level `