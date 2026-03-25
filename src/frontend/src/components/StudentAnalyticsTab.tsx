import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SubjectMarks } from "../backend.d";
import {
  useActivityRecords,
  useMonthlyAttendance,
  useSportsRecords,
  useSubjectMarks,
} from "../hooks/useQueries";
import { MONTHS, getSubjectsForClass, isLowerClass } from "../utils/gradeUtils";

interface Props {
  studentId: string;
  classLevel: number;
  sessionToken: string;
}

const MONTH_ABBR = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

function SubjectLineChart({
  subjectMarks,
  classLevel,
}: {
  subjectMarks: SubjectMarks;
  classLevel: number;
}) {
  if (isLowerClass(classLevel)) {
    if (subjectMarks.__kind__ !== "lowerClass") return null;
    const m = subjectMarks.lowerClass;
    const data = [
      {
        test: "1",
        WT: m.writtenTest1 || null,
        CA: m.comprehensiveTest1 || null,
      },
      {
        test: "2",
        WT: m.writtenTest2 || null,
        CA: m.comprehensiveTest2 || null,
      },
      {
        test: "3",
        WT: m.writtenTest3 || null,
        CA: m.comprehensiveTest3 || null,
      },
      {
        test: "4",
        WT: m.writtenTest4 || null,
        CA: m.comprehensiveTest4 || null,
      },
    ];
    const hasData = data.some((d) => d.WT !== null || d.CA !== null);
    return (
      <Card key={m.subjectName} className="mb-3">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-sm font-semibold">
            {m.subjectName}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Grade: {m.grade || "—"} |{" "}
              {m.percentage ? `${m.percentage.toFixed(1)}%` : "—"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          {!hasData ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No marks entered yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart
                data={data}
                margin={{ top: 4, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="test"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Test No.",
                    position: "insideBottom",
                    offset: -2,
                    fontSize: 10,
                  }}
                />
                <YAxis domain={[0, 50]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="WT"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="CA"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  }
  if (subjectMarks.__kind__ !== "upperClass") return null;
  const m = subjectMarks.upperClass;
  const data = [
    { label: "PT1", marks: m.pt1Weightage || null },
    { label: "PT2", marks: m.pt2Weightage || null },
    { label: "Term 1", marks: m.term1Exam || null },
    { label: "Term 2", marks: m.term2Exam || null },
  ];
  const hasData = data.some((d) => d.marks !== null);
  return (
    <Card key={m.subjectName} className="mb-3">
      <CardHeader className="pb-1 pt-3 px-4">
        <CardTitle className="text-sm font-semibold">
          {m.subjectName}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Grade: {m.grade || "—"} |{" "}
            {m.finalPercentage ? `${m.finalPercentage.toFixed(1)}%` : "—"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        {!hasData ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No marks entered yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={data}
              margin={{ top: 4, right: 16, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v, "Marks"]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="marks"
                name="Marks"
                stroke="#6366f1"
                strokeWidth={2}
                dot
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function StudentAnalyticsTab({
  studentId,
  classLevel,
  sessionToken,
}: Props) {
  const { data: marksData, isLoading: marksLoading } = useSubjectMarks(
    sessionToken,
    studentId,
  );
  const { data: attendanceData, isLoading: attLoading } = useMonthlyAttendance(
    sessionToken,
    studentId,
  );
  const { data: sportsData, isLoading: sportsLoading } = useSportsRecords(
    sessionToken,
    studentId,
  );
  const { data: activitiesData, isLoading: activitiesLoading } =
    useActivityRecords(sessionToken, studentId);

  // Build attendance chart data
  const attendanceChartData = MONTHS.map((month, i) => {
    const record = attendanceData?.find((a) => a.month === month);
    const total = record ? Number(record.totalDays) : 0;
    const present = record ? Number(record.present) : 0;
    const absent = total - present;
    return {
      month: MONTH_ABBR[i],
      Present: present || 0,
      Absent: absent > 0 ? absent : 0,
    };
  });

  const totalPresent =
    attendanceData?.reduce((s, r) => s + Number(r.present), 0) ?? 0;
  const totalDays =
    attendanceData?.reduce((s, r) => s + Number(r.totalDays), 0) ?? 0;
  const overallPct =
    totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : null;

  // Sports grouped summary
  const sportsGrouped: Record<
    string,
    { count: number; levels: Set<string>; positions: Set<string> }
  > = {};
  for (const r of sportsData ?? []) {
    if (!sportsGrouped[r.game])
      sportsGrouped[r.game] = {
        count: 0,
        levels: new Set(),
        positions: new Set(),
      };
    sportsGrouped[r.game].count++;
    if (r.level) sportsGrouped[r.game].levels.add(r.level);
    if (r.position) sportsGrouped[r.game].positions.add(r.position);
  }

  // Activities grouped summary
  const activitiesGrouped: Record<
    string,
    { count: number; grades: Set<string> }
  > = {};
  for (const r of activitiesData ?? []) {
    if (!activitiesGrouped[r.activityType])
      activitiesGrouped[r.activityType] = { count: 0, grades: new Set() };
    activitiesGrouped[r.activityType].count++;
    if (r.grade) activitiesGrouped[r.activityType].grades.add(r.grade);
  }

  const subjects = getSubjectsForClass(classLevel);
  const marksForSubjects = subjects.map((subj) =>
    marksData?.find((m) =>
      m.__kind__ === "lowerClass"
        ? m.lowerClass.subjectName === subj
        : m.upperClass.subjectName === subj,
    ),
  );

  return (
    <div className="space-y-8 pb-8" data-ocid="student_detail.analytics.panel">
      {/* WT / CA Trends */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
          {isLowerClass(classLevel)
            ? "WT & CA Trends"
            : "PT & Term Exam Trends"}
        </h2>
        {marksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map((s) => (
              <Skeleton key={s} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : !marksData || marksData.length === 0 ? (
          <Card>
            <CardContent
              className="py-8 text-center text-sm text-muted-foreground"
              data-ocid="student_detail.analytics.marks.empty_state"
            >
              No marks data yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {marksForSubjects.map((sm, i) =>
              sm ? (
                <SubjectLineChart
                  key={subjects[i]}
                  subjectMarks={sm}
                  classLevel={classLevel}
                />
              ) : (
                <Card key={subjects[i]} className="mb-3">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold">
                      {subjects[i]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground">
                      No marks entered yet
                    </p>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        )}
      </section>

      {/* Monthly Attendance */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          Monthly Attendance
        </h2>
        {overallPct && (
          <div className="flex gap-3 mb-3 flex-wrap">
            <Badge variant="outline" className="text-sm">
              Overall: {overallPct}%
            </Badge>
            <Badge variant="outline" className="text-sm">
              Total Present: {totalPresent} / {totalDays} days
            </Badge>
          </div>
        )}
        {attLoading ? (
          <Skeleton className="h-52 w-full rounded-lg" />
        ) : (
          <Card>
            <CardContent className="pt-4 px-2 pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={attendanceChartData}
                  margin={{ top: 4, right: 16, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Present" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Absent" fill="#f87171" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Sports Summary */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
          Sports Summary
        </h2>
        {sportsLoading ? (
          <Skeleton className="h-24 w-full rounded-lg" />
        ) : Object.keys(sportsGrouped).length === 0 ? (
          <Card>
            <CardContent
              className="py-6 text-center text-sm text-muted-foreground"
              data-ocid="student_detail.analytics.sports.empty_state"
            >
              No sports records found
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(sportsGrouped).map(([game, info]) => (
              <Card key={game}>
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-semibold">
                    {game}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Participations:{" "}
                    <span className="font-medium text-foreground">
                      {info.count}
                    </span>
                  </p>
                  {info.levels.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Levels:{" "}
                      <span className="font-medium text-foreground">
                        {[...info.levels].join(", ")}
                      </span>
                    </p>
                  )}
                  {info.positions.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Positions:{" "}
                      <span className="font-medium text-foreground">
                        {[...info.positions].join(", ")}
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Activities Summary */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-pink-500" />
          Activities Summary
        </h2>
        {activitiesLoading ? (
          <Skeleton className="h-24 w-full rounded-lg" />
        ) : Object.keys(activitiesGrouped).length === 0 ? (
          <Card>
            <CardContent
              className="py-6 text-center text-sm text-muted-foreground"
              data-ocid="student_detail.analytics.activities.empty_state"
            >
              No activity records found
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(activitiesGrouped).map(([type, info]) => (
              <Card key={type}>
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-sm font-semibold">
                    {type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Count:{" "}
                    <span className="font-medium text-foreground">
                      {info.count}
                    </span>
                  </p>
                  {info.grades.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Grades:{" "}
                      <span className="font-medium text-foreground">
                        {[...info.grades].join(", ")}
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
