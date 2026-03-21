# TrackMyClass

## Current State
Previous builds failed due to complexity. Starting fresh with a focused, implementable design.

## Requested Changes (Diff)

### Add
- User login with role-based access (Admin, Teacher)
- Student profiles: Admission No (permanent ID), name, DOB, photo, father/mother name, address, contact, health record
- Session-based academic records (student profile persists across sessions)
- Class-wise sections: I-III, IV-V, VI-VIII
- Marks entry per class group:
  - I-III: 4 Written Tests + 4 Comprehensive Tests (50 marks each), subjects: English, Hindi, Math, EVS
  - IV-V: PT1, PT2 (50 marks), Term1, Term2 (80 marks), Notebook (5), Subject Enrichment (5), auto-calc total; subjects: English, Hindi, Math, EVS
  - VI-VIII: Same as IV-V; subjects: English, Hindi, Sanskrit, Math, Science, Social Science
- Auto grading formula: >90=A1, >80=A2, >70=B1, >60=B2, >50=C1, >40=C2, >32=D, <=32=E
- Attendance tracking (monthly, working days vs present)
- Sports/Games records
- Co-curricular activity records
- Daily activity records (class tests, assignments)
- Dashboard: academic performance charts, attendance, sports, activities
- Report card: school header (VKV Raga, Kamle, Arunachal Pradesh), student photo, health, attendance, awards, signatures
- School logo upload (both sides of report card)
- Search by admission number or name
- Student promotion to next class (same admission number, new session)

### Modify
- Nothing (fresh build)

### Remove
- Nothing

## Implementation Plan
1. Backend: Student profiles, academic records (3 formats), attendance, sports, activities, daily records, sessions, authorization
2. Frontend: Login page, dashboard, class-wise student lists, student detail pages (tabs: Profile, Marks, Attendance, Activities, Report Card), search, report card print view
3. Blob storage for student photos and school logo
