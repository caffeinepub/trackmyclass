import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface LowerClassMarks {
    totalMarks: number;
    subjectName: string;
    writtenTest1: number;
    writtenTest2: number;
    writtenTest3: number;
    writtenTest4: number;
    grade: string;
    comprehensiveTest1: number;
    comprehensiveTest2: number;
    comprehensiveTest3: number;
    comprehensiveTest4: number;
    percentage: number;
}
export interface ReportCard {
    studentId: StudentId;
    term2Total: number;
    behaviour: string;
    rank: string;
    finalPercentage: number;
    session: string;
    sportsRemarks: string;
    grade: string;
    attendanceSummary: string;
    term1Total: number;
    remarks: string;
}
export interface SportsRecord {
    studentId: StudentId;
    game: string;
    level: string;
    event: string;
    entryId: string;
    session: string;
    position: string;
    remarks: string;
}
export interface NoticePost {
    id: string;
    title: string;
    hasFile: boolean;
    postedAt: string;
    postedBy: string;
    content: string;
    fileBlob?: ExternalBlob;
    fileName: string;
}
export interface UserAccount {
    username: string;
    displayName: string;
    password: string;
    role: string;
    assignedClass?: bigint;
}
export type StudentId = string;
export interface MonthlyAttendance {
    month: string;
    studentId: StudentId;
    present: bigint;
    totalDays: bigint;
    session: string;
    percentage: number;
}
export interface Circular {
    id: string;
    title: string;
    fileBlob: ExternalBlob;
    description: string;
    fileName: string;
    uploadedAt: string;
    uploadedBy: string;
}
export type SubjectMarks = {
    __kind__: "lowerClass";
    lowerClass: LowerClassMarks;
} | {
    __kind__: "upperClass";
    upperClass: UpperClassMarks;
};
export interface StudentProfile {
    pen: string;
    tribe: string;
    contact: string;
    studentId: StudentId;
    dateOfBirth: string;
    heightReopening: number;
    name: string;
    section: string;
    motherName: string;
    heightClosure: number;
    weightClosure: number;
    session: string;
    fatherName: string;
    address: string;
    gender: string;
    classLevel: bigint;
    rollNo: string;
    religion: string;
    aadhar: string;
    weightReopening: number;
}
export interface SessionInfo {
    username: string;
    displayName: string;
    role: string;
    assignedClass?: bigint;
}
export interface UpperClassMarks {
    nb1: number;
    nb2: number;
    pt1: number;
    pt2: number;
    se1: number;
    se2: number;
    term2Total: number;
    subjectName: string;
    term2Exam: number;
    finalPercentage: number;
    pt2Weightage: number;
    grade: string;
    pt1Weightage: number;
    term1Exam: number;
    term1Total: number;
}
export interface StudyMaterial {
    id: string;
    blob: ExternalBlob;
    name: string;
    comments: string;
    uploadedBy: Principal;
}
export interface ActivityRecord {
    activityType: string;
    studentId: StudentId;
    description: string;
    session: string;
    grade: string;
    remarks: string;
}
export interface ClassStudyMaterial {
    id: string;
    title: string;
    subject: string;
    fileBlob: ExternalBlob;
    description: string;
    fileName: string;
    classLevel: bigint;
    uploadedAt: string;
    uploadedBy: string;
}
export interface UserProfile {
    studentId?: StudentId;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}

export interface TeacherProfile {
    teacherId: string;
    name: string;
    designation: string;
    subject: string;
    gender: string;
    dateOfBirth: string;
    joiningDate: string;
    contact: string;
    email: string;
    address: string;
    photoUrl: string;
}

export interface TeacherMonthlyAttendance {
    teacherId: string;
    session: string;
    month: string;
    present: bigint;
    casualLeave: bigint;
    extraordinaryLeave: bigint;
    totalWorkingDays: bigint;
}

