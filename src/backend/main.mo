import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Migration "migration";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
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

  public type UserProfile = {
    name : Text;
    studentId : ?StudentId;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let studentProfiles = Map.empty<StudentId, StudentProfile>();
  let subjectMarks = Map.empty<StudentId, [SubjectMarks]>();
  let sportsRecords = Map.empty<StudentId, [SportsRecord]>();
  let monthlyAttendance = Map.empty<StudentId, [MonthlyAttendance]>();
  let activityRecords = Map.empty<StudentId, [ActivityRecord]>();
  let reportCards = Map.empty<StudentId, [ReportCard]>();
  let studyMaterials = Map.empty<Text, StudyMaterial>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to check if caller can access student data
  func canAccessStudent(caller : Principal, studentId : StudentId) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.studentId) {
          case (null) { false };
          case (?sid) { sid == studentId };
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveStudentProfile(profile : StudentProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can save or update student profiles");
    };
    studentProfiles.add(profile.studentId, profile);
  };

  public query ({ caller }) func getStudentProfile(studentId : StudentId) : async StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student profiles");
    };
    if (not canAccessStudent(caller, studentId)) {
      Runtime.trap("Unauthorized: Can only view your own student profile or admin can view all");
    };
    switch (studentProfiles.get(studentId)) {
      case (null) { Runtime.trap("Student profile does not exist") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func listAllStudentProfiles() : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can list all student profiles");
    };
    studentProfiles.values().toArray();
  };

  public shared ({ caller }) func saveSubjectMarks(studentId : StudentId, marks : [SubjectMarks]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can save subject marks");
    };
    subjectMarks.add(studentId, marks);
  };

  public query ({ caller }) func getSubjectMarks(studentId : StudentId) : async [SubjectMarks] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view subject marks");
    };
    if (not canAccessStudent(caller, studentId)) {
      Runtime.trap("Unauthorized: Can only view your own subject marks or admin can view all");
    };
    switch (subjectMarks.get(studentId)) {
      case (null) { [] };
      case (?marks) { marks };
    };
  };

  public shared ({ caller }) func saveSportsRecord(studentId : StudentId, record : SportsRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can save sports records");
    };
    let existing = switch (sportsRecords.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };
    sportsRecords.add(studentId, existing.concat([record]));
  };

  public query ({ caller }) func getSportsRecords(studentId : StudentId) : async [SportsRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view sports records");
    };
    if (not canAccessStudent(caller, studentId)) {
      Runtime.trap("Unauthorized: Can only view your own sports records or admin can view all");
    };
    switch (sportsRecords.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  public shared ({ caller }) func saveMonthlyAttendance(studentId : StudentId, attendance : MonthlyAttendance) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can save attendance records");
    };
    let existing = switch (monthlyAttendance.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };
    monthlyAttendance.add(studentId, existing.concat([attendance]));
  };

  public query ({ caller }) func getMonthlyAttendance(studentId : StudentId) : async [MonthlyAttendance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance records");
    };
    if (not canAccessStudent(caller, studentId)) {
      Runtime.trap("Unauthorized: Can only view your own attendance records or admin can view all");
    };
    switch (monthlyAttendance.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  public shared ({ caller }) func saveActivityRecord(studentId : StudentId, activity : ActivityRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can save activity records");
    };
    let existing = switch (activityRecords.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };
    activityRecords.add(studentId, existing.concat([activity]));
  };

  public query ({ caller }) func getActivityRecords(studentId : StudentId) : async [ActivityRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view activity records");
    };
    if (not canAccessStudent(caller, studentId)) {
      Runtime.trap("Unauthorized: Can only view your own activity records or admin can view all");
    };
    switch (activityRecords.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  public shared ({ caller }) func saveReportCard(studentId : StudentId, report : ReportCard) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can save report cards");
    };
    let existing = switch (reportCards.get(studentId)) {
      case (null) { [] };
      case (?cards) { cards };
    };
    reportCards.add(studentId, existing.concat([report]));
  };

  public query ({ caller }) func getReportCards(studentId : StudentId) : async [ReportCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view report cards");
    };
    if (not canAccessStudent(caller, studentId)) {
      Runtime.trap("Unauthorized: Can only view your own report cards or admin can view all");
    };
    switch (reportCards.get(studentId)) {
      case (null) { [] };
      case (?cards) { cards };
    };
  };

  public query ({ caller }) func getAllRecordsForStudent(studentId : StudentId) : async {
    profile : StudentProfile;
    marks : [SubjectMarks];
    sports : [SportsRecord];
    attendance : [MonthlyAttendance];
    activities : [ActivityRecord];
    reportCards : [ReportCard];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student records");
    };
    if (not canAccessStudent(caller, studentId)) {
      Runtime.trap("Unauthorized: Can only view your own records or admin can view all");
    };
    let profile = switch (studentProfiles.get(studentId)) {
      case (null) { Runtime.trap("Student profile does not exist") };
      case (?p) { p };
    };
    let marks = switch (subjectMarks.get(studentId)) {
      case (null) { [] };
      case (?m) { m };
    };
    let sports = switch (sportsRecords.get(studentId)) {
      case (null) { [] };
      case (?s) { s };
    };
    let attendance = switch (monthlyAttendance.get(studentId)) {
      case (null) { [] };
      case (?a) { a };
    };
    let activities = switch (activityRecords.get(studentId)) {
      case (null) { [] };
      case (?a) { a };
    };
    let _reportCards = switch (reportCards.get(studentId)) {
      case (null) { [] };
      case (?r) { r };
    };
    {
      profile;
      marks;
      sports;
      attendance;
      activities;
      reportCards = _reportCards;
    };
  };

  public shared ({ caller }) func uploadStudyMaterial(id : Text, name : Text, blob : Storage.ExternalBlob, comments : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can upload study materials");
    };
    let material : StudyMaterial = {
      id;
      name;
      blob;
      uploadedBy = caller;
      comments;
    };
    studyMaterials.add(id, material);
  };

  public query ({ caller }) func getStudyMaterial(id : Text) : async ?StudyMaterial {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view study materials");
    };
    studyMaterials.get(id);
  };

  public query ({ caller }) func listAllStudyMaterials() : async [StudyMaterial] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view study materials");
    };
    studyMaterials.values().toArray();
  };

  public query ({ caller }) func searchStudents(searchTerm : Text) : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can search student profiles");
    };
    studentProfiles.values().toArray().filter(
      func(profile) {
        profile.name.contains(#text searchTerm) or profile.studentId.contains(#text searchTerm)
      }
    );
  };

  public query ({ caller }) func getStudentsByClass(classLevel : Nat) : async [StudentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can get students by class");
    };
    studentProfiles.values().toArray().filter(
      func(profile) { profile.classLevel == classLevel }
    );
  };
};
