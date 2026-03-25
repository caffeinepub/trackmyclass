import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AppNav } from "../App";
import { useAllStudents } from "../hooks/useQueries";

interface Props {
  nav: AppNav;
}

const CLASS_GROUP_COLORS = [
  "oklch(0.48 0.08 200)",
  "oklch(0.60 0.12 160)",
  "oklch(0.68 0.14 55)",
];

const SESSION_OPTIONS = [
  "2022-23",
  "2023-24",
  "2024-25",
  "2025-26",
  "2026-27",
  "2027-28",
  "2028-29",
];

export default function DashboardPage({ nav }: Props) {
  const { data: allStudents, isLoading } = useAllStudents(
    nav.session.sessionToken,
  );

  const selectedSession = nav.academicSession;

  // Filter students by selected session
  const students = selectedSession
    ? (allStudents ?? []).filter((s) => s.session === selectedSession)
    : [];

  const totalStudents = students.length;

  const group1 = students.filter((s) => Number(s.classLevel) <= 3).length;
  const group2 = students.filter(
    (s) => Number(s.classLevel) >= 4 && Number(s.classLevel) <= 5,
  ).length;
  const group3 = students.filter((s) => Number(s.classLevel) >= 6).length;

  const classData = [
    { label: "Class I-III", count: group1 },
    { label: "Class IV-V", count: group2 },
    { label: "Class VI-VIII", count: group3 },
  ];

  const perClassData = Array.from({ length: 8 }, (_, i) => ({
    name: `Class ${i + 1}`,
    students: students.filter((s) => Number(s.classLevel) === i + 1).length,
  }));

  const genderData = [
    {
      name: "Male",
      value: students.filter((s) => s.gender === "Male").length,
    },
    {
      name: "Female",
      value: students.filter((s) => s.gender === "Female").length,
    },
    {
      name: "Other",
      value: students.filter(
        (s) => s.gender !== "Male" && s.gender !== "Female",
      ).length,
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      {/* Session Selector — primary navigation control */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <CalendarDays size={18} className="text-primary" />
              <span className="font-semibold text-sm">Academic Session</span>
            </div>
            <Select
              value={selectedSession ?? ""}
              onValueChange={(v) => nav.setAcademicSession(v)}
            >
              <SelectTrigger
                className="w-full sm:w-48 h-10 border-primary/40 bg-background"
                data-ocid="dashboard.session.select"
              >
                <SelectValue placeholder="Select session…" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSession && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                <BookOpen size={11} className="mr-1" />
                Viewing {selectedSession}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* No session selected — prompt */}
      {!selectedSession ? (
        <div
          className="flex flex-col items-center justify-center gap-4 py-16 text-center"
          data-ocid="dashboard.no_session.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarDays size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg mb-1">
              Select an Academic Session
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Choose a session from the dropdown above to view student data,
              statistics, and charts for that year.
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="space-y-6" data-ocid="dashboard.loading_state">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <>
          <div>
            <h1 className="font-display font-bold text-2xl">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {nav.session.displayName} — {selectedSession} at
              VIVEKANANDA KENDRA VIDYALAYA RAGA
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Students
                  </span>
                </div>
                <p className="font-display font-bold text-2xl">
                  {totalStudents}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={16} className="text-chart-1" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Class I–III
                  </span>
                </div>
                <p className="font-display font-bold text-2xl">{group1}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} className="text-chart-3" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Class IV–V
                  </span>
                </div>
                <p className="font-display font-bold text-2xl">{group2}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck size={16} className="text-chart-2" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Class VI–VIII
                  </span>
                </div>
                <p className="font-display font-bold text-2xl">{group3}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Students per Class</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={perClassData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => v.replace("Class ", "C")}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar
                      dataKey="students"
                      fill="oklch(0.48 0.08 200)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Class Group Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={classData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ label, percent }) =>
                        `${label} (${Math.round((percent ?? 0) * 100)}%)`
                      }
                      labelLine={false}
                    >
                      {classData.map((entry, index) => (
                        <Cell
                          key={entry.label}
                          fill={
                            CLASS_GROUP_COLORS[
                              index % CLASS_GROUP_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2">
                  {classData.map((d, i) => (
                    <div key={d.label} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: CLASS_GROUP_COLORS[i] }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {d.label}: {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gender breakdown */}
          {genderData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {genderData.map((d) => (
                  <Badge
                    key={d.name}
                    variant="secondary"
                    className="text-sm px-3 py-1"
                  >
                    {d.name}: {d.value}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
