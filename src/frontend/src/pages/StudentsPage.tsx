import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Loader2, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppNav } from "../App";
import type { StudentProfile } from "../backend.d";
import { canEdit } from "../hooks/useAuth";
import {
  useAllStudents,
  useDeleteStudent,
  useSaveStudentProfile,
} from "../hooks/useQueries";

interface Props {
  nav: AppNav;
}

const ROMAN: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
};

const EMPTY_PROFILE: StudentProfile = {
  studentId: "",
  session: "2025-26",
  name: "",
  classLevel: BigInt(1),
  section: "",
  rollNo: "",
  gender: "Male",
  dateOfBirth: "",
  tribe: "",
  motherName: "",
  fatherName: "",
  contact: "",
  address: "",
  pen: "",
  aadhar: "",
  religion: "",
  heightReopening: 0,
  weightReopening: 0,
  heightClosure: 0,
  weightClosure: 0,
};

export default function StudentsPage({ nav }: Props) {
  const { session } = nav;
  const { data: students, isLoading } = useAllStudents(session.sessionToken);
  const saveMutation = useSaveStudentProfile(session.sessionToken);
  const deleteMutation = useDeleteStudent(session.sessionToken);
  const canAdd = canEdit(session.role);
  const canDelete = session.role === "developer" || session.role === "admin";

  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<StudentProfile>({ ...EMPTY_PROFILE });
  const [deleteTarget, setDeleteTarget] = useState<StudentProfile | null>(null);

  const filtered = (students ?? []).filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase());
    const matchClass =
      filterClass === "all" || String(s.classLevel) === filterClass;
    return matchSearch && matchClass;
  });

  const handleSave = async () => {
    if (!form.studentId.trim() || !form.name.trim()) {
      toast.error("Student ID and Name are required");
      return;
    }
    try {
      await saveMutation.mutateAsync(form);
      toast.success("Student saved successfully");
      setDialogOpen(false);
      setForm({ ...EMPTY_PROFILE });
    } catch {
      toast.error("Failed to save student");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.studentId);
      toast.success(`${deleteTarget.name} has been deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete student");
    }
  };

  const set = (
    field: keyof StudentProfile,
    value: string | number | bigint,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div data-ocid="students.page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Students</h1>
          <p className="text-sm text-muted-foreground">
            Manage student profiles for all classes
          </p>
        </div>
        {canAdd && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="students.add_student.open_modal_button"
                onClick={() => setForm({ ...EMPTY_PROFILE })}
                className="h-11"
              >
                <UserPlus size={16} className="mr-2" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl max-h-[90vh] overflow-y-auto"
              data-ocid="students.add_student.dialog"
            >
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Session</Label>
                  <Input
                    data-ocid="students.session.input"
                    value={form.session}
                    onChange={(e) => set("session", e.target.value)}
                    placeholder="2025-26"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Student ID *</Label>
                  <Input
                    data-ocid="students.student_id.input"
                    value={form.studentId}
                    onChange={(e) => set("studentId", e.target.value)}
                    placeholder="e.g. 868"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Full Name *</Label>
                  <Input
                    data-ocid="students.name.input"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Student full name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select
                    value={String(form.classLevel)}
                    onValueChange={(v) => set("classLevel", BigInt(v))}
                  >
                    <SelectTrigger
                      data-ocid="students.class.select"
                      className="h-11"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                        <SelectItem key={c} value={String(c)}>
                          Class {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Section</Label>
                  <Input
                    data-ocid="students.section.input"
                    value={form.section}
                    onChange={(e) => set("section", e.target.value)}
                    placeholder="A / B"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Roll No</Label>
                  <Input
                    data-ocid="students.rollno.input"
                    value={form.rollNo}
                    onChange={(e) => set("rollNo", e.target.value)}
                    placeholder="1"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => set("gender", v)}
                  >
                    <SelectTrigger
                      data-ocid="students.gender.select"
                      className="h-11"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input
                    data-ocid="students.dob.input"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Religion</Label>
                  <Input
                    data-ocid="students.religion.input"
                    value={form.religion}
                    onChange={(e) => set("religion", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tribe</Label>
                  <Input
                    data-ocid="students.tribe.input"
                    value={form.tribe}
                    onChange={(e) => set("tribe", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Father&apos;s Name</Label>
                  <Input
                    data-ocid="students.father_name.input"
                    value={form.fatherName}
                    onChange={(e) => set("fatherName", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Mother&apos;s Name</Label>
                  <Input
                    data-ocid="students.mother_name.input"
                    value={form.motherName}
                    onChange={(e) => set("motherName", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact No.</Label>
                  <Input
                    data-ocid="students.contact.input"
                    value={form.contact}
                    onChange={(e) =>
                      set(
                        "contact",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    maxLength={10}
                    inputMode="numeric"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address</Label>
                  <Input
                    data-ocid="students.address.input"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>PEN</Label>
                  <Input
                    data-ocid="students.pen.input"
                    value={form.pen}
                    onChange={(e) =>
                      set("pen", e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    maxLength={11}
                    inputMode="numeric"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Aadhar No.</Label>
                  <Input
                    data-ocid="students.aadhar.input"
                    value={form.aadhar}
                    onChange={(e) =>
                      set(
                        "aadhar",
                        e.target.value.replace(/\D/g, "").slice(0, 12),
                      )
                    }
                    maxLength={12}
                    inputMode="numeric"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setDialogOpen(false)}
                  data-ocid="students.add_student.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-11"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  data-ocid="students.add_student.submit_button"
                >
                  {saveMutation.isPending && (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  )}
                  Save Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            data-ocid="students.search.input"
            className="pl-9 h-11 w-full"
            placeholder="Search by name, ID, or roll no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger
            className="w-full sm:w-36 h-11"
            data-ocid="students.filter_class.select"
          >
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
              <SelectItem key={c} value={String(c)}>
                Class {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {filtered.length} student{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2" data-ocid="students.loading_state">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-12 text-center"
              data-ocid="students.empty_state"
            >
              <Plus size={32} className="text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                No students found.
                {canAdd ? " Add your first student above." : ""}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden divide-y divide-border">
                {filtered.map((s, idx) => (
                  <div
                    key={s.studentId}
                    data-ocid={`students.item.${idx + 1}`}
                    className="flex items-center gap-2 px-4 py-3"
                  >
                    <button
                      type="button"
                      className="flex-1 text-left hover:bg-muted/50 transition-colors rounded"
                      onClick={() =>
                        nav.navigate("student-detail", {
                          studentId: s.studentId,
                        })
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {s.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Adm. No: {s.studentId}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            Class{" "}
                            {ROMAN[Number(s.classLevel)] ??
                              String(s.classLevel)}
                          </Badge>
                          {s.section && (
                            <span className="text-xs text-muted-foreground">
                              Sec {s.section}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Roll: {s.rollNo}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {s.session}
                        </span>
                      </div>
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        data-ocid={`students.delete_button.${idx + 1}`}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors shrink-0"
                        onClick={() => setDeleteTarget(s)}
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block">
                <Table data-ocid="students.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Session</TableHead>
                      {canDelete && <TableHead className="w-12" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s, idx) => (
                      <TableRow
                        key={s.studentId}
                        data-ocid={`students.item.${idx + 1}`}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell
                          className="font-medium"
                          onClick={() =>
                            nav.navigate("student-detail", {
                              studentId: s.studentId,
                            })
                          }
                        >
                          {s.name}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground text-sm"
                          onClick={() =>
                            nav.navigate("student-detail", {
                              studentId: s.studentId,
                            })
                          }
                        >
                          {s.studentId}
                        </TableCell>
                        <TableCell
                          onClick={() =>
                            nav.navigate("student-detail", {
                              studentId: s.studentId,
                            })
                          }
                        >
                          <Badge variant="outline">
                            Class {String(s.classLevel)}
                          </Badge>
                        </TableCell>
                        <TableCell
                          onClick={() =>
                            nav.navigate("student-detail", {
                              studentId: s.studentId,
                            })
                          }
                        >
                          {s.section}
                        </TableCell>
                        <TableCell
                          onClick={() =>
                            nav.navigate("student-detail", {
                              studentId: s.studentId,
                            })
                          }
                        >
                          {s.rollNo}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground text-sm"
                          onClick={() =>
                            nav.navigate("student-detail", {
                              studentId: s.studentId,
                            })
                          }
                        >
                          {s.session}
                        </TableCell>
                        {canDelete && (
                          <TableCell>
                            <button
                              type="button"
                              data-ocid={`students.delete_button.${idx + 1}`}
                              className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(s);
                              }}
                              aria-label={`Delete ${s.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="students.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="students.delete.cancel_button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="students.delete.confirm_button"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
