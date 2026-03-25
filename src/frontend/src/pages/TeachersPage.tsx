import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AppNav } from "../App";
import { ExternalBlob } from "../backend";
import { useActor } from "../hooks/useActor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeacherProfile {
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

interface TeacherMonthlyAttendance {
  teacherId: string;
  session: string;
  month: string;
  present: bigint;
  casualLeave: bigint;
  extraordinaryLeave: bigint;
  totalWorkingDays: bigint;
}

const MONTHS = [
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

const emptyProfile = (): TeacherProfile => ({
  teacherId: "",
  name: "",
  designation: "",
  subject: "",
  gender: "",
  dateOfBirth: "",
  joiningDate: "",
  contact: "",
  email: "",
  address: "",
  photoUrl: "",
});

// ─── Small components ─────────────────────────────────────────────────────────

function AttendanceInput({
  value,
  disabled,
  onChange,
  className = "",
}: {
  value: number;
  disabled: boolean;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value === 0 ? "" : value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-16 text-center rounded border px-1 py-0.5 text-sm focus:outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-muted disabled:cursor-not-allowed ${className}`}
    />
  );
}

function TeacherCard({
  teacher,
  index,
  photoUrl,
  canEdit,
  onEdit,
  onDelete,
}: {
  teacher: TeacherProfile;
  index: number;
  photoUrl: string;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const initials = teacher.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 ring-2 ring-teal-200">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt={teacher.name} />
            ) : null}
            <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-lg">
              {initials || index}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {teacher.name}
                </p>
                {teacher.designation && (
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    {teacher.designation}
                  </Badge>
                )}
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                    onClick={onEdit}
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:bg-red-50"
                    onClick={onDelete}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              {teacher.subject && (
                <div className="flex items-center gap-1">
                  <BookOpen size={11} />
                  <span>{teacher.subject}</span>
                </div>
              )}
              {teacher.contact && (
                <div className="flex items-center gap-1">
                  <Phone size={11} />
                  <span>{teacher.contact}</span>
                </div>
              )}
              {teacher.email && (
                <div className="flex items-center gap-1">
                  <Mail size={11} />
                  <span className="truncate">{teacher.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeachersPage({ nav }: { nav: AppNav }) {
  const { actor } = useActor();
  const sessionToken = nav.session.sessionToken;
  const role = nav.session.role;
  const academicSession = nav.academicSession ?? "2025-26";
  const canEdit = role === "developer" || role === "admin";
  // Only developer and admin can edit attendance
  const canEditAttendance = role === "developer" || role === "admin";

  const [profiles, setProfiles] = useState<TeacherProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  // teacherId -> photoUrl
  const [teacherPhotos, setTeacherPhotos] = useState<Record<string, string>>(
    {},
  );

  // attendance: month -> attendance record
  const [attendanceRows, setAttendanceRows] = useState<
    Record<string, TeacherMonthlyAttendance>
  >({});
  // month -> draft edits (while in edit mode)
  const [editingRows, setEditingRows] = useState<
    Record<string, TeacherMonthlyAttendance>
  >({});
  // which months are in edit mode
  const [editingMonths, setEditingMonths] = useState<Set<string>>(new Set());
  const [savingMonths, setSavingMonths] = useState<Set<string>>(new Set());
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Profile form modal
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherProfile>(emptyProfile());
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Photo upload for form
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Attendance
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  // Load all teacher profiles
  const loadProfiles = useCallback(async () => {
    if (!actor || !sessionToken) return;
    try {
      setLoadingProfiles(true);
      const result =
        await actor.listAllTeacherProfilesWithSession(sessionToken);
      const profs = result as unknown as TeacherProfile[];
      setProfiles(profs);
      // Load photos for all teachers
      const photos: Record<string, string> = {};
      await Promise.all(
        profs.map(async (t) => {
          try {
            const m = await actor.getStudyMaterial(
              `teacher-photo-${t.teacherId}`,
            );
            if (m?.[0])
              photos[t.teacherId] = (m?.[0] as any).blob.getDirectURL();
          } catch {}
        }),
      );
      setTeacherPhotos(photos);
    } catch (err) {
      toast.error(`Failed to load teachers: ${err}`);
    } finally {
      setLoadingProfiles(false);
    }
  }, [actor, sessionToken]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Load attendance when teacher changes
  useEffect(() => {
    if (!actor || !sessionToken || !selectedTeacherId) return;
    let cancelled = false;
    const load = async () => {
      setLoadingAttendance(true);
      setEditingMonths(new Set());
      setEditingRows({});
      try {
        const result = await actor.getTeacherAttendanceWithSession(
          sessionToken,
          selectedTeacherId,
          academicSession,
        );
        if (!cancelled) {
          const map: Record<string, TeacherMonthlyAttendance> = {};
          for (const r of result as unknown as TeacherMonthlyAttendance[]) {
            map[r.month] = r;
          }
          setAttendanceRows(map);
        }
      } catch (err) {
        toast.error(`Failed to load attendance: ${err}`);
      } finally {
        if (!cancelled) setLoadingAttendance(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [actor, sessionToken, selectedTeacherId, academicSession]);

  // ─── Profile helpers ──────────────────────────────────────────────────────

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyProfile());
    setFormPhotoUrl("");
    setShowForm(true);
  };

  const openEditForm = (t: TeacherProfile) => {
    setEditingId(t.teacherId);
    setForm({ ...t });
    setFormPhotoUrl(teacherPhotos[t.teacherId] ?? "");
    setShowForm(true);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!actor || (!editingId && !form.teacherId)) {
      // If adding a new teacher, we need an ID first - generate a temp one
      toast.error(
        "Please fill in the teacher name and save the profile first, then upload the photo.",
      );
      return;
    }
    const tid = editingId || form.teacherId;
    if (!tid) {
      toast.error(
        "Please enter teacher details and save first, then re-open to upload photo.",
      );
      return;
    }
    setUploadingPhoto(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      await actor.uploadStudyMaterial(
        `teacher-photo-${tid}`,
        `Photo of ${form.name}`,
        blob,
        "Teacher photo",
      );
      const material = await actor.getStudyMaterial(`teacher-photo-${tid}`);
      if (material?.[0]) {
        const url = (material?.[0] as any).blob.getDirectURL();
        setFormPhotoUrl(url);
        setTeacherPhotos((prev) => ({ ...prev, [tid]: url }));
        toast.success("Photo uploaded");
      }
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!actor || !sessionToken || !form.name.trim()) {
      toast.error("Teacher name is required.");
      return;
    }
    setSaving(true);
    try {
      const id = editingId || `t-${Date.now()}`;
      const profile: TeacherProfile = { ...form, teacherId: id };
      await actor.saveTeacherProfileWithSession(sessionToken, profile);
      toast.success(
        editingId ? "Teacher profile updated." : "Teacher added successfully.",
      );
      setShowForm(false);
      await loadProfiles();
    } catch (err) {
      toast.error(`Failed to save teacher: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!actor || !sessionToken) return;
    try {
      await actor.deleteTeacherProfileWithSession(sessionToken, id);
      if (selectedTeacherId === id) setSelectedTeacherId("");
      setDeleteConfirmId(null);
      toast.success("Teacher deleted.");
      await loadProfiles();
    } catch (err) {
      toast.error(`Failed to delete teacher: ${err}`);
    }
  };

  // ─── Attendance helpers ──────────────────────────────────────────────────

  const getRow = (month: string): TeacherMonthlyAttendance => {
    return (
      attendanceRows[month] ?? {
        teacherId: selectedTeacherId,
        session: academicSession,
        month,
        present: BigInt(0),
        casualLeave: BigInt(0),
        extraordinaryLeave: BigInt(0),
        totalWorkingDays: BigInt(0),
      }
    );
  };

  const getDraftRow = (month: string): TeacherMonthlyAttendance => {
    return editingRows[month] ?? getRow(month);
  };

  const startEdit = (month: string) => {
    setEditingRows((prev) => ({ ...prev, [month]: { ...getRow(month) } }));
    setEditingMonths((prev) => new Set(prev).add(month));
  };

  const handleDraftChange = (
    month: string,
    field:
      | "present"
      | "casualLeave"
      | "extraordinaryLeave"
      | "totalWorkingDays",
    value: string,
  ) => {
    const current = getDraftRow(month);
    const numVal = value === "" ? BigInt(0) : BigInt(Number(value));
    setEditingRows((prev) => ({
      ...prev,
      [month]: { ...current, [field]: numVal },
    }));
  };

  const handleSaveMonth = async (month: string) => {
    if (!actor || !sessionToken || !selectedTeacherId) return;
    const draft = getDraftRow(month);
    setSavingMonths((prev) => new Set(prev).add(month));
    try {
      await actor.saveTeacherAttendanceWithSession(sessionToken, draft);
      setAttendanceRows((prev) => ({ ...prev, [month]: draft }));
      setEditingMonths((prev) => {
        const next = new Set(prev);
        next.delete(month);
        return next;
      });
      toast.success(`${month} attendance saved.`);
    } catch (err) {
      toast.error(`Failed to save ${month}: ${err}`);
    } finally {
      setSavingMonths((prev) => {
        const next = new Set(prev);
        next.delete(month);
        return next;
      });
    }
  };

  // ─── Summary totals ──────────────────────────────────────────────────────

  const totals = MONTHS.reduce(
    (acc, month) => {
      const row = getRow(month);
      acc.present += Number(row.present);
      acc.casualLeave += Number(row.casualLeave);
      acc.extraordinaryLeave += Number(row.extraordinaryLeave);
      acc.totalWorkingDays += Number(row.totalWorkingDays);
      return acc;
    },
    { present: 0, casualLeave: 0, extraordinaryLeave: 0, totalWorkingDays: 0 },
  );

  const overallPercentage =
    totals.totalWorkingDays > 0
      ? ((totals.present / totals.totalWorkingDays) * 100).toFixed(1)
      : null;

  const selectedTeacher = profiles.find(
    (p) => p.teacherId === selectedTeacherId,
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" data-ocid="teachers.page">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
            <UserCog size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Teachers</h1>
            <p className="text-xs text-muted-foreground">
              Session: {academicSession}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button
            onClick={openAddForm}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            data-ocid="teachers.open_modal_button"
          >
            <Plus size={16} />
            Add Teacher
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profiles">
        <TabsList className="mb-4">
          <TabsTrigger
            value="profiles"
            className="data-[state=active]:bg-teal-600 data-[state=active]:text-white gap-2"
            data-ocid="teachers.profiles.tab"
          >
            <Users size={15} />
            Profiles
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2"
            data-ocid="teachers.attendance.tab"
          >
            <CalendarDays size={15} />
            Attendance
          </TabsTrigger>
        </TabsList>

        {/* ── Profiles tab ── */}
        <TabsContent value="profiles">
          {loadingProfiles ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3"
              data-ocid="teachers.empty_state"
            >
              <UserCog size={40} className="opacity-30" />
              <p className="text-sm">No teachers added yet.</p>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openAddForm}
                  data-ocid="teachers.add_button"
                >
                  <Plus size={14} className="mr-1" /> Add First Teacher
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((teacher, idx) => (
                <TeacherCard
                  key={teacher.teacherId}
                  teacher={teacher}
                  index={idx + 1}
                  photoUrl={teacherPhotos[teacher.teacherId] ?? ""}
                  canEdit={canEdit}
                  onEdit={() => openEditForm(teacher)}
                  onDelete={() => setDeleteConfirmId(teacher.teacherId)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Attendance tab ── */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" />
                Monthly Attendance — {academicSession}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teacher selector */}
              <div className="flex items-center gap-3 flex-wrap">
                <Label className="text-sm font-medium whitespace-nowrap">
                  Select Teacher:
                </Label>
                <Select
                  value={selectedTeacherId}
                  onValueChange={setSelectedTeacherId}
                >
                  <SelectTrigger
                    className="w-64"
                    data-ocid="teachers.attendance.select"
                  >
                    <SelectValue placeholder="— Choose a teacher —" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((t) => (
                      <SelectItem key={t.teacherId} value={t.teacherId}>
                        {t.name}
                        {t.designation ? ` (${t.designation})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTeacher && (
                  <Badge
                    variant="outline"
                    className="text-teal-700 border-teal-300"
                  >
                    {selectedTeacher.subject || "—"}
                  </Badge>
                )}
              </div>

              {!selectedTeacherId ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Select a teacher above to view and edit attendance.
                </p>
              ) : loadingAttendance ? (
                <div className="flex justify-center py-8">
                  <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Month</TableHead>
                        <TableHead className="text-center font-semibold text-yellow-700">
                          CL
                        </TableHead>
                        <TableHead className="text-center font-semibold text-orange-700">
                          EOL
                        </TableHead>
                        <TableHead className="text-center font-semibold text-green-700">
                          Present
                        </TableHead>
                        <TableHead className="text-center font-semibold text-blue-700">
                          Total Working Days
                        </TableHead>
                        <TableHead className="text-center font-semibold text-purple-700">
                          % (Month)
                        </TableHead>
                        {canEditAttendance && (
                          <TableHead className="text-center font-semibold">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MONTHS.map((month, idx) => {
                        const savedRow = getRow(month);
                        const isEditing = editingMonths.has(month);
                        const isSaving = savingMonths.has(month);
                        const displayRow = isEditing
                          ? getDraftRow(month)
                          : savedRow;

                        const present = Number(displayRow.present);
                        const twd = Number(displayRow.totalWorkingDays);
                        const pct =
                          twd > 0 ? ((present / twd) * 100).toFixed(1) : "";
                        const pctNum = twd > 0 ? (present / twd) * 100 : null;

                        return (
                          <TableRow
                            key={month}
                            className="hover:bg-muted/30"
                            data-ocid={`teachers.attendance.item.${idx + 1}`}
                          >
                            <TableCell className="font-medium text-sm py-2">
                              {month}
                            </TableCell>
                            {/* CL */}
                            <TableCell className="text-center py-2">
                              {isEditing ? (
                                <AttendanceInput
                                  value={Number(getDraftRow(month).casualLeave)}
                                  disabled={false}
                                  onChange={(v) =>
                                    handleDraftChange(month, "casualLeave", v)
                                  }
                                  className="border-yellow-300 focus:border-yellow-500"
                                />
                              ) : (
                                <span className="text-yellow-700 font-medium">
                                  {Number(savedRow.casualLeave) || ""}
                                </span>
                              )}
                            </TableCell>
                            {/* EOL */}
                            <TableCell className="text-center py-2">
                              {isEditing ? (
                                <AttendanceInput
                                  value={Number(
                                    getDraftRow(month).extraordinaryLeave,
                                  )}
                                  disabled={false}
                                  onChange={(v) =>
                                    handleDraftChange(
                                      month,
                                      "extraordinaryLeave",
                                      v,
                                    )
                                  }
                                  className="border-orange-300 focus:border-orange-500"
                                />
                              ) : (
                                <span className="text-orange-700 font-medium">
                                  {Number(savedRow.extraordinaryLeave) || ""}
                                </span>
                              )}
                            </TableCell>
                            {/* Present */}
                            <TableCell className="text-center py-2">
                              {isEditing ? (
                                <AttendanceInput
                                  value={Number(getDraftRow(month).present)}
                                  disabled={false}
                                  onChange={(v) =>
                                    handleDraftChange(month, "present", v)
                                  }
                                  className="border-green-300 focus:border-green-500"
                                />
                              ) : (
                                <span className="text-green-700 font-medium">
                                  {Number(savedRow.present) || ""}
                                </span>
                              )}
                            </TableCell>
                            {/* Total Working Days */}
                            <TableCell className="text-center py-2">
                              {isEditing ? (
                                <AttendanceInput
                                  value={Number(
                                    getDraftRow(month).totalWorkingDays,
                                  )}
                                  disabled={false}
                                  onChange={(v) =>
                                    handleDraftChange(
                                      month,
                                      "totalWorkingDays",
                                      v,
                                    )
                                  }
                                  className="border-blue-300 focus:border-blue-500"
                                />
                              ) : (
                                <span className="text-blue-700 font-medium">
                                  {Number(savedRow.totalWorkingDays) || ""}
                                </span>
                              )}
                            </TableCell>
                            {/* % */}
                            <TableCell className="text-center py-2">
                              {pct ? (
                                <span
                                  className={`font-semibold text-sm ${
                                    pctNum !== null && pctNum >= 90
                                      ? "text-green-600"
                                      : pctNum !== null && pctNum >= 75
                                        ? "text-blue-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {pct}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            {/* Actions */}
                            {canEditAttendance && (
                              <TableCell className="text-center py-2">
                                {isEditing ? (
                                  <Button
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                                    disabled={isSaving}
                                    onClick={() => handleSaveMonth(month)}
                                  >
                                    <Check size={12} />
                                    {isSaving ? "Saving..." : "Save"}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-3 text-xs text-blue-600 border-blue-300 hover:bg-blue-50 gap-1"
                                    onClick={() => startEdit(month)}
                                  >
                                    <Pencil size={12} />
                                    Edit
                                  </Button>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                      {/* Totals row */}
                      <TableRow className="bg-muted/60 font-semibold border-t-2">
                        <TableCell className="py-2">Total</TableCell>
                        <TableCell className="text-center py-2 text-yellow-700">
                          {totals.casualLeave || ""}
                        </TableCell>
                        <TableCell className="text-center py-2 text-orange-700">
                          {totals.extraordinaryLeave || ""}
                        </TableCell>
                        <TableCell className="text-center py-2 text-green-700">
                          {totals.present || ""}
                        </TableCell>
                        <TableCell className="text-center py-2 text-blue-700">
                          {totals.totalWorkingDays || ""}
                        </TableCell>
                        <TableCell className="text-center py-2">
                          {overallPercentage ? (
                            <span
                              className={`font-bold text-sm ${
                                Number(overallPercentage) >= 90
                                  ? "text-green-600"
                                  : Number(overallPercentage) >= 75
                                    ? "text-blue-600"
                                    : "text-red-600"
                              }`}
                            >
                              {overallPercentage}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        {canEditAttendance && <TableCell />}
                      </TableRow>
                    </TableBody>
                  </Table>

                  {/* Overall attendance summary */}
                  {overallPercentage && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/40 flex items-center gap-3">
                      <CalendarDays size={18} className="text-purple-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Overall Attendance Percentage
                        </p>
                        <p
                          className={`text-xl font-bold ${
                            Number(overallPercentage) >= 90
                              ? "text-green-600"
                              : Number(overallPercentage) >= 75
                                ? "text-blue-600"
                                : "text-red-600"
                          }`}
                        >
                          {overallPercentage}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {totals.present} present out of{" "}
                          {totals.totalWorkingDays} working days
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Add / Edit Teacher Modal ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="max-w-xl max-h-[90vh] overflow-y-auto"
          data-ocid="teachers.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog size={18} className="text-teal-600" />
              {editingId ? "Edit Teacher Profile" : "Add New Teacher"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Photo upload section */}
            <div className="sm:col-span-2 flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-teal-200">
                  {formPhotoUrl ? (
                    <AvatarImage src={formPhotoUrl} alt={form.name} />
                  ) : null}
                  <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-xl">
                    {form.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "T"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Teacher Photo</p>
                {editingId ? (
                  <>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-2 text-xs"
                      disabled={uploadingPhoto}
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Camera size={13} />
                      {uploadingPhoto
                        ? "Uploading..."
                        : formPhotoUrl
                          ? "Change Photo"
                          : "Upload Photo"}
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Save the profile first, then re-open to upload a photo.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Ramesh Kumar"
                data-ocid="teachers.name.input"
              />
            </div>

            <div className="space-y-1">
              <Label>Designation</Label>
              <Select
                value={form.designation}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, designation: v }))
                }
              >
                <SelectTrigger data-ocid="teachers.designation.select">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "PGT",
                    "TGT",
                    "PRT",
                    "Headmaster",
                    "Principal",
                    "Other",
                  ].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                placeholder="e.g. Mathematics"
                data-ocid="teachers.subject.input"
              />
            </div>

            <div className="space-y-1">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
              >
                <SelectTrigger data-ocid="teachers.gender.select">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateOfBirth: e.target.value }))
                }
                data-ocid="teachers.dob.input"
              />
            </div>

            <div className="space-y-1">
              <Label>Joining Date</Label>
              <Input
                type="date"
                value={form.joiningDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, joiningDate: e.target.value }))
                }
                data-ocid="teachers.joining.input"
              />
            </div>

            <div className="space-y-1">
              <Label>Contact (10 digits)</Label>
              <Input
                type="tel"
                maxLength={10}
                value={form.contact}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    contact: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="9876543210"
                data-ocid="teachers.contact.input"
              />
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="teacher@school.edu"
                data-ocid="teachers.email.input"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label>Address</Label>
              <Textarea
                rows={2}
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Village / Town, District, State"
                data-ocid="teachers.address.textarea"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              data-ocid="teachers.cancel.button"
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleSaveProfile}
              disabled={saving}
              data-ocid="teachers.save.button"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Profile"
                  : "Add Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent data-ocid="teachers.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Teacher?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the teacher profile and all their
            attendance records. This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmId && handleDeleteTeacher(deleteConfirmId)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
