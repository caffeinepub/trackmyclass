# TrackMyClass

## Current State
Attendance save always appends a new record, causing duplicates per month. Totals grow with each save, and month-wise display shows the old (first) record because `.find()` returns the first match.

## Requested Changes (Diff)

### Add
- Upsert logic in backend `saveMonthlyAttendanceWithSession`: remove existing record for same month+session before appending new one
- Deduplication in backend `getMonthlyAttendanceWithSession`: return only the last record per month+session key to fix legacy duplicates

### Modify
- `saveMonthlyAttendanceWithSession`: filter out existing month+session match before concat
- `getMonthlyAttendanceWithSession`: deduplicate using a Map keyed on `month|session`

### Remove
- Nothing removed

## Implementation Plan
1. Fix backend attendance save to upsert (done)
2. Fix backend attendance get to deduplicate (done)
3. Validate and deploy
