# TrackMyClass

## Current State

TrackMyClass is a full-stack student record management system for VIVEKANANDA KENDRA VIDYALAYA RAGA. It manages student profiles (persistent across sessions), class-specific academic marks, 12-month attendance (April–March), sports records, co-curricular activities, daily records, report cards, and file uploads (notice board, circulars, study materials). Role-based access: Developer, Admin, Class Teacher, Teacher (view-only). Student profiles have a `session` field (e.g. "2025-26") and a `classLevel` field (1–8).

Current backend marks storage: `subjectMarks` Map keyed by `studentId` only — no session tagging. Attendance, sports, activities, and report cards already have a `session` field.

Settings page stores `academicYear` in localStorage only. No backend session tracking. No student promotion workflow. No confirmation before changing session year.

## Requested Changes (Diff)

### Add

1. **Individual Student Promotion** — a `promoteStudentWithSession` backend function that takes `sessionToken`, `studentId`, `newClassLevel` (Nat), and `newSession` (Text), and updates the student profile's `classLevel` and `session` fields. Restricted to Admin and Developer.

2. **Session-aware marks storage** — a new `sessionMarksStore` Map keyed by `"studentId|session"` (Text). New functions:
   - `saveSubjectMarksForSessionWithSession(token, studentId, session, marks)` — saves marks keyed by `studentId|session`
   - `getSubjectMarksForSessionWithSession(token, studentId, session)` — retrieves marks for a specific session

3. **Student session list** — `getStudentSessionListWithSession(token, studentId)` — returns deduplicated array of session strings that have any data (marks, attendance, sports, activities) for the given student.

4. **Global app session tracking** — a stable var `currentAppSession: Text` initialized to `"2025-26"`. New functions:
   - `setCurrentAppSessionWithSession(token, session)` — Admin/Developer only; updates the global current session
   - `getCurrentAppSession()` — public query; returns the current session string

5. **Session History tab** (frontend) — a new "Session History" tab on the student profile. Shows all past sessions for that student with collapsible panels per session year. Each panel shows: marks summary, attendance summary, sports records, and activities for that session. All roles can view.

6. **Promote button** (frontend) — on the student profile page, Admin/Developer see a "Promote to Next Class" button. Clicking it opens a dialog showing current class → next class and asks for the new session year (pre-filled from currentAppSession). Confirming calls `promoteStudentWithSession`.

7. **New Session confirmation** (frontend) — in Settings, changing the `academicYear` field and clicking Save shows a confirmation dialog: "Starting session [new year] will update the current session. All existing student academic data will be preserved in Session History. Continue?" Only after confirmation is the session saved to localStorage and `setCurrentAppSessionWithSession` called on the backend.

### Modify

- `saveSubjectMarksWithSession` — also mirror-save to `sessionMarksStore` using the student profile's current session at time of save. Retrieve the student profile's session field to use as the session key.
- Settings page — wrap the Save button with a confirmation dialog when `academicYear` has changed.
- StudentDetailPage — add the Session History tab and the Promote button.

### Remove

- Nothing removed.

## Implementation Plan

1. Add `sessionMarksStore` Map and `currentAppSession` stable var to backend.
2. Add `promoteStudentWithSession` function (updates classLevel + session on profile).
3. Add `saveSubjectMarksForSessionWithSession` and `getSubjectMarksForSessionWithSession` functions.
4. Modify `saveSubjectMarksWithSession` to also save to `sessionMarksStore` using the student's current session.
5. Add `getStudentSessionListWithSession` that scans attendance, sports, activities, sessionMarksStore, and reportCards for unique session strings for the student.
6. Add `setCurrentAppSessionWithSession` (Admin/Developer) and `getCurrentAppSession` (public query).
7. Frontend: add Session History tab to StudentDetailPage with collapsible panels per session.
8. Frontend: add Promote button dialog to StudentDetailPage for Admin/Developer.
9. Frontend: add confirmation dialog to Settings when academicYear changes.
