# TrackMyClass

## Current State
StudentDetailPage has 7 tabs: Profile, Marks, Attendance, Sports, Activities, Daily Records, Report Card. Data hooks exist for all these sections.

## Requested Changes (Diff)

### Add
- New "Analytics" tab (8th tab, indigo color) in the student profile page
- `StudentAnalyticsTab` component that fetches and visualizes:
  1. WT & CA trends line chart (lower classes I-III: WT1-4 and CA1-4 per subject; upper classes IV-VIII: PT1, PT2, Term1, Term2 per subject)
  2. Monthly attendance bar chart (month-wise present vs absent days, April-March)
  3. Sports summary list (grouped by game with counts and levels)
  4. Activities summary list (grouped by activity type with counts)

### Modify
- `StudentDetailPage.tsx`: add Analytics tab trigger and content, import AnalyticsTab

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/components/StudentAnalyticsTab.tsx` with recharts LineChart and BarChart
2. Use existing hooks: `useSubjectMarks`, `useMonthlyAttendance`, `useSportsRecords`, `useActivityRecords`
3. Access control: all roles can view (Admin/Developer/ClassTeacher/OtherTeacher)
4. Add the Analytics tab to StudentDetailPage tabs list and render the component
