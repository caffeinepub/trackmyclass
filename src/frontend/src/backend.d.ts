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
export interface MonthlyAttendance {
    month: string;
    studentId: StudentId;
    present: bigint;
    totalDays: bigint;
    session: string;
    percentage: number;
}
export type StudentId = string;
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
export interface UserProfile {
    studentId?: StudentId;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getActivityRecords(studentId: StudentId): Promise<Array<ActivityRecord>>;
    getAllRecordsForStudent(studentId: StudentId): Promise<{
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
    getReportCards(studentId: StudentId): Promise<Array<ReportCard>>;
    getSportsRecords(studentId: StudentId): Promise<Array<SportsRecord>>;
    getStudentProfile(studentId: StudentId): Promise<StudentProfile>;
    getStudentsByClass(classLevel: bigint): Promise<Array<StudentProfile>>;
    getStudyMaterial(id: string): Promise<StudyMaterial | null>;
    getSubjectMarks(studentId: StudentId): Promise<Array<SubjectMarks>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllStudentProfiles(): Promise<Array<StudentProfile>>;
    listAllStudyMaterials(): Promise<Array<StudyMaterial>>;
    saveActivityRecord(studentId: StudentId, activity: ActivityRecord): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMonthlyAttendance(studentId: StudentId, attendance: MonthlyAttendance): Promise<void>;
    saveReportCard(studentId: StudentId, report: ReportCard): Promise<void>;
    saveSportsRecord(studentId: StudentId, record: SportsRecord): Promise<void>;
    saveStudentProfile(profile: StudentProfile): Promise<void>;
    saveSubjectMarks(studentId: StudentId, marks: Array<SubjectMarks>): Promise<void>;
    searchStudents(searchTerm: string): Promise<Array<StudentProfile>>;
    uploadStudyMaterial(id: string, name: string, blob: ExternalBlob, comments: string): Promise<void>;
}
