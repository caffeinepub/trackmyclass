# TrackMyClass

## Current State
- After login, user goes directly to the Dashboard with no session selection.
- `academicSession` is a nullable state in App.tsx, never forced to be set.
- The "Promote to Next Class" button is visible to any admin/developer for any student regardless of whether results are finalized.
- No concept of locking marks or finalizing results exists.
- Sessions list is not tracked; academic year comes from SettingsPage (localStorage).

## Requested Changes (Diff)

### Add
- `SessionSelectPage` component: shown immediately after login, before the main app. Lists available sessions (from localStorage `trackmyclass_sessions`, defaulting to `["2025-26"]`). Admin/developer can add a new session inline. Clicking a session sets it as the active session and shows the main app.
- `isFinalized` state per student per session: stored in localStorage as key `finalized_${studentId}_${session}`. Value is `"true"` when finalized.
- "Finalize Results" button in the Marks tab (visible to admin/developer/classTeacher, only when not yet finalized). Clicking shows a confirm dialog, then sets the localStorage flag and re-renders.
- "Results Finalized" badge in the Marks tab header when finalized.

### Modify
- `App.tsx`: After `session` is set (login), check if `academicSession` is set in state. If not, show `SessionSelectPage` instead of the main app. `setAcademicSession` must also persist the value to localStorage as `trackmyclass_active_session`. On app load, restore active session from localStorage if available (so refreshes don't reset to null).
- `useAuth.ts` `logout`: clear `trackmyclass_active_session` from localStorage.
- `StudentDetailPage.tsx`: The "Promote to Next Class" button must only be visible when `isFinalized` is true for the current student + active session. When `isFinalized`, mark entry inputs in the Marks tab must be disabled (read-only). Marks save button should also be hidden/disabled when finalized.
- `SettingsPage.tsx`: Session creation (adding to `trackmyclass_sessions`) should only be accessible to developer and admin (already the case for Settings page, so no structural change needed — handled in SessionSelectPage).

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/pages/SessionSelectPage.tsx`: session list from localStorage, "+ New Session" for admin/developer, click to set session.
2. Modify `App.tsx`: restore active session on mount, show `SessionSelectPage` if session is null, clear active session on logout call.
3. Modify `useAuth.ts`: clear `trackmyclass_active_session` in logout.
4. Modify `StudentDetailPage.tsx`:
   - Add `isFinalized` computed from localStorage in `MarksTab`
   - Pass `isFinalized` to mark entry fields (disable inputs when finalized)
   - Add "Finalize Results" button with confirm dialog
   - Gate Promote button on `isFinalized`
