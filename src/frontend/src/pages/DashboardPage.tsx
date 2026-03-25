import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="dashboard.loading_state">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-display font-bold text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome, {nav.session.displayName} — VIVEKANANDA KENDRA VIDYALAYA
            RAGA
          </p>
        </div>
        {selectedSession && (
          <Badge
            variant="secondary"
            className="self-start sm:self-auto text-sm px-3 py-1.5 gap-1.5 bg-primary/10 text-primary border border-primary/20"
          >
            <CalendarDays size={13} />
            Academic Session: {selectedSession}
          </Badge>
        )}
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
            <p className="font-display font-bold text-2xl">{totalStudents}</p>
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
            <CardTitle className="text-sm">Class Group Distribution</CardTitle>
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
                        CLASS_GROUP_COLORS[index % CLASS_GROUP_COLORS.length]
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
    </div>
  );
}
