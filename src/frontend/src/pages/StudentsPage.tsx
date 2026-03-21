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
import { Loader2, Plus, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppNav } from "../App";
import type { StudentProfile } from "../backend.d";
import { useAllStudents, useSaveStudentProfile } from "../hooks/useQueries";

interface Props {
  nav: AppNav;
}

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
  const { data: students, isLoading } = useAllStudents();
  const saveMutation = useSaveStudentProfile();

  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<StudentProfile>({ ...EMPTY_PROFILE });

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="students.add_student.open_modal_button"
              onClick={() => setForm({ ...EMPTY_PROFILE })}
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
                />
              </div>
              <div className="space-y-1.5">
                <Label>Student ID *</Label>
                <Input
                  data-ocid="students.student_id.input"
                  value={form.studentId}
                  onChange={(e) => set("studentId", e.target.value)}
                  placeholder="e.g. 868"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Full Name *</Label>
                <Input
                  data-ocid="students.name.input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Student full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select
                  value={String(form.classLevel)}
                  onValueChange={(v) => set("classLevel", BigInt(v))}
                >
                  <SelectTrigger data-ocid="students.class.select">
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
                />
              </div>
              <div className="space-y-1.5">
                <Label>Roll No</Label>
                <Input
                  data-ocid="students.rollno.input"
                  value={form.rollNo}
                  onChange={(e) => set("rollNo", e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => set("gender", v)}
                >
                  <SelectTrigger data-ocid="students.gender.select">
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
                />
              </div>
              <div className="space-y-1.5">
                <Label>Religion</Label>
                <Input
                  data-ocid="students.religion.input"
                  value={form.religion}
                  onChange={(e) => set("religion", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tribe</Label>
                <Input
                  data-ocid="students.tribe.input"
                  value={form.tribe}
                  onChange={(e) => set("tribe", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Father's Name</Label>
                <Input
                  data-ocid="students.father_name.input"
                  value={form.fatherName}
                  onChange={(e) => set("fatherName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mother's Name</Label>
                <Input
                  data-ocid="students.mother_name.input"
                  value={form.motherName}
                  onChange={(e) => set("motherName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Contact No.</Label>
                <Input
                  data-ocid="students.contact.input"
                  value={form.contact}
                  onChange={(e) => set("contact", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Address</Label>
                <Input
                  data-ocid="students.address.input"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>PEN</Label>
                <Input
                  data-ocid="students.pen.input"
                  value={form.pen}
                  onChange={(e) => set("pen", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Aadhar No.</Label>
                <Input
                  data-ocid="students.aadhar.input"
                  value={form.aadhar}
                  onChange={(e) => set("aadhar", e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
                data-ocid="students.add_student.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
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
            className="pl-9"
            placeholder="Search by name, ID, or roll no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger
            className="w-36"
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

      {/* Table */}
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
                No students found. Add your first student above.
              </p>
            </div>
          ) : (
            <Table data-ocid="students.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, idx) => (
                  <TableRow
                    key={s.studentId}
                    data-ocid={`students.item.${idx + 1}`}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      nav.navigate("student-detail", { studentId: s.studentId })
                    }
                  >
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.studentId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        Class {String(s.classLevel)}
                      </Badge>
                    </TableCell>
                    <TableCell>{s.section}</TableCell>
                    <TableCell>{s.rollNo}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.session}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
