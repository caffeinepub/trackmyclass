import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Archive,
  ArrowLeft,
  Camera,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Save,
  TrendingUp,
  X,
} from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AppNav } from "../App";
import { ExternalBlob } from "../backend";
import type {
  ActivityRecord,
  LowerClassMarks,
  MonthlyAttendance,
  ReportCard,
  SportsRecord,
  StudentProfile,
  SubjectMarks,
  UpperClassMarks,
} from "../backend.d";
import { SessionHistoryTab } from "../components/SessionHistoryTab";
import { StudentAnalyticsTab } from "../components/StudentAnalyticsTab";
import { useActor } from "../hooks/useActor";
import { type AuthSession, canEdit } from "../hooks/useAuth";
import {
  useActivityRecords,
  useDeleteActivityRecord,
  useDeleteSportsRecord,
  useMonthlyAttendance,
  useReportCards,
  useSaveActivityRecord,
  useSaveAttendance,
  useSaveReportCard,
  useSaveSportsRecord,
  useSaveStudentProfile,
  useSaveSubjectMarks,
  useSportsRecords,
  useStudentProfile,
  useStudentSessionList,
  useSubjectMarks,
  useSubjectMarksForSession,
  useUpdateActivityRecord,
  useUpdateSportsRecord,
} from "../hooks/useQueries";
import {
  ACTIVITY_TYPES,
  DAILY_RECORD_TYPES,
  LEVELS,
  MONTHS,
  getGrade,
  getSubjectsForClass,
  isLowerClass,
} from "../utils/gradeUtils";
import { getSchoolSettings } from "./SettingsPage";

// ─────────────────────────────────────────
// Roman numeral helper
// ─────────────────────────────────────────
const toRoman = (n: number): string => {
  const map: [number, string][] = [
    [8, "VIII"],
    [7, "VII"],
    [6, "VI"],
    [5, "V"],
    [4, "IV"],
    [3, "III"],
    [2, "II"],
    [1, "I"],
  ];
  for (const [val, str] of map) if (n >= val) return str;
  return String(n);
};

interface Props {
  nav: AppNav;
  studentId: string;
}

// ─────────────────────────────────────────
// Page-level context for session
// ─────────────────────────────────────────
interface StudentPageCtx {
  sessionToken: string;
  canEditData: boolean;
  canEditProfile: boolean;
  academicSession: string | null;
  isResultsFinalized: boolean;
  setResultsFinalized: (v: boolean) => void;
}
const StudentPageContext = createContext<StudentPageCtx>({
  sessionToken: "",
  canEditData: false,
  canEditProfile: false,
  academicSession: null,
  isResultsFinalized: false,
  setResultsFinalized: () => {},
});
const useStudentPage = () => useContext(StudentPageContext);

