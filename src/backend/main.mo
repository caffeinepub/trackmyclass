import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Random "mo:core/Random";
import Array "mo:core/Array";



actor {
  include MixinStorage();

  public type StudentId = Text;

  public type StudentProfile = {
    studentId : StudentId;
    session : Text;
    name : Text;
    classLevel : Nat;
    section : Text;
    rollNo : Text;
    gender : Text;
    dateOfBirth : Text;
    tribe : Text;
    motherName : Text;
    fatherName : Text;
    contact : Text;
    address : Text;
    pen : Text;
    aadhar : Text;
    religion : Text;
    heightReopening : Float;
    weightReopening : Float;
    heightClosure : Float;
    weightClosure : Float;
    bloodGroup : ?Text;
  };

  public type LowerClassMarks = {
    subjectName : Text;
    writtenTest1 : Float;
    writtenTest2 : Float;
    writtenTest3 : Float;
    writtenTest4 : Float;
    comprehensiveTest1 : Float;
    comprehensiveTest2 : Float;
    comprehensiveTest3 : Float;
    comprehensiveTest4 : Float;
    totalMarks : Float;
    percentage : Float;
    grade : Text;
  };

  public type UpperClassMarks = {
    subjectName : Text;
    pt1 : Float;
    pt1Weightage : Float;
    nb1 : Float;
    se1 : Float;
    term1Exam : Float;
    term1Total : Float;
    pt2 : Float;
    pt2Weightage : Float;
    nb2 : Float;
    se2 : Float;
    term2Exam : Float;
    term2Total : Float;
    finalPercentage : Float;
    grade : Text;
  };

  public type SubjectMarks = {
    #lowerClass : LowerClassMarks;
    #upperClass : UpperClassMarks;
  };

  public type SportsRecord = {
    entryId : Text;
    session : Text;
    studentId : StudentId;
    game : Text;
    event : Text;
    level : Text;
    position : Text;
    remarks : Text;
  };

  public type MonthlyAttendance = {
    session : Text;
    studentId : StudentId;
    month : Text;
    totalDays : Nat;
    present : Nat;
    percentage : Float;
  };

  public type ActivityRecord = {
    session : Text;
    studentId : StudentId;
    activityType : Text;
    description : Text;
    grade : Text;
    remarks : Text;
  };


  public type TeacherId = Text;

  public type TeacherProfile = {
    teacherId : TeacherId;
    name : Text;
    designation : Text;
    subject : Text;
    gender : Text;
    dateOfBirth : Text;
    joiningDate : Text;
    contact : Text;
    email : Text;
    address : Text;
    photoUrl : Text;
  };

  public type TeacherMonthlyAttendance = {
    teacherId : TeacherId;
    session : Text;
    month : Text;
    present : Nat;
    casualLeave : Nat;
    extraordinaryLeave : Nat;
    totalWorkingDays : Nat;
  };

  public type ReportCard = {
    session : Text;
    studentId : StudentId;
    term1Total : Float;
    term2Total : Float;
    finalPercentage : Float;
    grade : Text;
    rank : Text;
    sportsRemarks : Text;
    attendanceSummary : Text;
    behaviour : Text;
    remarks : Text;
  };

  public type StudyMaterial = {
    id : Text;
    name : Text;
    blob : Storage.ExternalBlob;
    uploadedBy : Principal;
    comments : Text;
  };

  public type NoticePost = {
    id : Text;
    title : Text;
    content : Text;
    hasFile : Bool;
    fileBlob : ?Storage.ExternalBlob;
    fileName : Text;
    postedBy : Text;
    postedAt : Text;
  };

  public type Circular = {
    id : Text;
    title : Text;
    description : Text;
    fileBlob : Storage.ExternalBlob;
    fileName : Text;
    uploadedBy : Text;
    uploadedAt : Text;
  };

  public type ClassStudyMaterial = {
    id : Text;
    title : Text;
    classLevel : Nat;
    subject : Text;
    description : Text;
    fileBlob : Storage.ExternalBlob;
    fileName : Text;
    uploadedBy : Text;
    uploadedAt : Text;
  };

  public type UserProfile = {
    name : Text;
    studentId : ?StudentId;
  };

  public type UserAccount = {
    username : Text;
    password : Text;
    displayName : Text;
    role : Text;
    assignedClass : ?Nat;
  };

  public type SessionAccount = {
    username : Text;
    password : Text;
    displayName : Text;
    role : Text;
    assignedClass : ?Nat;
    activeSession : ?Text;
  };

  public type SessionInfo = {
    username : Text;
    role : Text;
    assignedClass : ?Nat;
    displayName : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let studentProfiles = Map.empty<StudentId, StudentProfile>();
  let subjectMarks = Map.empty<StudentId, [SubjectMarks]>();
  let sportsRecords = Map.empty<StudentId, [SportsRecord]>();
  let monthlyAttendance = Map.empty<StudentId, [MonthlyAttendance]>();
  let activityRecords = Map.empty<StudentId, [ActivityRecord]>();
  let reportCards = Map.empty<StudentId, [ReportCard]>();
  let studyMaterials = Map.empty<Text, StudyMaterial>();
  let users = Map.empty<Text, SessionAccount>();
  stable var stableUsers : [SessionAccount] = [];
  let sessions = Map.empty<Text, SessionInfo>();
  let noticePosts = Map.empty<Text, NoticePost>();
  let circulars = Map.empty<Text, Circular>();
  let classStudyMaterials = Map.empty<Text, ClassStudyMaterial>();
  let archivedStudents = Map.empty<StudentId, Bool>();
  let sessionMarksStore = Map.empty<Text, [SubjectMarks]>();
  let teacherProfiles = Map.empty<TeacherId, TeacherProfile>();
  let teacherAttendance = Map.empty<TeacherId, [TeacherMonthlyAttendance]>();
  stable var currentAppSession : Text = "2025-26";

  // Initialize developer account
  let developerAccount : SessionAccount = {
    username = "developer";
    password = "vkvraga2025";
    displayName = "Phanindra Bharali";
    role = "developer";
    assignedClass = null;
    activeSession = null;
  };
  if (not users.containsKey("developer")) {
    users.add("developer", developerAccount);
  };

  func generateSessionToken() : async Text {
    (await Random.nat64()).toText();
  };

  func getSessionInfo(sessionToken : Text) : ?SessionInfo {
    sessions.get(sessionToken);
  };

  func hasStudentPermission(sessionInfo : SessionInfo, studentProfile : ?StudentProfile) : Bool {
    switch (sessionInfo.role) {
      case ("developer") { true };
      case ("admin") { true };
      case ("classTeacher") {
        switch (sessionInfo.assignedClass, studentProfile) {
          case (?assignedClass, ?profile) { profile.classLevel == assignedClass };
          case (_, _) { false };
        };
      };
      case ("teacher") { true };
      case (_) { false };
    };
  };

  func isDeveloper(sessionInfo : SessionInfo) : Bool {
    sessionInfo.role == "developer";
  };

  func canModifyData(sessionInfo : SessionInfo, studentProfile : ?StudentProfile) : Bool {
    switch (sessionInfo.role) {
      case ("developer") { true };
      case ("admin") { true };
      case ("classTeacher") {
        switch (sessionInfo.assignedClass, studentProfile) {
          case (?assignedClass, ?profile) { profile.classLevel == assignedClass };
          case (_, _) { false };
        };
      };
      case (_) { false };
    };
  };

  func isAdminOrDeveloper(sessionInfo : SessionInfo) : Bool {
    sessionInfo.role == "developer" or sessionInfo.role == "admin";
  };

  // Session management
  public func loginUser(username : Text, password : Text) : async ?{
    sessionToken : Text;
    role : Text;
    assignedClass : ?Nat;
    displayName : Text;
  } {
    // Always enforce developer credentials on every login call
    users.add("developer", {
      username = "developer";
      password = "vkvraga2025";
      displayName = "Phanindra Bharali";
      role = "developer";
      assignedClass = null;
      activeSession = null;
    });
    switch (users.get(username)) {
      case (null) { null };
      case (?account) {
        if (account.password == password) {
          let sessionToken = await generateSessionToken();
          let sessionInfo : SessionInfo = {
            username = account.username;
            role = account.role;
            assignedClass = account.assignedClass;
            displayName = account.displayName;
          };
          sessions.add(sessionToken, sessionInfo);
          let updatedAccount : SessionAccount = { account with activeSession = ?sessionToken };
          users.add(username, updatedAccount);
          ?{ sessionToken; role = account.role; assignedClass = account.assignedClass; displayName = account.displayName };
        } else { null };
      };
    };
  };

  public func logoutUser(sessionToken : Text) : async () {
    switch (sessions.get(sessionToken)) {
      case (null) {};
      case (?sessionInfo) {
        sessions.remove(sessionToken);
        switch (users.get(sessionInfo.username)) {
          case (null) {};
          case (?account) {
            users.add(sessionInfo.username, { account with activeSession = null });
          };
        };
      };
    };
  };

  public query func validateSession(sessionToken : Text) : async ?SessionInfo {
    sessions.get(sessionToken);
  };

  // User management
  public func createUserAccount(sessionToken : Text, account : UserAccount) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only developers can create user accounts") };
        let newAccount : SessionAccount = {
          username = account.username;
          password = account.password;
          displayName = account.displayName;
          role = account.role;
          assignedClass = account.assignedClass;
          activeSession = null;
        };
        users.add(account.username, newAccount);
      };
    };
  };

  public query func listUserAccounts(sessionToken : Text) : async [UserAccount] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only developers can list user accounts") };
        users.values().toArray().map(func(account : SessionAccount) : UserAccount {
          { username = account.username; password = ""; displayName = account.displayName; role = account.role; assignedClass = account.assignedClass };
        });
      };
    };
  };

  public func deleteUserAccount(sessionToken : Text, username : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only developers can delete user accounts") };
        if (username == "developer") { Runtime.trap("Cannot delete developer account") };
        users.remove(username);
      };
    };
  };

  public func updateUserPassword(sessionToken : Text, username : Text, newPassword : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only developers can update passwords") };
        switch (users.get(username)) {
          case (null) { Runtime.trap("User account not found") };
          case (?account) { users.add(username, { account with password = newPassword }) };
        };
      };
    };
  };

  // Archive a student (soft delete)
  public func archiveStudentProfileWithSession(sessionToken : Text, studentId : StudentId) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only developers and admins can archive student profiles") };
        switch (studentProfiles.get(studentId)) {
          case (null) { Runtime.trap("Student profile does not exist") };
          case (?profile) {
            archivedStudents.add(studentId, true);
          };
        };
      };
    };
  };

  // Restore an archived student
  public func restoreStudentProfileWithSession(sessionToken : Text, studentId : StudentId) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only developers and admins can restore student profiles") };
        switch (studentProfiles.get(studentId)) {
          case (null) { Runtime.trap("Student profile does not exist") };
          case (?profile) {
            archivedStudents.remove(studentId);
          };
        };
      };
    };
  };

  // List archived students
  public query func listArchivedStudentProfilesWithSession(sessionToken : Text) : async [StudentProfile] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only developers and admins can view archived students") };
        studentProfiles.values().toArray().filter(func(p) { archivedStudents.containsKey(p.studentId) });
      };
    };
  };

  // Permanent delete (only for archived students)
  public func deleteStudentProfileWithSession(sessionToken : Text, studentId : StudentId) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only developers and admins can delete student profiles") };
        if (not studentProfiles.containsKey(studentId)) { Runtime.trap("Student profile does not exist") };
        studentProfiles.remove(studentId);
        subjectMarks.remove(studentId);
        monthlyAttendance.remove(studentId);
        sportsRecords.remove(studentId);
        activityRecords.remove(studentId);
        reportCards.remove(studentId);
      };
    };
  };

  public func saveStudentProfileWithSession(sessionToken : Text, profile : StudentProfile) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not canModifyData(sessionInfo, ?profile)) { Runtime.trap("Unauthorized: You don't have permission to save this student profile") };
        studentProfiles.add(profile.studentId, profile);
      };
    };
  };

  // List active (non-archived) students
  public query func listAllStudentProfilesWithSession(sessionToken : Text) : async [StudentProfile] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let activeProfiles = studentProfiles.values().toArray().filter(func(p) { not archivedStudents.containsKey(p.studentId) });
        switch (sessionInfo.role) {
          case ("classTeacher") {
            switch (sessionInfo.assignedClass) {
              case (null) { [] };
              case (?assignedClass) { activeProfiles.filter(func(p) { p.classLevel == assignedClass }) };
            };
          };
          case (_) { activeProfiles };
        };
      };
    };
  };

  public query func getStudentProfileWithSession(sessionToken : Text, studentId : StudentId) : async StudentProfile {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        switch (studentProfiles.get(studentId)) {
          case (null) { Runtime.trap("Student profile does not exist") };
          case (?profile) {
            if (not hasStudentPermission(sessionInfo, ?profile)) { Runtime.trap("Unauthorized: You don't have permission to view this student") };
            profile;
          };
        };
      };
    };
  };

  public query func searchStudentsWithSession(sessionToken : Text, searchTerm : Text) : async [StudentProfile] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let allProfiles = studentProfiles.values().toArray().filter(
          func(profile) { not archivedStudents.containsKey(profile.studentId) and (profile.name.contains(#text searchTerm) or profile.studentId.contains(#text searchTerm)) }
        );
        switch (sessionInfo.role) {
          case ("classTeacher") {
            switch (sessionInfo.assignedClass) {
              case (null) { [] };
              case (?assignedClass) { allProfiles.filter(func(p) { p.classLevel == assignedClass }) };
            };
          };
          case (_) { allProfiles };
        };
      };
    };
  };

  public query func getStudentsByClassWithSession(sessionToken : Text, classLevel : Nat) : async [StudentProfile] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let classProfiles = studentProfiles.values().toArray().filter(func(profile) { not archivedStudents.containsKey(profile.studentId) and profile.classLevel == classLevel });
        switch (sessionInfo.role) {
          case ("classTeacher") {
            switch (sessionInfo.assignedClass) {
              case (null) { [] };
              case (?assignedClass) {
                if (classLevel != assignedClass) { Runtime.trap("Unauthorized: You can only view students from your assigned class") };
                classProfiles;
              };
            };
          };
          case (_) { classProfiles };
        };
      };
    };
  };

  public func saveSubjectMarksWithSession(sessionToken : Text, studentId : StudentId, marks : [SubjectMarks]) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to save marks for this student") };
        subjectMarks.add(studentId, marks);
        // Also mirror-save to session-aware store
        let sessionKey = switch (studentProfiles.get(studentId)) { case (null) { studentId # "|unknown" }; case (?p) { studentId # "|" # p.session } };
        sessionMarksStore.add(sessionKey, marks);
      };
    };
  };

  public query func getSubjectMarksWithSession(sessionToken : Text, studentId : StudentId) : async [SubjectMarks] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not hasStudentPermission(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to view marks for this student") };
        switch (subjectMarks.get(studentId)) {
          case (null) { [] };
          case (?marks) { marks };
        };
      };
    };
  };

  public func saveSportsRecordWithSession(sessionToken : Text, studentId : StudentId, record : SportsRecord) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to save sports records for this student") };
        let existing = switch (sportsRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
        sportsRecords.add(studentId, existing.concat([record]));
      };
    };
  };

  public query func getSportsRecordsWithSession(sessionToken : Text, studentId : StudentId) : async [SportsRecord] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not hasStudentPermission(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to view sports records for this student") };
        switch (sportsRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
      };
    };
  };

  public func saveMonthlyAttendanceWithSession(sessionToken : Text, studentId : StudentId, attendance : MonthlyAttendance) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to save attendance for this student") };
        let existing = switch (monthlyAttendance.get(studentId)) { case (null) { [] }; case (?r) { r } };
        // Upsert: remove any existing record for same month+session, then append the new one
        let filtered = existing.filter(func(a : MonthlyAttendance) : Bool { not (a.month == attendance.month and a.session == attendance.session) });
        monthlyAttendance.add(studentId, filtered.concat([attendance]));
      };
    };
  };

  public query func getMonthlyAttendanceWithSession(sessionToken : Text, studentId : StudentId) : async [MonthlyAttendance] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not hasStudentPermission(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to view attendance for this student") };
        let all = switch (monthlyAttendance.get(studentId)) { case (null) { [] }; case (?r) { r } };
        // Deduplicate: keep only the last record per month+session (handles legacy duplicates)
        let seen = Map.empty<Text, MonthlyAttendance>();
        for (a in all.vals()) {
          let key = a.month # "|" # a.session;
          seen.add(key, a);
        };
        seen.values().toArray();
      };
    };
  };

  public func saveActivityRecordWithSession(sessionToken : Text, studentId : StudentId, activity : ActivityRecord) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to save activity records for this student") };
        let existing = switch (activityRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
        activityRecords.add(studentId, existing.concat([activity]));
      };
    };
  };

  public query func getActivityRecordsWithSession(sessionToken : Text, studentId : StudentId) : async [ActivityRecord] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not hasStudentPermission(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to view activity records for this student") };
        switch (activityRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
      };
    };
  };

  // Delete attendance record by month+session
  public func deleteAttendanceRecordWithSession(sessionToken : Text, studentId : StudentId, month : Text, session : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to modify attendance for this student") };
        let existing = switch (monthlyAttendance.get(studentId)) { case (null) { [] }; case (?r) { r } };
        let filtered = existing.filter(func(a) { not (a.month == month and a.session == session) });
        monthlyAttendance.add(studentId, filtered);
      };
    };
  };

  // Delete sports record by entryId
  public func deleteSportsRecordWithSession(sessionToken : Text, studentId : StudentId, entryId : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to modify sports records for this student") };
        let existing = switch (sportsRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
        let filtered = existing.filter(func(s) { s.entryId != entryId });
        sportsRecords.add(studentId, filtered);
      };
    };
  };

  // Delete activity record by index
  public func deleteActivityRecordWithSession(sessionToken : Text, studentId : StudentId, index : Nat) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to modify activity records for this student") };
        let existing = switch (activityRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
        var idx = 0;
        let filtered = existing.filter(func(_) { let keep = idx != index; idx += 1; keep });
        activityRecords.add(studentId, filtered);
      };
    };
  };


  // Update sports record by entryId
  public func updateSportsRecordWithSession(sessionToken : Text, studentId : StudentId, entryId : Text, updated : SportsRecord) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You do not have permission to modify sports records for this student") };
        let existing = switch (sportsRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
        let result = Array.tabulate(existing.size(), func(i) {
          if (existing[i].entryId == entryId) { updated } else { existing[i] }
        });
        sportsRecords.add(studentId, result);
      };
    };
  };

  // Update activity record by index
  public func updateActivityRecordWithSession(sessionToken : Text, studentId : StudentId, index : Nat, updated : ActivityRecord) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You do not have permission to modify activity records for this student") };
        let existing = switch (activityRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
        let result = Array.tabulate(existing.size(), func(i) {
          if (i == index) { updated } else { existing[i] }
        });
        activityRecords.add(studentId, result);
      };
    };
  };
  public func saveReportCardWithSession(sessionToken : Text, studentId : StudentId, report : ReportCard) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to save report cards for this student") };
        let existing = switch (reportCards.get(studentId)) { case (null) { [] }; case (?c) { c } };
        reportCards.add(studentId, existing.concat([report]));
      };
    };
  };

  public query func getReportCardsWithSession(sessionToken : Text, studentId : StudentId) : async [ReportCard] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not hasStudentPermission(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to view report cards for this student") };
        switch (reportCards.get(studentId)) { case (null) { [] }; case (?c) { c } };
      };
    };
  };

  public query func getAllRecordsForStudentWithSession(sessionToken : Text, studentId : StudentId) : async {
    profile : StudentProfile;
    marks : [SubjectMarks];
    sports : [SportsRecord];
    attendance : [MonthlyAttendance];
    activities : [ActivityRecord];
    reportCards : [ReportCard];
  } {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = switch (studentProfiles.get(studentId)) {
          case (null) { Runtime.trap("Student profile does not exist") };
          case (?p) { p };
        };
        if (not hasStudentPermission(sessionInfo, ?profile)) { Runtime.trap("Unauthorized: You don't have permission to view this student's records") };
        let marks = switch (subjectMarks.get(studentId)) { case (null) { [] }; case (?m) { m } };
        let sports = switch (sportsRecords.get(studentId)) { case (null) { [] }; case (?s) { s } };
        let attendance = switch (monthlyAttendance.get(studentId)) { case (null) { [] }; case (?a) { a } };
        let activities = switch (activityRecords.get(studentId)) { case (null) { [] }; case (?a) { a } };
        let _reportCards = switch (reportCards.get(studentId)) { case (null) { [] }; case (?r) { r } };
        { profile; marks; sports; attendance; activities; reportCards = _reportCards };
      };
    };
  };

  public func uploadStudyMaterialWithSession(sessionToken : Text, id : Text, name : Text, blob : Storage.ExternalBlob, comments : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        switch (sessionInfo.role) {
          case ("developer") {};
          case ("admin") {};
          case ("teacher") {};
          case ("classTeacher") {};
          case (_) { Runtime.trap("Unauthorized: Only teachers and admins can upload study materials") };
        };
        let material : StudyMaterial = {
          id; name; blob;
          uploadedBy = Principal.fromText("2vxsx-fae");
          comments;
        };
        studyMaterials.add(id, material);
      };
    };
  };

  public query func getStudyMaterialWithSession(sessionToken : Text, id : Text) : async ?StudyMaterial {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) { studyMaterials.get(id) };
    };
  };

  // ===== NOTICE BOARD =====

  public func postNotice(sessionToken : Text, id : Text, title : Text, content : Text, hasFile : Bool, fileBlob : ?Storage.ExternalBlob, fileName : Text, postedAt : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only Developer and Admin can post notices") };
        let notice : NoticePost = {
          id; title; content; hasFile; fileBlob; fileName;
          postedBy = sessionInfo.displayName;
          postedAt;
        };
        noticePosts.add(id, notice);
      };
    };
  };

  public query func listNotices(sessionToken : Text) : async [NoticePost] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) { noticePosts.values().toArray() };
    };
  };

  public func deleteNotice(sessionToken : Text, id : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only Developer and Admin can delete notices") };
        noticePosts.remove(id);
      };
    };
  };

  // ===== CIRCULARS =====

  public func uploadCircular(sessionToken : Text, id : Text, title : Text, description : Text, fileBlob : Storage.ExternalBlob, fileName : Text, uploadedAt : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only Developer and Admin can upload circulars") };
        let circular : Circular = {
          id; title; description; fileBlob; fileName;
          uploadedBy = sessionInfo.displayName;
          uploadedAt;
        };
        circulars.add(id, circular);
      };
    };
  };

  public query func listCirculars(sessionToken : Text) : async [Circular] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) { circulars.values().toArray() };
    };
  };

  public func deleteCircular(sessionToken : Text, id : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only Developer and Admin can delete circulars") };
        circulars.remove(id);
      };
    };
  };

  // ===== CLASS STUDY MATERIALS =====

  public func uploadClassStudyMaterial(sessionToken : Text, id : Text, title : Text, classLevel : Nat, subject : Text, description : Text, fileBlob : Storage.ExternalBlob, fileName : Text, uploadedAt : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        switch (sessionInfo.role) {
          case ("developer") {};
          case ("admin") {};
          case ("classTeacher") {
            switch (sessionInfo.assignedClass) {
              case (null) { Runtime.trap("Unauthorized: Class Teacher has no assigned class") };
              case (?assigned) {
                if (assigned != classLevel) { Runtime.trap("Unauthorized: You can only upload materials for your assigned class") };
              };
            };
          };
          case (_) { Runtime.trap("Unauthorized: Only Developer, Admin, and Class Teachers can upload study materials") };
        };
        let material : ClassStudyMaterial = {
          id; title; classLevel; subject; description; fileBlob; fileName;
          uploadedBy = sessionInfo.displayName;
          uploadedAt;
        };
        classStudyMaterials.add(id, material);
      };
    };
  };

  public query func listClassStudyMaterials(sessionToken : Text) : async [ClassStudyMaterial] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) { classStudyMaterials.values().toArray() };
    };
  };

  public query func listClassStudyMaterialsByClass(sessionToken : Text, classLevel : Nat) : async [ClassStudyMaterial] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        classStudyMaterials.values().toArray().filter(func(m) { m.classLevel == classLevel });
      };
    };
  };

  public func deleteClassStudyMaterial(sessionToken : Text, id : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only Developer and Admin can delete study materials") };
        classStudyMaterials.remove(id);
      };
    };
  };


  // ===== SESSION MANAGEMENT =====

  public func setCurrentAppSessionWithSession(sessionToken : Text, session : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only Admin and Developer can change the current session") };
        currentAppSession := session;
      };
    };
  };

  public query func getCurrentAppSession() : async Text {
    currentAppSession;
  };

  // ===== STUDENT PROMOTION =====

  public func promoteStudentWithSession(sessionToken : Text, studentId : StudentId, newClassLevel : Nat, newSession : Text) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only Admin and Developer can promote students") };
        switch (studentProfiles.get(studentId)) {
          case (null) { Runtime.trap("Student profile does not exist") };
          case (?profile) {
            studentProfiles.add(studentId, { profile with classLevel = newClassLevel; session = newSession });
          };
        };
      };
    };
  };

  // ===== SESSION-AWARE MARKS =====

  public func saveSubjectMarksForSessionWithSession(sessionToken : Text, studentId : StudentId, session : Text, marks : [SubjectMarks]) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not canModifyData(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to save marks for this student") };
        let key = studentId # "|" # session;
        sessionMarksStore.add(key, marks);
      };
    };
  };

  public query func getSubjectMarksForSessionWithSession(sessionToken : Text, studentId : StudentId, session : Text) : async [SubjectMarks] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not hasStudentPermission(sessionInfo, profile)) { Runtime.trap("Unauthorized: You don't have permission to view marks for this student") };
        let key = studentId # "|" # session;
        switch (sessionMarksStore.get(key)) { case (null) { [] }; case (?m) { m } };
      };
    };
  };

  public query func getStudentSessionListWithSession(sessionToken : Text, studentId : StudentId) : async [Text] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let profile = studentProfiles.get(studentId);
        if (not hasStudentPermission(sessionInfo, profile)) { Runtime.trap("Unauthorized") };
        let seen = Map.empty<Text, Bool>();
        let att = switch (monthlyAttendance.get(studentId)) { case (null) { [] }; case (?a) { a } };
        for (a in att.vals()) { seen.add(a.session, true) };
        let sp = switch (sportsRecords.get(studentId)) { case (null) { [] }; case (?s) { s } };
        for (s in sp.vals()) { seen.add(s.session, true) };
        let ac = switch (activityRecords.get(studentId)) { case (null) { [] }; case (?a) { a } };
        for (a in ac.vals()) { seen.add(a.session, true) };
        let rc = switch (reportCards.get(studentId)) { case (null) { [] }; case (?r) { r } };
        for (r in rc.vals()) { seen.add(r.session, true) };
        seen.keys().toArray();
      };
    };
  };

  // ===== ORIGINAL II-BASED FUNCTIONS (kept for compatibility) =====

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view profiles") };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized: Can only view your own profile") };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can save profiles") };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func setStudentIdForUserProfile(studentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can update their profile") };
    let existingProfile = switch (userProfiles.get(caller)) {
      case (null) { { name = ""; studentId = ?studentId } };
      case (?profile) { { profile with studentId = ?studentId } };
    };
    userProfiles.add(caller, existingProfile);
  };

  public shared ({ caller }) func saveStudentProfile(profile : StudentProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized: Only admin can save or update student profiles") };
    studentProfiles.add(profile.studentId, profile);
  };

  public query ({ caller }) func getStudentProfile(studentId : StudentId) : async StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view student profiles") };
    switch (studentProfiles.get(studentId)) {
      case (null) { Runtime.trap("Student profile does not exist") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func listAllStudentProfiles() : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can list student profiles") };
    studentProfiles.values().toArray();
  };

  public shared ({ caller }) func saveSubjectMarks(studentId : StudentId, marks : [SubjectMarks]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized: Only admin can save subject marks") };
    subjectMarks.add(studentId, marks);
  };

  public query ({ caller }) func getSubjectMarks(studentId : StudentId) : async [SubjectMarks] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view subject marks") };
    switch (subjectMarks.get(studentId)) { case (null) { [] }; case (?marks) { marks } };
  };

  public shared ({ caller }) func saveSportsRecord(studentId : StudentId, record : SportsRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized: Only admin can save sports records") };
    let existing = switch (sportsRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
    sportsRecords.add(studentId, existing.concat([record]));
  };

  public query ({ caller }) func getSportsRecords(studentId : StudentId) : async [SportsRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view sports records") };
    switch (sportsRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
  };

  public shared ({ caller }) func saveMonthlyAttendance(studentId : StudentId, attendance : MonthlyAttendance) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized: Only admin can save attendance records") };
    let existing = switch (monthlyAttendance.get(studentId)) { case (null) { [] }; case (?r) { r } };
    monthlyAttendance.add(studentId, existing.concat([attendance]));
  };

  public query ({ caller }) func getMonthlyAttendance(studentId : StudentId) : async [MonthlyAttendance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view attendance records") };
    switch (monthlyAttendance.get(studentId)) { case (null) { [] }; case (?r) { r } };
  };

  public shared ({ caller }) func saveActivityRecord(studentId : StudentId, activity : ActivityRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized: Only admin can save activity records") };
    let existing = switch (activityRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
    activityRecords.add(studentId, existing.concat([activity]));
  };

  public query ({ caller }) func getActivityRecords(studentId : StudentId) : async [ActivityRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view activity records") };
    switch (activityRecords.get(studentId)) { case (null) { [] }; case (?r) { r } };
  };

  public shared ({ caller }) func saveReportCard(studentId : StudentId, report : ReportCard) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized: Only admin can save report cards") };
    let existing = switch (reportCards.get(studentId)) { case (null) { [] }; case (?c) { c } };
    reportCards.add(studentId, existing.concat([report]));
  };

  public query ({ caller }) func getReportCards(studentId : StudentId) : async [ReportCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view report cards") };
    switch (reportCards.get(studentId)) { case (null) { [] }; case (?c) { c } };
  };

  public query ({ caller }) func getAllRecordsForStudent(studentId : StudentId) : async {
    profile : StudentProfile;
    marks : [SubjectMarks];
    sports : [SportsRecord];
    attendance : [MonthlyAttendance];
    activities : [ActivityRecord];
    reportCards : [ReportCard];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view student records") };
    let profile = switch (studentProfiles.get(studentId)) {
      case (null) { Runtime.trap("Student profile does not exist") };
      case (?p) { p };
    };
    let marks = switch (subjectMarks.get(studentId)) { case (null) { [] }; case (?m) { m } };
    let sports = switch (sportsRecords.get(studentId)) { case (null) { [] }; case (?s) { s } };
    let attendance = switch (monthlyAttendance.get(studentId)) { case (null) { [] }; case (?a) { a } };
    let activities = switch (activityRecords.get(studentId)) { case (null) { [] }; case (?a) { a } };
    let _reportCards = switch (reportCards.get(studentId)) { case (null) { [] }; case (?r) { r } };
    { profile; marks; sports; attendance; activities; reportCards = _reportCards };
  };

  public shared ({ caller }) func uploadStudyMaterial(id : Text, name : Text, blob : Storage.ExternalBlob, comments : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized: Only admin can upload study materials") };
    let material : StudyMaterial = { id; name; blob; uploadedBy = caller; comments };
    studyMaterials.add(id, material);
  };

  public query ({ caller }) func getStudyMaterial(id : Text) : async ?StudyMaterial {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view study materials") };
    studyMaterials.get(id);
  };

  public query ({ caller }) func listAllStudyMaterials() : async [StudyMaterial] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can list study materials") };
    studyMaterials.values().toArray();
  };

  public query ({ caller }) func searchStudents(searchTerm : Text) : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can search students") };
    studentProfiles.values().toArray().filter(
      func(profile) { profile.name.contains(#text searchTerm) or profile.studentId.contains(#text searchTerm) }
    );
  };

  public query ({ caller }) func getStudentsByClass(classLevel : Nat) : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: Only users can view students by class") };
    studentProfiles.values().toArray().filter(func(profile) { profile.classLevel == classLevel });
  };

  // ===== TEACHER MANAGEMENT =====

  public func saveTeacherProfileWithSession(sessionToken : Text, profile : TeacherProfile) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only Admin and Developer can save teacher profiles") };
        teacherProfiles.add(profile.teacherId, profile);
      };
    };
  };

  public query func getTeacherProfileWithSession(sessionToken : Text, teacherId : TeacherId) : async TeacherProfile {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        switch (teacherProfiles.get(teacherId)) {
          case (null) { Runtime.trap("Teacher profile does not exist") };
          case (?profile) { profile };
        };
      };
    };
  };

  public query func listAllTeacherProfilesWithSession(sessionToken : Text) : async [TeacherProfile] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        teacherProfiles.values().toArray();
      };
    };
  };

  public func deleteTeacherProfileWithSession(sessionToken : Text, teacherId : TeacherId) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo)) { Runtime.trap("Unauthorized: Only Admin and Developer can delete teacher profiles") };
        teacherProfiles.remove(teacherId);
        teacherAttendance.remove(teacherId);
      };
    };
  };

  public func saveTeacherAttendanceWithSession(sessionToken : Text, attendance : TeacherMonthlyAttendance) : async () {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        if (not isAdminOrDeveloper(sessionInfo) and sessionInfo.role != "classTeacher") {
          Runtime.trap("Unauthorized: Only Admin, Developer, and Class Teacher can save teacher attendance")
        };
        let existing = switch (teacherAttendance.get(attendance.teacherId)) { case (null) { [] }; case (?r) { r } };
        let filtered = existing.filter(func(a : TeacherMonthlyAttendance) : Bool {
          not (a.month == attendance.month and a.session == attendance.session)
        });
        teacherAttendance.add(attendance.teacherId, filtered.concat([attendance]));
      };
    };
  };

  public query func getTeacherAttendanceWithSession(sessionToken : Text, teacherId : TeacherId, session : Text) : async [TeacherMonthlyAttendance] {
    switch (getSessionInfo(sessionToken)) {
      case (null) { Runtime.trap("Unauthorized: Invalid session token") };
      case (?sessionInfo) {
        let all = switch (teacherAttendance.get(teacherId)) { case (null) { [] }; case (?r) { r } };
        all.filter(func(a : TeacherMonthlyAttendance) : Bool { a.session == session });
      };
    };
  };

  system func preupgrade() {
    stableUsers := users.values().toArray();
  };

  system func postupgrade() {
    for (account in stableUsers.vals()) {
      users.add(account.username, account);
    };
    // Always enforce developer credentials after every upgrade
    users.add("developer", {
      username = "developer";
      password = "vkvraga2025";
      displayName = "Phanindra Bharali";
      role = "developer";
      assignedClass = null;
      activeSession = null;
    });
  };

};
