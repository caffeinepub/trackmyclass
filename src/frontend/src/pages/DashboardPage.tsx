import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Trophy, UserCheck, Users } from "lucide-react";
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
  const { data: students, isLoading } = useAllStudents();

  const totalStudents = students?.length ?? 0;

  const group1 = (students ?? []).filter(
    (s) => Number(s.classLevel) <= 3,
  ).length;
  const group2 = (students ?? []).filter(
    (s) => Number(s.classLevel) >= 4 && Number(s.classLevel) <= 5,
  ).length;
  const group3 = (students ?? []).filter(
    (s) => Number(s.classLevel) >= 6,
  ).length;

  const classData = [
    { label: "Class I-III", count: group1 },
    { label: "Class IV-V", count: group2 },
    { label: "Class VI-VIII", count: group3 },
  ];

  const perClassData = Array.from({ length: 8 }, (_, i) => ({
    name: `Class ${i + 1}`,
    students: (students ?? []).filter((s) => Number(s.classLevel) === i + 1)
      .length,
  }));

  const sessionCounts: Record<string, number> = {};
  for (const s of students ?? []) {
    sessionCounts[s.session] = (sessionCounts[s.session] ?? 0) + 1;
  }
  const currentSession =
    Object.entries(sessionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "2025-26";

  const genderData = [
    {
      name: "Male",
      value: (students ?? []).filter((s) => s.gender === "Male").length,
    },
    {
      name: "Female",
      value: (students ?? []).filter((s) => s.gender === "Female").length,
    },
    {
      name: "Other",
      value: (students ?? []).filter(
        (s) => s.gender !== "Male" && s.gender !== "Female",
      ).length,
    },
  ].filter((d) => d.value > 0);

  const GENDER_COLORS = [
    "oklch(0.48 0.08 200)",
    "oklch(0.72 0.14 350)",
    "oklch(0.72 0.19 145)",
  ];

  return (
    <div data-ocid="dashboard.page">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vivekananda Kendra Vidyalaya Raga — Academic Session {currentSession}
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card data-ocid="dashboard.total_students.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Users size={13} /> Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-display font-bold text-foreground">
                {totalStudents}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-ocid="dashboard.class13.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <GraduationCap size={13} /> Class I–III
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-3xl font-display font-bold text-primary">
                {group1}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-ocid="dashboard.class45.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <GraduationCap size={13} /> Class IV–V
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-3xl font-display font-bold text-primary">
                {group2}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-ocid="dashboard.class68.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Trophy size={13} /> Class VI–VIII
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-3xl font-display font-bold text-primary">
                {group3}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Students per Class */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Students per Class</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={perClassData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.88 0.01 215)"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="students"
                    fill="oklch(0.48 0.08 200)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Class Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : totalStudents === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No students yet
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={classData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label={({ percent }) =>
                        percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""
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
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1 mt-2">
                  {classData.map((d, i) => (
                    <div
                      key={d.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: CLASS_GROUP_COLORS[i] }}
                      />
                      <span className="text-muted-foreground">{d.label}:</span>
                      <span className="font-medium">{d.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gender + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : genderData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {genderData.map((gEntry, index) => (
                      <Cell
                        key={gEntry.name}
                        fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Nav */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              type="button"
              data-ocid="dashboard.students_13.button"
              onClick={() => nav.navigate("students")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
            >
              <span className="font-medium">Class I – III Students</span>
              <Badge variant="secondary">{group1}</Badge>
            </button>
            <button
              type="button"
              data-ocid="dashboard.students_45.button"
              onClick={() => nav.navigate("students")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
            >
              <span className="font-medium">Class IV – V Students</span>
              <Badge variant="secondary">{group2}</Badge>
            </button>
            <button
              type="button"
              data-ocid="dashboard.students_68.button"
              onClick={() => nav.navigate("students")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
            >
              <span className="font-medium">Class VI – VIII Students</span>
              <Badge variant="secondary">{group3}</Badge>
            </button>
            <button
              type="button"
              data-ocid="dashboard.attendance.button"
              onClick={() => nav.navigate("students")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
            >
              <span className="font-medium flex items-center gap-2">
                <UserCheck size={14} />
                View All Students
              </span>
              <Badge variant="outline">{totalStudents} total</Badge>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
