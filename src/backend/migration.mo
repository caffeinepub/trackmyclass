import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";

module {
  type OldStudentId = Text;

  type OldStudentProfile = {
    studentId : OldStudentId;
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

  type OldLowerClassMarks = {
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

  type OldUpperClassMarks = {
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

  type OldSubjectMarks = {
    #lowerClass : OldLowerClassMarks;
    #upperClass : OldUpperClassMarks;
  };

  type OldSportsRecord = {
    entryId : Text;
    session : Text;
    studentId : OldStudentId;
    game : Text;
    event : Text;
    level : Text;
    position : Text;
    remarks : Text;
  };

  type OldMonthlyAttendance = {
    session : Text;
    studentId : OldStudentId;
    month : Text;
    totalDays : Nat;
    present : Nat;
    percentage : Float;
  };

  type OldActivityRecord = {
    session : Text;
    studentId : OldStudentId;
    activityType : Text;
    description : Text;
    grade : Text;
    remarks : Text;
  };

  type OldReportCard = {
    session : Text;
    studentId : OldStudentId;
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

  type OldStudyMaterial = {
    id : Text;
    name : Text;
    blob : Storage.ExternalBlob;
    uploadedBy : Principal;
    comments : Text;
  };

  type OldUserProfile = {
    name : Text;
    studentId : ?OldStudentId;
  };

  type OldUserAccount = {
    username : Text;
    password : Text;
    displayName : Text;
    role : Text;
    assignedClass : ?Nat;
  };

  type OldSessionAccount = {
    username : Text;
    password : Text;
    displayName : Text;
    role : Text;
    assignedClass : ?Nat;
    activeSession : ?Text;
  };

  type OldSessionInfo = {
    username : Text;
    role : Text;
    assignedClass : ?Nat;
    displayName : Text;
  };

  type OldNoticePost = {
    id : Text;
    title : Text;
    content : Text;
    hasFile : Bool;
    fileBlob : ?Storage.ExternalBlob;
    fileName : Text;
    postedBy : Text;
    postedAt : Text;
  };

  type OldCircular = {
    id : Text;
    title : Text;
    description : Text;
    fileBlob : Storage.ExternalBlob;
    fileName : Text;
    uploadedBy : Text;
    uploadedAt : Text;
  };

  type OldClassStudyMaterial = {
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

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    studentProfiles : Map.Map<Text, OldStudentProfile>;
    subjectMarks : Map.Map<Text, [OldSubjectMarks]>;
    sportsRecords : Map.Map<Text, [OldSportsRecord]>;
    monthlyAttendance : Map.Map<Text, [OldMonthlyAttendance]>;
    activityRecords : Map.Map<Text, [OldActivityRecord]>;
    reportCards : Map.Map<Text, [OldReportCard]>;
    studyMaterials : Map.Map<Text, OldStudyMaterial>;
    users : Map.Map<Text, OldSessionAccount>;
    sessions : Map.Map<Text, OldSessionInfo>;
    noticePosts : Map.Map<Text, OldNoticePost>;
    circulars : Map.Map<Text, OldCircular>;
    classStudyMaterials : Map.Map<Text, OldClassStudyMaterial>;
  };

  type NewStudentId = Text;

  type NewStudentProfile = {
    studentId : NewStudentId;
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

  type NewLowerClassMarks = {
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

  type NewUpperClassMarks = {
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

  type NewSubjectMarks = {
    #lowerClass : NewLowerClassMarks;
    #upperClass : NewUpperClassMarks;
  };

  type NewSportsRecord = {
    entryId : Text;
    session : Text;
    studentId : NewStudentId;
    game : Text;
    event : Text;
    level : Text;
    position : Text;
    remarks : Text;
  };

  type NewMonthlyAttendance = {
    session : Text;
    studentId : NewStudentId;
    month : Text;
    totalDays : Nat;
    present : Nat;
    percentage : Float;
  };

  type NewActivityRecord = {
    session : Text;
    studentId : NewStudentId;
    activityType : Text;
    description : Text;
    grade : Text;
    remarks : Text;
  };

  type NewReportCard = {
    session : Text;
    studentId : NewStudentId;
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

  type NewStudyMaterial = {
    id : Text;
    name : Text;
    blob : Storage.ExternalBlob;
    uploadedBy : Principal;
    comments : Text;
  };

  type NewUserProfile = {
    name : Text;
    studentId : ?NewStudentId;
  };

  type NewUserAccount = {
    username : Text;
    password : Text;
    displayName : Text;
    role : Text;
    assignedClass : ?Nat;
  };

  type NewSessionAccount = {
    username : Text;
    password : Text;
    displayName : Text;
    role : Text;
    assignedClass : ?Nat;
    activeSession : ?Text;
  };

  type NewSessionInfo = {
    username : Text;
    role : Text;
    assignedClass : ?Nat;
    displayName : Text;
  };

  type NewNoticePost = {
    id : Text;
    title : Text;
    content : Text;
    hasFile : Bool;
    fileBlob : ?Storage.ExternalBlob;
    fileName : Text;
    postedBy : Text;
    postedAt : Text;
  };

  type NewCircular = {
    id : Text;
    title : Text;
    description : Text;
    fileBlob : Storage.ExternalBlob;
    fileName : Text;
    uploadedBy : Text;
    uploadedAt : Text;
  };

  type NewClassStudyMaterial = {
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

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    studentProfiles : Map.Map<Text, NewStudentProfile>;
    subjectMarks : Map.Map<Text, [NewSubjectMarks]>;
    sportsRecords : Map.Map<Text, [NewSportsRecord]>;
    monthlyAttendance : Map.Map<Text, [NewMonthlyAttendance]>;
    activityRecords : Map.Map<Text, [NewActivityRecord]>;
    reportCards : Map.Map<Text, [NewReportCard]>;
    studyMaterials : Map.Map<Text, NewStudyMaterial>;
    users : Map.Map<Text, NewSessionAccount>;
    sessions : Map.Map<Text, NewSessionInfo>;
    noticePosts : Map.Map<Text, NewNoticePost>;
    circulars : Map.Map<Text, NewCircular>;
    classStudyMaterials : Map.Map<Text, NewClassStudyMaterial>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      studentProfiles = old.studentProfiles;
      subjectMarks = old.subjectMarks;
      sportsRecords = old.sportsRecords;
      monthlyAttendance = old.monthlyAttendance;
      activityRecords = old.activityRecords;
      reportCards = old.reportCards;
      studyMaterials = old.studyMaterials;
      users = old.users;
      sessions = old.sessions;
      noticePosts = old.noticePosts;
      circulars = old.circulars;
      classStudyMaterials = old.classStudyMaterials;
    };
  };
};
