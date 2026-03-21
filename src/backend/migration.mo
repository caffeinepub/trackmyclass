import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  public type OldStudentProfile = {
    studentId : Text;
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

  public type OldLowerClassMarks = {
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

  public type OldUpperClassMarks = {
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

  public type OldSubjectMarks = {
    #lowerClass : OldLowerClassMarks;
    #upperClass : OldUpperClassMarks;
  };

  public type OldSportsRecord = {
    entryId : Text;
    session : Text;
    studentId : Text;
    game : Text;
    event : Text;
    level : Text;
    position : Text;
    remarks : Text;
  };

  public type OldMonthlyAttendance = {
    session : Text;
    studentId : Text;
    month : Text;
    totalDays : Nat;
    present : Nat;
    percentage : Float;
  };

  public type OldActivityRecord = {
    session : Text;
    studentId : Text;
    activityType : Text;
    description : Text;
    grade : Text;
    remarks : Text;
  };

  public type OldReportCard = {
    session : Text;
    studentId : Text;
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

  public type OldUserProfile = {
    name : Text;
    studentId : ?Text;
  };

  public type OldActor = {
    studentProfiles : Map.Map<Text, OldStudentProfile>;
    subjectMarks : Map.Map<Text, [OldSubjectMarks]>;
    sportsRecords : Map.Map<Text, [OldSportsRecord]>;
    monthlyAttendance : Map.Map<Text, [OldMonthlyAttendance]>;
    activityRecords : Map.Map<Text, [OldActivityRecord]>;
    reportCards : Map.Map<Text, [OldReportCard]>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  public type NewStudentProfile = {
    studentId : Text;
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

  public type NewLowerClassMarks = {
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

  public type NewUpperClassMarks = {
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

  public type NewSubjectMarks = {
    #lowerClass : NewLowerClassMarks;
    #upperClass : NewUpperClassMarks;
  };

  public type NewSportsRecord = {
    entryId : Text;
    session : Text;
    studentId : Text;
    game : Text;
    event : Text;
    level : Text;
    position : Text;
    remarks : Text;
  };

  public type NewMonthlyAttendance = {
    session : Text;
    studentId : Text;
    month : Text;
    totalDays : Nat;
    present : Nat;
    percentage : Float;
  };

  public type NewActivityRecord = {
    session : Text;
    studentId : Text;
    activityType : Text;
    description : Text;
    grade : Text;
    remarks : Text;
  };

  public type NewReportCard = {
    session : Text;
    studentId : Text;
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

  public type NewUserProfile = {
    name : Text;
    studentId : ?Text;
  };

  public type StudyMaterial = {
    id : Text;
    name : Text;
    blob : Storage.ExternalBlob;
    uploadedBy : Principal;
    comments : Text;
  };

  public type NewActor = {
    studentProfiles : Map.Map<Text, NewStudentProfile>;
    subjectMarks : Map.Map<Text, [NewSubjectMarks]>;
    sportsRecords : Map.Map<Text, [NewSportsRecord]>;
    monthlyAttendance : Map.Map<Text, [NewMonthlyAttendance]>;
    activityRecords : Map.Map<Text, [NewActivityRecord]>;
    reportCards : Map.Map<Text, [NewReportCard]>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    studyMaterials : Map.Map<Text, StudyMaterial>;
  };

  public func run(old : OldActor) : NewActor {
    {
      studentProfiles = old.studentProfiles;
      subjectMarks = old.subjectMarks;
      sportsRecords = old.sportsRecords;
      monthlyAttendance = old.monthlyAttendance;
      activityRecords = old.activityRecords;
      reportCards = old.reportCards;
      userProfiles = old.userProfiles;
      studyMaterials = Map.empty<Text, StudyMaterial>();
    };
  };
};