// ─────────────────────────────────────────
// Grade badge helper
// ─────────────────────────────────────────
function GradeBadge({ grade }: { grade: string }) {
  const color =
    grade === "A1" || grade === "A2"
      ? "bg-success/10 text-success border-success/30"
      : grade === "B1" || grade === "B2"
        ? "bg-primary/10 text-primary border-primary/30"
        : grade === "C1" || grade === "C2"
          ? "bg-warning/10 text-warning-foreground border-warning/30"
          : "bg-destructive/10 text-destructive border-destructive/30";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${color}`}
    >
      {grade || "–"}
    </span>
  );
}

// ─────────────────────────────────────────
// PROFILE TAB
// ─────────────────────────────────────────
function ProfileTab({ profile }: { profile: StudentProfile }) {
  const { sessionToken, canEditProfile: isAdmin } = useStudentPage();
  const [form, setForm] = useState<StudentProfile>(profile);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const saveMutation = useSaveStudentProfile(sessionToken);
  const { actor } = useActor();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  // Load stored photo
  useEffect(() => {
    if (!actor || !profile.studentId) return;
    actor
      .getStudyMaterial(`student-photo-${profile.studentId}`)
      .then((m) => {
        if (m) setPhotoUrl(m.blob.getDirectURL());
      })
      .catch(() => {});
  }, [actor, profile.studentId]);

  const set = (field: keyof StudentProfile, value: string | number | bigint) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(form);
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!actor) return;
    setUploadingPhoto(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const blob = ExternalBlob.fromBytes(bytes);
      await actor.uploadStudyMaterial(
        `student-photo-${profile.studentId}`,
        `Photo of ${profile.name}`,
        blob,
        "Student photo",
      );
      const material = await actor.getStudyMaterial(
        `student-photo-${profile.studentId}`,
      );
      if (material) {
        setPhotoUrl(material.blob.getDirectURL());
        toast.success("Photo uploaded");
      }
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-6" data-ocid="profile.section">
      {/* Photo + Basic Info */}
      <div className="flex gap-6 items-start">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-24 h-24 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera size={28} className="text-muted-foreground" />
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
          />
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={uploadingPhoto}
              onClick={() => fileRef.current?.click()}
              data-ocid="profile.photo.upload_button"
            >
              {uploadingPhoto ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Camera size={12} />
              )}
              <span className="ml-1">
                {uploadingPhoto ? "Uploading…" : "Upload Photo"}
              </span>
            </Button>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Session">
            <Input
              data-ocid="profile.session.input"
              value={form.session}
              onChange={(e) => set("session", e.target.value)}
              disabled={!isAdmin}
            />
          </Field>
          <Field label="Admission No. (Student ID)">
            <Input
              data-ocid="profile.student_id.input"
              value={form.studentId}
              disabled
            />
          </Field>
          <Field label="Full Name">
            <Input
              data-ocid="profile.name.input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              disabled={!isAdmin}
            />
          </Field>
          <Field label="Class">
            <Select
              value={String(form.classLevel)}
              onValueChange={(v) => set("classLevel", BigInt(v))}
              disabled={!isAdmin}
            >
              <SelectTrigger data-ocid="profile.class.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                  <SelectItem key={c} value={String(c)}>
                    Class {toRoman(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Section">
            <Input
              data-ocid="profile.section.input"
              value={form.section}
              onChange={(e) => set("section", e.target.value)}
              disabled={!isAdmin}
            />
          </Field>
          <Field label="Roll No">
            <Input
              data-ocid="profile.rollno.input"
              value={form.rollNo}
              onChange={(e) => set("rollNo", e.target.value)}
              disabled={!isAdmin}
            />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Gender">
          <Select
            value={form.gender}
            onValueChange={(v) => set("gender", v)}
            disabled={!isAdmin}
          >
            <SelectTrigger data-ocid="profile.gender.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date of Birth">
          <Input
            data-ocid="profile.dob.input"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => set("dateOfBirth", e.target.value)}
            disabled={!isAdmin}
          />
        </Field>
        <Field label="Religion">
          <Input
            data-ocid="profile.religion.input"
            value={form.religion}
            onChange={(e) => set("religion", e.target.value)}
            disabled={!isAdmin}
          />
        </Field>
        <Field label="Tribe">
          <Input
            data-ocid="profile.tribe.input"
            value={form.tribe}
            onChange={(e) => set("tribe", e.target.value)}
            disabled={!isAdmin}
          />
        </Field>
        <Field label="Father's Name">
          <Input
            data-ocid="profile.father_name.input"
            value={form.fatherName}
            onChange={(e) => set("fatherName", e.target.value)}
            disabled={!isAdmin}
          />
        </Field>
        <Field label="Mother's Name">
          <Input
            data-ocid="profile.mother_name.input"
            value={form.motherName}
            onChange={(e) => set("motherName", e.target.value)}
            disabled={!isAdmin}
          />
        </Field>
        <Field label="Contact No.">
          <Input
            data-ocid="profile.contact.input"
            value={form.contact}
            onChange={(e) =>
              set("contact", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            maxLength={10}
            inputMode="numeric"
            disabled={!isAdmin}
          />
        </Field>
        <Field label="PEN">
          <Input
            data-ocid="profile.pen.input"
            value={form.pen}
            onChange={(e) =>
              set("pen", e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            disabled={!isAdmin}
            maxLength={11}
            inputMode="numeric"
          />
        </Field>
        <Field label="Aadhar No.">
          <Input
            data-ocid="profile.aadhar.input"
            value={form.aadhar}
            onChange={(e) =>
              set("aadhar", e.target.value.replace(/\D/g, "").slice(0, 12))
            }
            disabled={!isAdmin}
            maxLength={12}
            inputMode="numeric"
          />
        </Field>
        <Field label="Address" className="sm:col-span-2 lg:col-span-3">
          <Input
            data-ocid="profile.address.input"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            disabled={!isAdmin}
          />
        </Field>
      </div>

      {/* Health */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Health Record</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Height – Reopening (cm)">
            <Input
              data-ocid="profile.height_reopening.input"
              type="number"
              value={form.heightReopening || ""}
              onChange={(e) => set("heightReopening", Number(e.target.value))}
              disabled={!isAdmin}
            />
          </Field>
          <Field label="Height – Closure (cm)">
            <Input
              data-ocid="profile.height_closure.input"
              type="number"
              value={form.heightClosure || ""}
              onChange={(e) => set("heightClosure", Number(e.target.value))}
              disabled={!isAdmin}
            />
          </Field>
          <Field label="Weight – Reopening (kg)">
            <Input
              data-ocid="profile.weight_reopening.input"
              type="number"
              value={form.weightReopening || ""}
              onChange={(e) => set("weightReopening", Number(e.target.value))}
              disabled={!isAdmin}
            />
          </Field>
          <Field label="Weight – Closure (kg)">
            <Input
              data-ocid="profile.weight_closure.input"
              type="number"
              value={form.weightClosure || ""}
              onChange={(e) => set("weightClosure", Number(e.target.value))}
              disabled={!isAdmin}
            />
          </Field>
        </div>
      </div>

      {isAdmin && (
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          data-ocid="profile.save.submit_button"
        >
          {saveMutation.isPending && (
            <Loader2 size={14} className="mr-2 animate-spin" />
          )}
          <Save size={14} className="mr-2" /> Save Profile
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// MARKS TAB
// ─────────────────────────────────────────
function calcLowerMarks(lm: LowerClassMarks): LowerClassMarks {
  const total =
    lm.writtenTest1 +
    lm.writtenTest2 +
    lm.writtenTest3 +
    lm.writtenTest4 +
    lm.comprehensiveTest1 +
    lm.comprehensiveTest2 +
    lm.comprehensiveTest3 +
    lm.comprehensiveTest4;
  // Max = 8 * 50 = 400; convert to 100%
  const pct = Math.round((total / 400) * 100);
  return { ...lm, totalMarks: total, percentage: pct, grade: getGrade(pct) };
}

function calcUpperMarks(um: UpperClassMarks): UpperClassMarks {
  const pt1w = Math.round(um.pt1 * 0.2);
  const pt2w = Math.round(um.pt2 * 0.2);
  const t1 = Math.round(pt1w + um.term1Exam + um.nb1 + um.se1);
  const t2 = Math.round(pt2w + um.term2Exam + um.nb2 + um.se2);
  const fp = Math.round((t1 + t2) / 2);
  return {
    ...um,
    pt1Weightage: pt1w,
    pt2Weightage: pt2w,
    term1Total: t1,
    term2Total: t2,
    finalPercentage: fp,
    grade: getGrade(fp),
  };
}

function MarksTab({
  studentId,
  classLevel,
}: { studentId: string; classLevel: number }) {
  const {
    sessionToken,
    canEditData,
    academicSession,
    isResultsFinalized,
    setResultsFinalized,
  } = useStudentPage();
  const finalizedKey = `finalized_${studentId}_${academicSession ?? ""}`;
  const isFinalized = isResultsFinalized;
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const { data: marksData, isLoading } = useSubjectMarks(
    sessionToken,
    studentId,
  );
  const saveMutation = useSaveSubjectMarks(sessionToken, studentId);
  const subjects = getSubjectsForClass(classLevel);
  const lower = isLowerClass(classLevel);

  const emptyLower = (subjectName: string): SubjectMarks => ({
    __kind__: "lowerClass",
    lowerClass: {
      subjectName,
      writtenTest1: 0,
      writtenTest2: 0,
      writtenTest3: 0,
      writtenTest4: 0,
      comprehensiveTest1: 0,
      comprehensiveTest2: 0,
      comprehensiveTest3: 0,
      comprehensiveTest4: 0,
      totalMarks: 0,
      percentage: 0,
      grade: "",
    },
  });

  const emptyUpper = (subjectName: string): SubjectMarks => ({
    __kind__: "upperClass",
    upperClass: {
      subjectName,
      pt1: 0,
      pt2: 0,
      term1Exam: 0,
      term2Exam: 0,
      nb1: 0,
      nb2: 0,
      se1: 0,
      se2: 0,
      pt1Weightage: 0,
      pt2Weightage: 0,
      term1Total: 0,
      term2Total: 0,
      finalPercentage: 0,
      grade: "",
    },
  });

  const buildInitial = (): SubjectMarks[] =>
    subjects.map((s) => (lower ? emptyLower(s) : emptyUpper(s)));

  const [marks, setMarks] = useState<SubjectMarks[]>(buildInitial());

  // biome-ignore lint/correctness/useExhaustiveDependencies: functions defined in component
  useEffect(() => {
    if (marksData && marksData.length > 0) {
      // Merge saved marks with current subjects
      const merged = subjects.map((subj) => {
        const found = marksData.find((m) =>
          m.__kind__ === "lowerClass"
            ? m.lowerClass.subjectName === subj
            : m.upperClass.subjectName === subj,
        );
        return found ?? (lower ? emptyLower(subj) : emptyUpper(subj));
      });
      setMarks(merged);
    } else {
      setMarks(buildInitial());
    }
  }, [marksData, classLevel]);

  // Compute whether all required marks are filled to enable Finalize button
  const canFinalize = (() => {
    if (!marks || marks.length === 0) return false;
    for (const m of marks) {
      if (m.__kind__ === "lowerClass" && m.lowerClass) {
        const lc = m.lowerClass;
        if (
          !lc.writtenTest1 ||
          !lc.writtenTest2 ||
          !lc.writtenTest3 ||
          !lc.writtenTest4 ||
          !lc.comprehensiveTest1 ||
          !lc.comprehensiveTest2 ||
          !lc.comprehensiveTest3 ||
          !lc.comprehensiveTest4
        )
          return false;
      } else if (m.__kind__ === "upperClass" && m.upperClass) {
        const uc = m.upperClass;
        if (!uc.pt1 || !uc.pt2 || !uc.term1Exam || !uc.term2Exam) return false;
      }
    }
    return true;
  })();

  const updateLower = (
    idx: number,
    field: keyof LowerClassMarks,
    val: number,
  ) => {
    setMarks((prev) => {
      const next = [...prev];
      const m = next[idx];
      if (m.__kind__ !== "lowerClass") return prev;
      const updated = calcLowerMarks({ ...m.lowerClass, [field]: val });
      next[idx] = { __kind__: "lowerClass", lowerClass: updated };
      return next;
    });
  };

  const updateUpper = (
    idx: number,
    field: keyof UpperClassMarks,
    val: number,
  ) => {
    setMarks((prev) => {
      const next = [...prev];
      const m = next[idx];
      if (m.__kind__ !== "upperClass") return prev;
      const updated = calcUpperMarks({ ...m.upperClass, [field]: val });
      next[idx] = { __kind__: "upperClass", upperClass: updated };
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(marks);
      toast.success("Marks saved");
    } catch {
      toast.error("Failed to save marks");
    }
  };

  if (isLoading)
    return <Skeleton className="h-64 w-full" data-ocid="marks.loading_state" />;

  return (
    <div className="space-y-4" data-ocid="marks.section">
      {isFinalized && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 border border-green-200"
          data-ocid="marks.finalized.success_state"
        >
          <span className="text-green-600 font-semibold text-sm">
            ✓ Results Finalized — Marks Locked
          </span>
        </div>
      )}
      {lower ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Written Tests &amp; Comprehensive Assessments (50 marks each)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>WT1</TableHead>
                    <TableHead>WT2</TableHead>
                    <TableHead>WT3</TableHead>
                    <TableHead>WT4</TableHead>
                    <TableHead>CA1</TableHead>
                    <TableHead>CA2</TableHead>
                    <TableHead>CA3</TableHead>
                    <TableHead>CA4</TableHead>
                    <TableHead>Total /400</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((m, idx) => {
                    if (m.__kind__ !== "lowerClass") return null;
                    const lm = m.lowerClass;
                    return (
                      <TableRow key={lm.subjectName}>
                        <TableCell className="font-medium">
                          {lm.subjectName}
                        </TableCell>
                        {(
                          [
                            "writtenTest1",
                            "writtenTest2",
                            "writtenTest3",
                            "writtenTest4",
                            "comprehensiveTest1",
                            "comprehensiveTest2",
                            "comprehensiveTest3",
                            "comprehensiveTest4",
                          ] as (keyof LowerClassMarks)[]
                        ).map((field) => (
                          <TableCell key={field} className="p-1">
                            <Input
                              type="number"
                              min={0}
                              max={50}
                              value={(lm[field] as number) || ""}
                              onChange={(e) =>
                                updateLower(idx, field, Number(e.target.value))
                              }
                              onInput={(e) => {
                                const t = e.currentTarget as HTMLInputElement;
                                if (t.value.length > 2)
                                  t.value = t.value.slice(0, 2);
                              }}
                              className="w-14 h-7 text-sm"
                              disabled={isFinalized}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="font-semibold">
                          {lm.totalMarks}
                        </TableCell>
                        <TableCell>{Math.round(lm.percentage)}</TableCell>
                        <TableCell>
                          <GradeBadge grade={lm.grade} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Term Marks Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="bg-blue-50 dark:bg-blue-950 text-xs">
                      PT1 /50
                    </TableHead>
                    <TableHead className="bg-blue-50 dark:bg-blue-950 text-xs">
                      NB1 /5
                    </TableHead>
                    <TableHead className="bg-blue-50 dark:bg-blue-950 text-xs">
                      SE1 /5
                    </TableHead>
                    <TableHead className="bg-blue-50 dark:bg-blue-950 text-xs">
                      Term1 /80
                    </TableHead>
                    <TableHead className="bg-blue-100 dark:bg-blue-900 font-bold">
                      T1 Total
                    </TableHead>
                    <TableHead className="bg-orange-50 dark:bg-orange-950 text-xs">
                      PT2 /50
                    </TableHead>
                    <TableHead className="bg-orange-50 dark:bg-orange-950 text-xs">
                      NB2 /5
                    </TableHead>
                    <TableHead className="bg-orange-50 dark:bg-orange-950 text-xs">
                      SE2 /5
                    </TableHead>
                    <TableHead className="bg-orange-50 dark:bg-orange-950 text-xs">
                      Term2 /80
                    </TableHead>
                    <TableHead className="bg-orange-100 dark:bg-orange-900 font-bold">
                      T2 Total
                    </TableHead>
                    <TableHead className="bg-primary/10">Final %</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((m, idx) => {
                    if (m.__kind__ !== "upperClass") return null;
                    const um = m.upperClass;
                    // Term1 group: PT1, NB1, SE1, Term1Exam | Term2 group: PT2, NB2, SE2, Term2Exam
                    const term1Fields: (keyof UpperClassMarks)[] = [
                      "pt1",
                      "nb1",
                      "se1",
                      "term1Exam",
                    ];
                    const term2Fields: (keyof UpperClassMarks)[] = [
                      "pt2",
                      "nb2",
                      "se2",
                      "term2Exam",
                    ];
                    const maxVals: Record<string, number> = {
                      pt1: 50,
                      pt2: 50,
                      term1Exam: 80,
                      nb1: 5,
                      se1: 5,
                      term2Exam: 80,
                      nb2: 5,
                      se2: 5,
                    };
                    return (
                      <TableRow key={um.subjectName}>
                        <TableCell className="font-medium">
                          {um.subjectName}
                        </TableCell>
                        {term1Fields.map((field) => (
                          <TableCell
                            key={field}
                            className="p-1 bg-blue-50/50 dark:bg-blue-950/30"
                          >
                            <Input
                              type="number"
                              min={0}
                              max={maxVals[field]}
                              value={(um[field] as number) || ""}
                              onChange={(e) =>
                                updateUpper(idx, field, Number(e.target.value))
                              }
                              onInput={(e) => {
                                const t = e.currentTarget as HTMLInputElement;
                                const digitMap: Record<string, number> = {
                                  pt1: 2,
                                  pt2: 2,
                                  nb1: 1,
                                  se1: 1,
                                  nb2: 1,
                                  se2: 1,
                                  term1Exam: 3,
                                  term2Exam: 3,
                                };
                                const d = digitMap[field] ?? 2;
                                if (t.value.length > d)
                                  t.value = t.value.slice(0, d);
                              }}
                              className="w-14 h-7 text-sm"
                              disabled={isFinalized}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="bg-blue-100 dark:bg-blue-900 font-semibold text-sm">
                          {Math.round(um.term1Total)}
                        </TableCell>
                        {term2Fields.map((field) => (
                          <TableCell
                            key={field}
                            className="p-1 bg-orange-50/50 dark:bg-orange-950/30"
                          >
                            <Input
                              type="number"
                              min={0}
                              max={maxVals[field]}
                              value={(um[field] as number) || ""}
                              onChange={(e) =>
                                updateUpper(idx, field, Number(e.target.value))
                              }
                              onInput={(e) => {
                                const t = e.currentTarget as HTMLInputElement;
                                const digitMap: Record<string, number> = {
                                  pt1: 2,
                                  pt2: 2,
                                  nb1: 1,
                                  se1: 1,
                                  nb2: 1,
                                  se2: 1,
                                  term1Exam: 3,
                                  term2Exam: 3,
                                };
                                const d = digitMap[field] ?? 2;
                                if (t.value.length > d)
                                  t.value = t.value.slice(0, d);
                              }}
                              className="w-14 h-7 text-sm"
                              disabled={isFinalized}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="bg-orange-100 dark:bg-orange-900 font-semibold text-sm">
                          {Math.round(um.term2Total)}
                        </TableCell>
                        <TableCell className="bg-primary/10 font-bold">
                          {Math.round(um.finalPercentage)}
                        </TableCell>
                        <TableCell>
                          <GradeBadge grade={um.grade} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!isFinalized && (
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          data-ocid="marks.save.submit_button"
        >
          {saveMutation.isPending && (
            <Loader2 size={14} className="mr-2 animate-spin" />
          )}
          <Save size={14} className="mr-2" /> Save Marks
        </Button>
      )}

      {/* Finalize Results */}
      {!isFinalized && canEditData && (
        <div className="pt-2">
          <Button
            variant="outline"
            className="border-amber-400 text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => canFinalize && setShowFinalizeDialog(true)}
            disabled={!canFinalize}
            data-ocid="marks.finalize.button"
          >
            🔒 Finalize Results
          </Button>
          {!canFinalize ? (
            <p className="text-xs text-red-500 mt-1">
              ⚠ Please fill in all required marks for all subjects before
              finalizing.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Finalizing locks marks and enables student promotion.
            </p>
          )}
        </div>
      )}

      {/* Finalize Confirm Dialog */}
      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent data-ocid="marks.finalize.dialog">
          <DialogHeader>
            <DialogTitle>Finalize Results?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Once you finalize results for this session, marks will be locked and
            cannot be edited. The Promote option will become available. Are you
            sure?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFinalizeDialog(false)}
              data-ocid="marks.finalize.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => {
                localStorage.setItem(finalizedKey, "true");
                setResultsFinalized(true);
                setShowFinalizeDialog(false);
              }}
              data-ocid="marks.finalize.confirm_button"
            >
              Yes, Finalize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────
// ATTENDANCE TAB
// ─────────────────────────────────────────
// Fixed 12 months in school-year order
const SCHOOL_YEAR_MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

type AttendanceRowState = {
  present: string;
  totalDays: string;
  editing: boolean;
  saving: boolean;
};

function AttendanceTab({ studentId }: { studentId: string }) {
  const { sessionToken, canEditData, academicSession } = useStudentPage();
  const { data: attendance, isLoading } = useMonthlyAttendance(
    sessionToken,
    studentId,
  );
  const saveMutation = useSaveAttendance(sessionToken, studentId);
  const [sessionYear, setSessionYear] = useState(academicSession ?? "2025-26");
  const [rows, setRows] = useState<Record<string, AttendanceRowState>>(() =>
    Object.fromEntries(
      SCHOOL_YEAR_MONTHS.map((m) => [
        m,
        { present: "", totalDays: "", editing: false, saving: false },
      ]),
    ),
  );

  // Sync rows when attendance data loads
  useEffect(() => {
    if (!attendance) return;
    setRows((prev) => {
      const next = { ...prev };
      for (const m of SCHOOL_YEAR_MONTHS) {
        const rec = attendance.find((a) => a.month === m);
        if (rec && !next[m].editing) {
          next[m] = {
            present: rec.present !== undefined ? String(rec.present) : "",
            totalDays: rec.totalDays !== undefined ? String(rec.totalDays) : "",
            editing: false,
            saving: false,
          };
        }
      }
      return next;
    });
  }, [attendance]);

  const setRow = (month: string, patch: Partial<AttendanceRowState>) =>
    setRows((prev) => ({ ...prev, [month]: { ...prev[month], ...patch } }));

  const handleSave = async (month: string) => {
    const row = rows[month];
    if (!row.present || !row.totalDays) {
      toast.error("Enter days present and total working days");
      return;
    }
    setRow(month, { saving: true });
    try {
      const att: MonthlyAttendance = {
        studentId,
        month,
        present: BigInt(row.present),
        totalDays: BigInt(row.totalDays),
        session: sessionYear,
        percentage:
          Math.round((Number(row.present) / Number(row.totalDays)) * 100 * 10) /
          10,
      };
      await saveMutation.mutateAsync(att);
      toast.success(`${month} attendance saved`);
      setRow(month, { editing: false, saving: false });
    } catch {
      toast.error("Failed to save attendance");
      setRow(month, { saving: false });
    }
  };

  const totalPresent = (attendance ?? []).reduce(
    (s, a) => s + Number(a.present),
    0,
  );
  const totalWorking = (attendance ?? []).reduce(
    (s, a) => s + Number(a.totalDays),
    0,
  );
  const overallPct =
    totalWorking > 0 ? ((totalPresent / totalWorking) * 100).toFixed(1) : "0.0";

  if (isLoading)
    return (
      <Skeleton className="h-40 w-full" data-ocid="attendance.loading_state" />
    );

  return (
    <div className="space-y-4" data-ocid="attendance.section">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm">
              Monthly Attendance — All 12 Months
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Session</Label>
              <Input
                data-ocid="attendance.session.input"
                value={sessionYear}
                onChange={(e) => setSessionYear(e.target.value)}
                placeholder="2025-26"
                className="w-24 h-7 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Month</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>%</TableHead>
                  {canEditData && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {SCHOOL_YEAR_MONTHS.map((month, i) => {
                  const row = rows[month];
                  const rec = (attendance ?? []).find((a) => a.month === month);
                  const pct = rec
                    ? rec.percentage
                    : row.present && row.totalDays
                      ? Math.round(
                          (Number(row.present) / Number(row.totalDays)) *
                            100 *
                            10,
                        ) / 10
                      : null;
                  const isEditing = row.editing || (!rec && canEditData);
                  return (
                    <TableRow
                      key={month}
                      data-ocid={`attendance.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{month}</TableCell>
                      <TableCell>
                        {isEditing && canEditData ? (
                          <Input
                            type="number"
                            min={0}
                            value={row.present}
                            onChange={(e) =>
                              setRow(month, { present: e.target.value })
                            }
                            className="w-20 h-7 text-sm"
                            data-ocid="attendance.present.input"
                          />
                        ) : (
                          <span>{rec ? String(rec.present) : "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing && canEditData ? (
                          <Input
                            type="number"
                            min={0}
                            value={row.totalDays}
                            onChange={(e) =>
                              setRow(month, { totalDays: e.target.value })
                            }
                            className="w-20 h-7 text-sm"
                            data-ocid="attendance.total.input"
                          />
                        ) : (
                          <span>{rec ? String(rec.totalDays) : "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pct !== null ? (
                          <Badge
                            variant={pct >= 75 ? "default" : "destructive"}
                          >
                            {pct.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      {canEditData && (
                        <TableCell>
                          {isEditing ? (
                            <Button
                              size="sm"
                              disabled={row.saving}
                              onClick={() => handleSave(month)}
                              data-ocid="attendance.save.submit_button"
                            >
                              {row.saving ? (
                                <Loader2
                                  size={12}
                                  className="animate-spin mr-1"
                                />
                              ) : (
                                <Save size={12} className="mr-1" />
                              )}
                              Save
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRow(month, { editing: true })}
                              data-ocid={`attendance.edit_button.${i + 1}`}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 p-3 bg-muted rounded-lg flex gap-6 text-sm flex-wrap">
            <span>
              Total Present: <strong>{totalPresent}</strong>
            </span>
            <span>
              Working Days: <strong>{totalWorking}</strong>
            </span>
            <span>
              Overall: <strong>{overallPct}%</strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────
// SPORTS TAB
// ─────────────────────────────────────────
function SportsTab({ studentId }: { studentId: string }) {
  const { sessionToken, canEditData, academicSession } = useStudentPage();
  const { data: sportsAll, isLoading } = useSportsRecords(
    sessionToken,
    studentId,
  );
  const sports = academicSession
    ? (sportsAll ?? []).filter((s) => s.session === academicSession)
    : sportsAll;
  const saveMutation = useSaveSportsRecord(sessionToken, studentId);
  const updateMutation = useUpdateSportsRecord(sessionToken, studentId);
  const deleteMutation = useDeleteSportsRecord(sessionToken, studentId);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const emptyForm: SportsRecord = {
    studentId,
    game: "",
    event: "",
    level: "School",
    position: "",
    remarks: "",
    session: "2025-26",
    entryId: "",
  };
  const [form, setForm] = useState<SportsRecord>(emptyForm);

  const set = (f: keyof SportsRecord, v: string) =>
    setForm((prev) => ({ ...prev, [f]: v }));

  const handleEdit = (s: SportsRecord) => {
    setForm({ ...s });
    setEditingEntryId(s.entryId);
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.game.trim()) {
      toast.error("Game name required");
      return;
    }
    try {
      if (editingEntryId) {
        await updateMutation.mutateAsync({
          entryId: editingEntryId,
          updated: { ...form, entryId: editingEntryId },
        });
        toast.success("Sports record updated");
        setEditingEntryId(null);
      } else {
        await saveMutation.mutateAsync({ ...form, entryId: `${Date.now()}` });
        toast.success("Sports record saved");
      }
      setForm(emptyForm);
    } catch (err) {
      toast.error(
        editingEntryId
          ? `Failed to update: ${err instanceof Error ? err.message : String(err)}`
          : "Failed to save",
      );
    }
  };

  if (isLoading)
    return (
      <Skeleton className="h-40 w-full" data-ocid="sports.loading_state" />
    );

  return (
    <div className="space-y-6" data-ocid="sports.section">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {editingEntryId ? "Edit Sports Record" : "Add Sports Record"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            <Field label="Game">
              <Input
                data-ocid="sports.game.input"
                value={form.game}
                onChange={(e) => set("game", e.target.value)}
              />
            </Field>
            <Field label="Event">
              <Input
                data-ocid="sports.event.input"
                value={form.event}
                onChange={(e) => set("event", e.target.value)}
              />
            </Field>
            <Field label="Level">
              <Select value={form.level} onValueChange={(v) => set("level", v)}>
                <SelectTrigger data-ocid="sports.level.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Position">
              <Input
                data-ocid="sports.position.input"
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
              />
            </Field>
            <Field label="Session">
              <Input
                data-ocid="sports.session.input"
                value={form.session}
                onChange={(e) => set("session", e.target.value)}
              />
            </Field>
            <Field label="Remarks">
              <Input
                data-ocid="sports.remarks.input"
                value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)}
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || updateMutation.isPending}
              data-ocid={
                editingEntryId
                  ? "sports.update.submit_button"
                  : "sports.add.submit_button"
              }
            >
              {(saveMutation.isPending || updateMutation.isPending) && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              {editingEntryId ? (
                <>
                  <Save size={14} className="mr-2" /> Update Record
                </>
              ) : (
                <>
                  <Plus size={14} className="mr-2" /> Add Record
                </>
              )}
            </Button>
            {editingEntryId && (
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                data-ocid="sports.cancel.button"
              >
                <X size={14} className="mr-2" /> Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {(sports ?? []).length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Remarks</TableHead>
                    {canEditData && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(sports ?? []).map((s, i) => (
                    <TableRow
                      key={s.entryId || i}
                      data-ocid={`sports.item.${i + 1}`}
                    >
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{s.game}</TableCell>
                      <TableCell>{s.event}</TableCell>
                      <TableCell>{s.level}</TableCell>
                      <TableCell>{s.position}</TableCell>
                      <TableCell>{s.session}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {s.remarks}
                      </TableCell>
                      {canEditData && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(s)}
                              data-ocid={`sports.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-amber-600 hover:text-amber-700"
                              onClick={async () => {
                                if (
                                  window.confirm("Archive this sports record?")
                                ) {
                                  try {
                                    await deleteMutation.mutateAsync(s.entryId);
                                    toast.success("Sports record archived");
                                  } catch (err) {
                                    toast.error(
                                      `Failed to archive: ${err instanceof Error ? err.message : String(err)}`,
                                    );
                                  }
                                }
                              }}
                              data-ocid={`sports.archive_button.${i + 1}`}
                            >
                              <Archive size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// ACTIVITIES TAB
// ─────────────────────────────────────────
function ActivitiesTab({ studentId }: { studentId: string }) {
  const { sessionToken, canEditData, academicSession } = useStudentPage();
  const { data: activitiesAll, isLoading } = useActivityRecords(
    sessionToken,
    studentId,
  );
  const activities = academicSession
    ? (activitiesAll ?? []).filter((a) => a.session === academicSession)
    : activitiesAll;
  const saveMutation = useSaveActivityRecord(sessionToken, studentId);
  const updateMutation = useUpdateActivityRecord(sessionToken, studentId);
  const deleteMutation = useDeleteActivityRecord(sessionToken, studentId);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const emptyForm: ActivityRecord = {
    studentId,
    activityType: "Cultural",
    description: "",
    grade: "",
    remarks: "",
    session: "2025-26",
  };
  const [form, setForm] = useState<ActivityRecord>(emptyForm);

  // Only show co-curricular (not classTest/assignment)
  const coActivities = (activities ?? []).filter(
    (a) =>
      a.activityType !== "classTest" &&
      a.activityType !== "assignment" &&
      a.activityType !== "other",
  );

  const set = (f: keyof ActivityRecord, v: string) =>
    setForm((prev) => ({ ...prev, [f]: v }));

  const handleEdit = (a: ActivityRecord, globalIndex: number) => {
    setForm({ ...a });
    setEditingIndex(globalIndex);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.description.trim()) {
      toast.error("Description required");
      return;
    }
    try {
      if (editingIndex !== null) {
        await updateMutation.mutateAsync({
          index: editingIndex,
          updated: { ...form, studentId, session: form.session },
        });
        toast.success("Activity updated");
        setEditingIndex(null);
      } else {
        await saveMutation.mutateAsync(form);
        toast.success("Activity saved");
      }
      setForm(emptyForm);
    } catch (err) {
      toast.error(
        editingIndex !== null
          ? `Failed to update: ${err instanceof Error ? err.message : String(err)}`
          : "Failed to save",
      );
    }
  };

  if (isLoading)
    return (
      <Skeleton className="h-40 w-full" data-ocid="activities.loading_state" />
    );

  return (
    <div className="space-y-6" data-ocid="activities.section">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {editingIndex !== null
              ? "Edit Co-curricular Activity"
              : "Add Co-curricular Activity"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            <Field label="Activity Type">
              <Select
                value={form.activityType}
                onValueChange={(v) => set("activityType", v)}
              >
                <SelectTrigger data-ocid="activities.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Input
                data-ocid="activities.description.input"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label="Grade/Achievement">
              <Input
                data-ocid="activities.grade.input"
                value={form.grade}
                onChange={(e) => set("grade", e.target.value)}
                placeholder="1st / A / Gold"
              />
            </Field>
            <Field label="Session">
              <Input
                data-ocid="activities.session.input"
                value={form.session}
                onChange={(e) => set("session", e.target.value)}
              />
            </Field>
            <Field label="Remarks">
              <Input
                data-ocid="activities.remarks.input"
                value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)}
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || updateMutation.isPending}
              data-ocid={
                editingIndex !== null
                  ? "activities.update.submit_button"
                  : "activities.add.submit_button"
              }
            >
              {(saveMutation.isPending || updateMutation.isPending) && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              {editingIndex !== null ? (
                <>
                  <Save size={14} className="mr-2" /> Update Activity
                </>
              ) : (
                <>
                  <Plus size={14} className="mr-2" /> Add Activity
                </>
              )}
            </Button>
            {editingIndex !== null && (
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                data-ocid="activities.cancel.button"
              >
                <X size={14} className="mr-2" /> Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {coActivities.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Remarks</TableHead>
                    {canEditData && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coActivities.map((a, i) => {
                    const globalIndex = (activities ?? []).indexOf(a);
                    return (
                      <TableRow
                        key={`${a.activityType}-${a.description.slice(0, 20)}-${i}`}
                        data-ocid={`activities.item.${i + 1}`}
                      >
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{a.activityType}</Badge>
                        </TableCell>
                        <TableCell>{a.description}</TableCell>
                        <TableCell>{a.grade}</TableCell>
                        <TableCell>{a.session}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {a.remarks}
                        </TableCell>
                        {canEditData && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(a, globalIndex)}
                                data-ocid={`activities.edit_button.${i + 1}`}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-amber-600 hover:text-amber-700"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      "Archive this activity record?",
                                    )
                                  ) {
                                    try {
                                      await deleteMutation.mutateAsync(
                                        globalIndex,
                                      );
                                      toast.success("Activity archived");
                                    } catch (err) {
                                      toast.error(
                                        `Failed to archive: ${err instanceof Error ? err.message : String(err)}`,
                                      );
                                    }
                                  }
                                }}
                                data-ocid={`activities.archive_button.${i + 1}`}
                              >
                                <Archive size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// DAILY RECORDS TAB
// ─────────────────────────────────────────
function DailyRecordsTab({
  studentId,
  classLevel,
}: { studentId: string; classLevel: number }) {
  const { sessionToken, canEditData } = useStudentPage();
  const { data: activities, isLoading } = useActivityRecords(
    sessionToken,
    studentId,
  );
  const saveMutation = useSaveActivityRecord(sessionToken, studentId);
  const updateMutation = useUpdateActivityRecord(sessionToken, studentId);
  const deleteMutation = useDeleteActivityRecord(sessionToken, studentId);
  const subjects = getSubjectsForClass(classLevel);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const emptyForm = {
    type: "classTest",
    subject: subjects[0] || "English",
    date: new Date().toISOString().split("T")[0],
    marksObtained: "",
    totalMarks: "",
    remarks: "",
    session: "2025-26",
  };
  const [form, setForm] = useState(emptyForm);

  const dailyRecords = (activities ?? []).filter(
    (a) =>
      a.activityType === "classTest" ||
      a.activityType === "assignment" ||
      a.activityType === "other",
  );

  const setF = (f: string, v: string) =>
    setForm((prev) => ({ ...prev, [f]: v }));

  const handleEdit = (a: ActivityRecord, globalIndex: number) => {
    // Decode: description=date, grade=subject, remarks=obtained/total — extraRemarks
    const marksStr = a.remarks.split(" — ")[0];
    const [obtained, total] = marksStr.split("/");
    const extraRemarks = a.remarks.includes(" — ")
      ? a.remarks.split(" — ").slice(1).join(" — ")
      : "";
    setForm({
      type: a.activityType,
      subject: a.grade,
      date: a.description,
      marksObtained: obtained || "",
      totalMarks: total || "",
      remarks: extraRemarks,
      session: a.session,
    });
    setEditingIndex(globalIndex);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.marksObtained || !form.totalMarks) {
      toast.error("Enter marks obtained and total marks");
      return;
    }
    try {
      // Encode: description=date, grade=subject, remarks=obtained/total
      const activity: ActivityRecord = {
        studentId,
        activityType: form.type,
        description: form.date,
        grade: form.subject,
        remarks: `${form.marksObtained}/${form.totalMarks}${form.remarks ? ` — ${form.remarks}` : ""}`,
        session: form.session,
      };
      if (editingIndex !== null) {
        await updateMutation.mutateAsync({
          index: editingIndex,
          updated: activity,
        });
        toast.success("Record updated");
        setEditingIndex(null);
      } else {
        await saveMutation.mutateAsync(activity);
        toast.success("Record saved");
      }
      setForm((prev) => ({
        ...prev,
        marksObtained: "",
        totalMarks: "",
        remarks: "",
      }));
    } catch (err) {
      toast.error(
        editingIndex !== null
          ? `Failed to update: ${err instanceof Error ? err.message : String(err)}`
          : "Failed to save",
      );
    }
  };

  if (isLoading)
    return (
      <Skeleton
        className="h-40 w-full"
        data-ocid="daily_records.loading_state"
      />
    );

  return (
    <div className="space-y-6" data-ocid="daily_records.section">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {editingIndex !== null
              ? "Edit Daily Record"
              : "Add Daily Record (Class Test / Assignment)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            <Field label="Type">
              <Select value={form.type} onValueChange={(v) => setF("type", v)}>
                <SelectTrigger data-ocid="daily_records.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAILY_RECORD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "classTest"
                        ? "Class Test"
                        : t === "assignment"
                          ? "Assignment"
                          : "Other"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Subject">
              <Select
                value={form.subject}
                onValueChange={(v) => setF("subject", v)}
              >
                <SelectTrigger data-ocid="daily_records.subject.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Date">
              <Input
                data-ocid="daily_records.date.input"
                type="date"
                value={form.date}
                onChange={(e) => setF("date", e.target.value)}
              />
            </Field>
            <Field label="Marks Obtained">
              <Input
                data-ocid="daily_records.marks_obtained.input"
                type="number"
                value={form.marksObtained}
                onChange={(e) => setF("marksObtained", e.target.value)}
              />
            </Field>
            <Field label="Total Marks">
              <Input
                data-ocid="daily_records.total_marks.input"
                type="number"
                value={form.totalMarks}
                onChange={(e) => setF("totalMarks", e.target.value)}
              />
            </Field>
            <Field label="Session">
              <Input
                data-ocid="daily_records.session.input"
                value={form.session}
                onChange={(e) => setF("session", e.target.value)}
              />
            </Field>
            <Field label="Remarks" className="sm:col-span-3">
              <Input
                data-ocid="daily_records.remarks.input"
                value={form.remarks}
                onChange={(e) => setF("remarks", e.target.value)}
                placeholder="Optional notes"
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || updateMutation.isPending}
              data-ocid={
                editingIndex !== null
                  ? "daily_records.update.submit_button"
                  : "daily_records.add.submit_button"
              }
            >
              {(saveMutation.isPending || updateMutation.isPending) && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              {editingIndex !== null ? (
                <>
                  <Save size={14} className="mr-2" /> Update Record
                </>
              ) : (
                <>
                  <Plus size={14} className="mr-2" /> Add Record
                </>
              )}
            </Button>
            {editingIndex !== null && (
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                data-ocid="daily_records.cancel.button"
              >
                <X size={14} className="mr-2" /> Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {dailyRecords.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Remarks</TableHead>
                    {canEditData && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyRecords.map((a, i) => {
                    const marksStr = a.remarks.split(" — ")[0];
                    const [obtained, total] = marksStr.split("/").map(Number);
                    const pct =
                      total > 0 ? ((obtained / total) * 100).toFixed(0) : "—";
                    const extraRemarks = a.remarks.includes(" — ")
                      ? a.remarks.split(" — ").slice(1).join(" — ")
                      : "";
                    const globalIndex = (activities ?? []).indexOf(a);
                    return (
                      <TableRow
                        key={`${a.description}-${a.activityType}-${a.grade}-${i}`}
                        data-ocid={`daily_records.item.${i + 1}`}
                      >
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{a.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {a.activityType === "classTest"
                              ? "Class Test"
                              : a.activityType === "assignment"
                                ? "Assignment"
                                : "Other"}
                          </Badge>
                        </TableCell>
                        <TableCell>{a.grade}</TableCell>
                        <TableCell className="font-medium">
                          {marksStr}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              Number(pct) >= 50
                                ? "text-success font-semibold"
                                : "text-destructive font-semibold"
                            }
                          >
                            {pct}%
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {extraRemarks}
                        </TableCell>
                        {canEditData && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(a, globalIndex)}
                                data-ocid={`daily_records.edit_button.${i + 1}`}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-amber-600 hover:text-amber-700"
                                onClick={async () => {
                                  if (
                                    window.confirm("Archive this daily record?")
                                  ) {
                                    try {
                                      await deleteMutation.mutateAsync(
                                        globalIndex,
                                      );
                                      toast.success("Daily record archived");
                                    } catch (err) {
                                      toast.error(
                                        `Failed to archive: ${err instanceof Error ? err.message : String(err)}`,
                                      );
                                    }
                                  }
                                }}
                                data-ocid={`daily_records.archive_button.${i + 1}`}
                              >
                                <Archive size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {dailyRecords.length === 0 && (
        <div
          className="text-center py-8 text-muted-foreground"
          data-ocid="daily_records.empty_state"
        >
          No daily records yet. Add class test or assignment marks above.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// REPORT CARD TAB
// ─────────────────────────────────────────
const emptyReport = (studentId: string): ReportCard => ({
  session: "2025-26",
  studentId,
  term1Total: 0,
  term2Total: 0,
  finalPercentage: 0,
  grade: "",
  rank: "",
  sportsRemarks: "",
  attendanceSummary: "",
  behaviour: "",
  remarks: "",
});

function ReportCardTab({
  studentId,
  profile,
  sportsRecords,
}: {
  studentId: string;
  profile: StudentProfile;
  sportsRecords: SportsRecord[];
}) {
  const { sessionToken } = useStudentPage();
  const { data: cards, isLoading } = useReportCards(sessionToken, studentId);
  const { data: marksData } = useSubjectMarks(sessionToken, studentId);
  const { data: attendance } = useMonthlyAttendance(sessionToken, studentId);
  const { actor } = useActor();
  const saveMutation = useSaveReportCard(sessionToken, studentId);
  const printRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<ReportCard>(emptyReport(studentId));
  const [photoUrl, setPhotoUrl] = useState("");
  const [awards, setAwards] = useState("");
  const settings = getSchoolSettings();

  useEffect(() => {
    if (cards && cards.length > 0) setForm(cards[cards.length - 1]);
  }, [cards]);

  // Auto-calculate overall % from marks data
  useEffect(() => {
    if (!marksData || marksData.length === 0) return;
    const isLower = isLowerClass(Number(profile.classLevel));
    const pcts: number[] = [];
    for (const sm of marksData) {
      if (isLower && sm.__kind__ === "lowerClass") {
        pcts.push(Number(sm.lowerClass.percentage));
      } else if (!isLower && sm.__kind__ === "upperClass") {
        pcts.push(Number(sm.upperClass.finalPercentage));
      }
    }
    if (pcts.length > 0) {
      const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
      setForm((prev) => ({
        ...prev,
        finalPercentage: avg,
        grade: getGrade(avg),
      }));
    }
  }, [marksData, profile.classLevel]);

  useEffect(() => {
    if (!actor || !profile.studentId) return;
    actor
      .getStudyMaterial(`student-photo-${profile.studentId}`)
      .then((m) => {
        if (m) setPhotoUrl(m.blob.getDirectURL());
      })
      .catch(() => {});

    // logos are stored in settings via SettingsPage uploads
  }, [actor, profile.studentId]);

  const set = (field: keyof ReportCard, val: string | number) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({ ...form, studentId });
      toast.success("Report card saved");
    } catch {
      toast.error("Failed to save report card");
    }
  };

  const classLevel = Number(profile.classLevel);
  const lower = isLowerClass(classLevel);

  const totalPresent = (attendance ?? []).reduce(
    (s, a) => s + Number(a.present),
    0,
  );
  const totalDays = (attendance ?? []).reduce(
    (s, a) => s + Number(a.totalDays),
    0,
  );
  const attPct =
    totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : "0.0";

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const logoLeftHtml = settings.logoLeftUrl
      ? `<img src="${settings.logoLeftUrl}" style="width:60px;height:60px;object-fit:contain;" />`
      : `<div style="width:60px;height:60px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:9px;text-align:center;">Left Logo</div>`;
    const logoRightHtml = settings.logoRightUrl
      ? `<img src="${settings.logoRightUrl}" style="width:60px;height:60px;object-fit:contain;" />`
      : `<div style="width:60px;height:60px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:9px;text-align:center;">Right Logo</div>`;
    const photoHtml = photoUrl
      ? `<img src="${photoUrl}" style="width:70px;height:80px;object-fit:cover;border:1px solid #ccc;" />`
      : `<div style="width:70px;height:80px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:9px;text-align:center;">Photo</div>`;

    w.document.write(`<!DOCTYPE html>
<html><head><title>Report Card – ${profile.name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:15px;}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.header-center{text-align:center;flex:1;}
.school-name{font-size:15px;font-weight:bold;text-transform:uppercase;}
.school-sub{font-size:11px;margin-top:2px;}
.report-title{text-align:center;font-size:13px;font-weight:bold;margin:6px 0;border-top:2px solid #000;border-bottom:2px solid #000;padding:3px 0;}
.student-info{display:flex;gap:10px;margin-bottom:8px;}
.student-fields{flex:1;}
.info-table{width:100%;border-collapse:collapse;margin-bottom:6px;}
.info-table td{padding:2px 5px;border:1px solid #ccc;}
table{width:100%;border-collapse:collapse;margin-bottom:8px;}
td,th{border:1px solid #000;padding:3px 5px;}
th{background:#e8e8e8;font-weight:bold;text-align:center;}
.section-title{font-weight:bold;margin:8px 0 4px 0;font-size:12px;border-bottom:1px solid #000;padding-bottom:2px;}
.result-row{display:flex;gap:20px;margin:5px 0;font-size:12px;}
.signatures{margin-top:30px;display:flex;justify-content:space-between;}
.sig-line{border-top:1px solid #000;min-width:150px;text-align:center;padding-top:4px;font-size:11px;}
.footer-date{margin-top:10px;font-size:11px;}
</style></head><body>
<div class="header">
  ${logoLeftHtml}
  <div class="header-center">
    <div class="school-name">${settings.schoolName}</div>
    <div class="school-sub">Dist- ${settings.district}, ${settings.state}</div>
  </div>
  ${logoRightHtml}
</div>
<div class="report-title">Annual Report Card (${form.session})</div>

<div class="student-info">
  <div class="student-fields">
    <table class="info-table">
      <tr><td><strong>Name:</strong> ${profile.name}</td><td><strong>Admission No:</strong> ${profile.studentId}</td></tr>
      <tr><td><strong>Roll No:</strong> ${profile.rollNo}</td><td><strong>Class:</strong> ${toRoman(Number(profile.classLevel))}${profile.section ? ` \u2013 ${profile.section}` : ""}</td></tr>
      <tr><td><strong>Date of Birth:</strong> ${profile.dateOfBirth}</td><td><strong>Gender:</strong> ${profile.gender}</td></tr>
      <tr><td><strong>Father's Name:</strong> ${profile.fatherName}</td><td><strong>Mother's Name:</strong> ${profile.motherName}</td></tr>
      <tr><td colspan="2"><strong>Address:</strong> ${profile.address}</td></tr>
      <tr><td><strong>Contact:</strong> ${profile.contact}</td><td><strong>Session:</strong> ${form.session}</td></tr>
    </table>
  </div>
  <div>${photoHtml}</div>
</div>

<div class="section-title">Academic Performance</div>
${
  lower
    ? `
<table>
  <tr><th>Subject</th><th>WT1</th><th>WT2</th><th>WT3</th><th>WT4</th><th>CA1</th><th>CA2</th><th>CA3</th><th>CA4</th><th>Total /400</th><th>%</th><th>Grade</th></tr>
  ${(marksData ?? [])
    .filter((m) => m.__kind__ === "lowerClass")
    .map((m) => {
      const lm = m.lowerClass;
      return `<tr><td>${lm.subjectName}</td><td>${lm.writtenTest1}</td><td>${lm.writtenTest2}</td><td>${lm.writtenTest3}</td><td>${lm.writtenTest4}</td><td>${lm.comprehensiveTest1}</td><td>${lm.comprehensiveTest2}</td><td>${lm.comprehensiveTest3}</td><td>${lm.comprehensiveTest4}</td><td>${lm.totalMarks}</td><td>${Math.round(lm.percentage)}</td><td>${lm.grade}</td></tr>`;
    })
    .join("")}
</table>`
    : `
<table>
  <tr style='background:#dbeafe'><th>Subject</th><th>PT1/50</th><th>NB1/5</th><th>SE1/5</th><th>Term I/80</th><th style='background:#bfdbfe'>T1 Total</th><th style='background:#fed7aa'>PT2/50</th><th style='background:#fed7aa'>NB2/5</th><th style='background:#fed7aa'>SE2/5</th><th style='background:#fed7aa'>Term II/80</th><th style='background:#fdba74'>T2 Total</th><th>Final %</th><th>Grade</th></tr>
  ${(marksData ?? [])
    .filter((m) => m.__kind__ === "upperClass")
    .map((m) => {
      const um = m.upperClass;
      return `<tr><td>${um.subjectName}</td><td>${um.pt1}</td><td>${um.nb1}</td><td>${um.se1}</td><td>${um.term1Exam}</td><td style='background:#dbeafe;font-weight:bold'>${Math.round(um.term1Total)}</td><td style='background:#fff7ed'>${um.pt2}</td><td style='background:#fff7ed'>${um.nb2}</td><td style='background:#fff7ed'>${um.se2}</td><td style='background:#fff7ed'>${um.term2Exam}</td><td style='background:#fed7aa;font-weight:bold'>${Math.round(um.term2Total)}</td><td>${Math.round(um.finalPercentage)}</td><td>${um.grade}</td></tr>`;
    })
    .join("")}
</table>`
}

<div class="result-row">
  <span><strong>RESULT:</strong> ${form.finalPercentage >= 33 ? "PASS" : "FAIL"}</span>
  <span><strong>Overall %:</strong> ${Math.round(form.finalPercentage)}%</span>
  <span><strong>Grade:</strong> ${form.grade}</span>
  <span><strong>Rank:</strong> ${form.rank || "—"}</span>
</div>

<div class="section-title">Attendance</div>
<table>
  <tr><th>Working Days</th><th>Days Present</th><th>Percentage</th></tr>
  <tr><td style="text-align:center">${totalDays}</td><td style="text-align:center">${totalPresent}</td><td style="text-align:center">${attPct}%</td></tr>
</table>

<div class="section-title">Health Record</div>
<table>
  <tr><th></th><th>Height (cm)</th><th>Weight (kg)</th></tr>
  <tr><td>Re-opening</td><td>${profile.heightReopening || ""}</td><td>${profile.weightReopening || ""}</td></tr>
  <tr><td>Closure</td><td>${profile.heightClosure || ""}</td><td>${profile.weightClosure || ""}</td></tr>
</table>

${
  sportsRecords.length > 0
    ? `<div class="section-title">Awards, Prizes Won &amp; Areas of Excellence</div>
<table>
  <tr><th>Sl No</th><th>Game / Event</th><th>Level</th><th>Position</th></tr>
  ${sportsRecords.map((r, i) => `<tr><td>${i + 1}</td><td>${r.game} – ${r.event}</td><td>${r.level}</td><td>${r.position}</td></tr>`).join("")}
</table>`
    : ""
}

${awards ? `<div class="section-title">Remarks / Areas of Excellence</div><p style="padding:4px 0">${awards}</p>` : ""}

<div class="footer-date">Date: ${new Date().toLocaleDateString("en-IN")}</div>

<div class="signatures">
  <div class="sig-line">Class Teacher</div>
  <div class="sig-line">Principal${settings.principalName ? `\n${settings.principalName}` : ""}</div>
</div>

</body></html>`);
    w.document.close();
    w.print();
  };

  if (isLoading)
    return (
      <Skeleton className="h-40 w-full" data-ocid="report.loading_state" />
    );

  return (
    <div className="space-y-4" data-ocid="report.section">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Report Card Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Session">
              <Input
                data-ocid="report.session.input"
                value={form.session}
                onChange={(e) => set("session", e.target.value)}
              />
            </Field>
            <Field label="Final % (Overall)">
              <Input
                data-ocid="report.final_pct.input"
                type="number"
                value={form.finalPercentage}
                onChange={(e) => {
                  const fp = Number.parseFloat(e.target.value) || 0;
                  setForm((prev) => ({
                    ...prev,
                    finalPercentage: fp,
                    grade: getGrade(fp),
                  }));
                }}
              />
            </Field>
            <Field label="Grade (auto)">
              <Input value={form.grade} disabled />
            </Field>
            <Field label="Rank">
              <Input
                data-ocid="report.rank.input"
                value={form.rank}
                onChange={(e) => set("rank", e.target.value)}
                placeholder="1st, 5th…"
              />
            </Field>
            <Field label="Behaviour">
              <Input
                data-ocid="report.behaviour.input"
                value={form.behaviour}
                onChange={(e) => set("behaviour", e.target.value)}
              />
            </Field>
            <Field label="Sports Remarks">
              <Input
                data-ocid="report.sports_remarks.input"
                value={form.sportsRemarks}
                onChange={(e) => set("sportsRemarks", e.target.value)}
              />
            </Field>
            <Field
              label="Remarks / Areas of Excellence"
              className="sm:col-span-3"
            >
              <Textarea
                data-ocid="report.remarks.textarea"
                value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Awards Text (for print)" className="sm:col-span-3">
              <Textarea
                value={awards}
                onChange={(e) => setAwards(e.target.value)}
                rows={2}
                placeholder="e.g. Best Student Award, District Level Cricket Champion…"
              />
            </Field>
          </div>

          {/* Attendance summary */}
          <div className="mt-3 p-3 bg-muted rounded text-sm flex gap-6">
            <span>
              Present: <strong>{totalPresent}</strong>
            </span>
            <span>
              Working Days: <strong>{totalDays}</strong>
            </span>
            <span>
              Attendance %: <strong>{attPct}%</strong>
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              data-ocid="report.save.submit_button"
            >
              {saveMutation.isPending && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              <Save size={14} className="mr-2" /> Save Report Card
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              data-ocid="report.print.button"
            >
              <Printer size={14} className="mr-2" /> Print Report Card
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <div ref={printRef} style={{ display: "none" }} />
    </div>
  );
}

// ─────────────────────────────────────────
// HELPER: Field wrapper
// ─────────────────────────────────────────
function Field({
  label,
  children,
  className,
}: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
export default function StudentDetailPage({ nav, studentId }: Props) {
  const { session } = nav;
  const { data: profile, isLoading } = useStudentProfile(
    session.sessionToken,
    studentId,
  );
  const { data: sports } = useSportsRecords(session.sessionToken, studentId);
  const { data: allAttendance } = useMonthlyAttendance(
    session.sessionToken,
    studentId,
  );
  const { data: allSportsData } = useSportsRecords(
    session.sessionToken,
    studentId,
  );
  const { data: allActivitiesData } = useActivityRecords(
    session.sessionToken,
    studentId,
  );
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteSession, setPromoteSession] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [isFinalized, setIsFinalized] = useState(() => {
    const key = `finalized_${studentId}_${nav.academicSession ?? ""}`;
    return localStorage.getItem(key) === "true";
  });
  const _setIsFinalized = setIsFinalized;
  const { actor } = useActor();

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="student_detail.loading_state">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="student_detail.error_state"
      >
        <p>Student not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => nav.navigate("students")}
          data-ocid="student_detail.back.button"
        >
          <ArrowLeft size={14} className="mr-2" /> Back to Students
        </Button>
      </div>
    );
  }

  const classLevel = Number(profile.classLevel);
  const isAdmin = canEdit(session.role);
  const isAdminOrDev = session.role === "developer" || session.role === "admin";
  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

  const handlePromote = async () => {
    if (!actor) return;
    setPromoting(true);
    try {
      await actor.promoteStudentWithSession(
        session.sessionToken,
        studentId,
        BigInt(classLevel + 1),
        promoteSession,
      );
      toast.success(
        `Promoted to Class ${ROMAN[classLevel]} (${promoteSession})`,
      );
      setPromoteOpen(false);
    } catch (err: any) {
      toast.error(`Promotion failed: ${err?.message ?? err}`);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <StudentPageContext.Provider
      value={{
        sessionToken: session.sessionToken,
        canEditData: isAdmin,
        canEditProfile: isAdminOrDev,
        academicSession: nav.academicSession,
        isResultsFinalized: isFinalized,
        setResultsFinalized: _setIsFinalized,
      }}
    >
      <div data-ocid="student_detail.page">
        <div className="flex items-start gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => nav.navigate("students")}
            className="shrink-0 mt-0.5"
            data-ocid="student_detail.back.button"
          >
            <ArrowLeft size={15} className="mr-1" /> Back
          </Button>
          <div>
            <h1 className="font-display font-bold text-xl">{profile.name}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge variant="outline">
                Class {toRoman(Number(profile.classLevel))}
              </Badge>
              {profile.section && (
                <Badge variant="outline">Section {profile.section}</Badge>
              )}
              <Badge variant="secondary">Roll No. {profile.rollNo}</Badge>
              <span className="text-xs text-muted-foreground">
                Adm. No: {profile.studentId}
              </span>
              <span className="text-xs text-muted-foreground">
                Session: {profile.session}
              </span>
            </div>
            {isAdmin && classLevel < 8 && isFinalized && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                onClick={() => {
                  setPromoteSession(profile.session || "");
                  setPromoteOpen(true);
                }}
                data-ocid="student_detail.promote.button"
              >
                <TrendingUp size={14} className="mr-1" />
                Promote to Class {ROMAN[classLevel]}
              </Button>
            )}
            {isAdmin && classLevel < 8 && !isFinalized && (
              <p
                className="text-xs text-muted-foreground mt-1"
                data-ocid="student_detail.promote.hint"
              >
                Finalize results in Marks tab to enable promotion.
              </p>
            )}
          </div>
        </div>

        {/* Promote Dialog */}
        <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
          <DialogContent data-ocid="student_detail.promote.dialog">
            <DialogHeader>
              <DialogTitle>Promote Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm">
                <strong>{profile.name}</strong> — Class {ROMAN[classLevel - 1]}{" "}
                → Class {ROMAN[classLevel]}
              </p>
              <div className="space-y-1.5">
                <Label>New Session Year</Label>
                <Input
                  data-ocid="student_detail.promote_session.input"
                  value={promoteSession}
                  onChange={(e) => setPromoteSession(e.target.value)}
                  placeholder="e.g. 2026-27"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPromoteOpen(false)}
                data-ocid="student_detail.promote.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePromote}
                disabled={promoting || !promoteSession.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-ocid="student_detail.promote.confirm_button"
              >
                {promoting ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : null}
                Confirm Promotion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="profile">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-4 overflow-x-auto">
            <TabsTrigger
              value="profile"
              data-ocid="student_detail.profile.tab"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="marks"
              data-ocid="student_detail.marks.tab"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              Marks
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              data-ocid="student_detail.attendance.tab"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Attendance
            </TabsTrigger>
            <TabsTrigger
              value="sports"
              data-ocid="student_detail.sports.tab"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Sports
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              data-ocid="student_detail.activities.tab"
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="daily"
              data-ocid="student_detail.daily.tab"
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              Daily Records
            </TabsTrigger>
            <TabsTrigger
              value="report"
              data-ocid="student_detail.report.tab"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Report Card
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              data-ocid="student_detail.analytics.tab"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="session-history"
              data-ocid="student_detail.session_history.tab"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              Session History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab profile={profile} />
          </TabsContent>
          <TabsContent value="marks">
            <MarksTab studentId={studentId} classLevel={classLevel} />
          </TabsContent>
          <TabsContent value="attendance">
            <AttendanceTab studentId={studentId} />
          </TabsContent>
          <TabsContent value="sports">
            <SportsTab studentId={studentId} />
          </TabsContent>
          <TabsContent value="activities">
            <ActivitiesTab studentId={studentId} />
          </TabsContent>
          <TabsContent value="daily">
            <DailyRecordsTab studentId={studentId} classLevel={classLevel} />
          </TabsContent>
          <TabsContent value="report">
            <ReportCardTab
              studentId={studentId}
              profile={profile}
              sportsRecords={sports ?? []}
            />
          </TabsContent>
          <TabsContent value="analytics">
            <StudentAnalyticsTab
              studentId={studentId}
              classLevel={classLevel}
              sessionToken={session.sessionToken}
            />
          </TabsContent>
          <TabsContent value="session-history">
            <SessionHistoryTab
              studentId={studentId}
              sessionToken={session.sessionToken}
              allAttendance={allAttendance ?? []}
              allSports={allSportsData ?? []}
              allActivities={allActivitiesData ?? []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </StudentPageContext.Provider>
  );
}