export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createUserAccount(sessionToken: string, account: UserAccount): Promise<void>;
    deleteCircular(sessionToken: string, id: string): Promise<void>;
    deleteActivityRecordWithSession(sessionToken: string, studentId: StudentId, index: bigint): Promise<void>;
    updateSportsRecordWithSession(sessionToken: string, studentId: StudentId, entryId: string, updated: SportsRecord): Promise<void>;
    updateActivityRecordWithSession(sessionToken: string, studentId: StudentId, index: bigint, updated: ActivityRecord): Promise<void>;
    deleteAttendanceRecordWithSession(sessionToken: string, studentId: StudentId, month: string, session: string): Promise<void>;
    deleteSportsRecordWithSession(sessionToken: string, studentId: StudentId, entryId: string): Promise<void>;
    deleteClassStudyMaterial(sessionToken: string, id: string): Promise<void>;
    deleteNotice(sessionToken: string, id: string): Promise<void>;
    archiveStudentProfileWithSession(sessionToken: string, studentId: StudentId): Promise<void>;
    deleteStudentProfileWithSession(sessionToken: string, studentId: StudentId): Promise<void>;
    deleteUserAccount(sessionToken: string, username: string): Promise<void>;
    getActivityRecords(studentId: StudentId): Promise<Array<ActivityRecord>>;
    getActivityRecordsWithSession(sessionToken: string, studentId: StudentId): Promise<Array<ActivityRecord>>;
    getAllRecordsForStudent(studentId: StudentId): Promise<{
        marks: Array<SubjectMarks>;
        reportCards: Array<ReportCard>;
        activities: Array<ActivityRecord>;
        attendance: Array<MonthlyAttendance>;
        sports: Array<SportsRecord>;
        profile: StudentProfile;
    }>;
    getAllRecordsForStudentWithSession(sessionToken: string, studentId: StudentId): Promise<{
        marks: Array<SubjectMarks>;
        reportCards: Array<ReportCard>;
        activities: Array<ActivityRecord>;
        attendance: Array<MonthlyAttendance>;
        sports: Array<SportsRecord>;
        profile: StudentProfile;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMonthlyAttendance(studentId: StudentId): Promise<Array<MonthlyAttendance>>;
    getMonthlyAttendanceWithSession(sessionToken: string, studentId: StudentId): Promise<Array<MonthlyAttendance>>;
    getReportCards(studentId: StudentId): Promise<Array<ReportCard>>;
    getReportCardsWithSession(sessionToken: string, studentId: StudentId): Promise<Array<ReportCard>>;
    getSportsRecords(studentId: StudentId): Promise<Array<SportsRecord>>;
    getSportsRecordsWithSession(sessionToken: string, studentId: StudentId): Promise<Array<SportsRecord>>;
    getStudentProfile(studentId: StudentId): Promise<StudentProfile>;
    getStudentProfileWithSession(sessionToken: string, studentId: StudentId): Promise<StudentProfile>;
    getStudentsByClass(classLevel: bigint): Promise<Array<StudentProfile>>;
    getStudentsByClassWithSession(sessionToken: string, classLevel: bigint): Promise<Array<StudentProfile>>;
    getStudyMaterial(id: string): Promise<StudyMaterial | null>;
    getStudyMaterialWithSession(sessionToken: string, id: string): Promise<StudyMaterial | null>;
    getSubjectMarks(studentId: StudentId): Promise<Array<SubjectMarks>>;
    getSubjectMarksWithSession(sessionToken: string, studentId: StudentId): Promise<Array<SubjectMarks>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllStudentProfiles(): Promise<Array<StudentProfile>>;
    listAllStudentProfilesWithSession(sessionToken: string): Promise<Array<StudentProfile>>;
    listArchivedStudentProfilesWithSession(sessionToken: string): Promise<Array<StudentProfile>>;
    listAllStudyMaterials(): Promise<Array<StudyMaterial>>;
    listCirculars(sessionToken: string): Promise<Array<Circular>>;
    listClassStudyMaterials(sessionToken: string): Promise<Array<ClassStudyMaterial>>;
    listClassStudyMaterialsByClass(sessionToken: string, classLevel: bigint): Promise<Array<ClassStudyMaterial>>;
    listNotices(sessionToken: string): Promise<Array<NoticePost>>;
    listUserAccounts(sessionToken: string): Promise<Array<UserAccount>>;
    loginUser(username: string, password: string): Promise<{
        displayName: string;
        role: string;
        assignedClass?: bigint;
        sessionToken: string;
    } | null>;
    logoutUser(sessionToken: string): Promise<void>;
    restoreStudentProfileWithSession(sessionToken: string, studentId: StudentId): Promise<void>;
    postNotice(sessionToken: string, id: string, title: string, content: string, hasFile: boolean, fileBlob: ExternalBlob | null, fileName: string, postedAt: string): Promise<void>;
    saveActivityRecord(studentId: StudentId, activity: ActivityRecord): Promise<void>;
    saveActivityRecordWithSession(sessionToken: string, studentId: StudentId, activity: ActivityRecord): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMonthlyAttendance(studentId: StudentId, attendance: MonthlyAttendance): Promise<void>;
    saveMonthlyAttendanceWithSession(sessionToken: string, studentId: StudentId, attendance: MonthlyAttendance): Promise<void>;
    saveReportCard(studentId: StudentId, report: ReportCard): Promise<void>;
    saveReportCardWithSession(sessionToken: string, studentId: StudentId, report: ReportCard): Promise<void>;
    saveSportsRecord(studentId: StudentId, record: SportsRecord): Promise<void>;
    saveSportsRecordWithSession(sessionToken: string, studentId: StudentId, record: SportsRecord): Promise<void>;
    saveStudentProfile(profile: StudentProfile): Promise<void>;
    saveStudentProfileWithSession(sessionToken: string, profile: StudentProfile): Promise<void>;
    saveSubjectMarks(studentId: StudentId, marks: Array<SubjectMarks>): Promise<void>;
    saveSubjectMarksWithSession(sessionToken: string, studentId: StudentId, marks: Array<SubjectMarks>): Promise<void>;
    searchStudents(searchTerm: string): Promise<Array<StudentProfile>>;
    searchStudentsWithSession(sessionToken: string, searchTerm: string): Promise<Array<StudentProfile>>;
    setStudentIdForUserProfile(studentId: string): Promise<void>;
    updateUserPassword(sessionToken: string, username: string, newPassword: string): Promise<void>;
    uploadCircular(sessionToken: string, id: string, title: string, description: string, fileBlob: ExternalBlob, fileName: string, uploadedAt: string): Promise<void>;
    uploadClassStudyMaterial(sessionToken: string, id: string, title: string, classLevel: bigint, subject: string, description: string, fileBlob: ExternalBlob, fileName: string, uploadedAt: string): Promise<void>;
    uploadStudyMaterial(id: string, name: string, blob: ExternalBlob, comments: string): Promise<void>;
    uploadStudyMaterialWithSession(sessionToken: string, id: string, name: string, blob: ExternalBlob, comments: string): Promise<void>;
    saveTeacherProfileWithSession(sessionToken: string, profile: TeacherProfile): Promise<void>;
    getTeacherProfileWithSession(sessionToken: string, teacherId: string): Promise<TeacherProfile>;
    listAllTeacherProfilesWithSession(sessionToken: string): Promise<Array<TeacherProfile>>;
    deleteTeacherProfileWithSession(sessionToken: string, teacherId: string): Promise<void>;
    saveTeacherAttendanceWithSession(sessionToken: string, attendance: TeacherMonthlyAttendance): Promise<void>;
    getTeacherAttendanceWithSession(sessionToken: string, teacherId: string, session: string): Promise<Array<TeacherMonthlyAttendance>>;
    validateSession(sessionToken: string): Promise<SessionInfo | null>;
}
