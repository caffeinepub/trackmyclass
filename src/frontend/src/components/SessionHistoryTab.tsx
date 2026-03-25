import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ActivityRecord,
  MonthlyAttendance,
  SportsRecord,
  SubjectMarks,
} from "../hooks/useQueries";
import {
  useStudentSessionList,
  useSubjectMarksForSession,
} from "../hooks/useQueries";
import { getGrade } from "../utils/gradeUtils";

const MONTH_ORDER = [
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

function getSubjectInfo(m: SubjectMarks): { name: string; pct: number } {
  if (m.__kind__ === "upperClass" && m.upperClass) {
    return {
      name: m.upperClass.subjectName ?? "",
      pct: Number(m.upperClass.finalPercentage ?? 0),
    };
  }
  if (m.__kind__ === "lowerClass" && m.lowerClass) {
    const lc = m.lowerClass as any;
    return {
      name: lc.subjectName ?? "",
      pct: Number(lc.finalPercentage ?? 0),
    };
  }
  return { name: "", pct: 0 };
}

interface SessionYearPanelProps {
  sessionToken: string;
  studentId: string;
  sessionYear: string;
  allAttendance: MonthlyAttendance[];
  allSports: SportsRecord[];
  allActivities: ActivityRecord[];
}

function SessionYearPanel({
  sessionToken,
  studentId,
  sessionYear,
  allAttendance,
  allSports,
  allActivities,
}: SessionYearPanelProps) {
  const { data: marks, isLoading } = useSubjectMarksForSession(
    sessionToken,
    studentId,
    sessionYear,
  );

  const attendance = allAttendance.filter(
    (a: MonthlyAttendance) => (a as any).session === sessionYear,
  );
  const sports = allSports.filter(
    (s: SportsRecord) => s.session === sessionYear,
  );
  const activities = allActivities.filter(
    (a: ActivityRecord) => a.session === sessionYear,
  );

  const sortedAttendance = [...attendance].sort((a, b) => {
    const ai = MONTH_ORDER.indexOf(a.month);
    const bi = MONTH_ORDER.indexOf(b.month);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <div className="space-y-5 py-2">
      {/* Marks */}
      <div>
        <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
          Academic Marks
        </h4>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : !marks || marks.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No marks recorded.
          </p>
        ) : (
          <div className="rounded border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Final %</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks.map((m: SubjectMarks, idx: number) => {
                  const { name, pct } = getSubjectInfo(m);
                  return (
                    <TableRow key={`mark-${idx}-${name}`}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-right">
                        {pct > 0 ? `${pct.toFixed(1)}%` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{getGrade(pct)}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Attendance */}
      <div>
        <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
          Attendance
        </h4>
        {sortedAttendance.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No attendance recorded.
          </p>
        ) : (
          <div className="rounded border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAttendance.map((a) => {
                  const total = Number(a.totalDays ?? 0);
                  const present = Number(a.present ?? 0);
                  const pct =
                    total > 0 ? ((present / total) * 100).toFixed(1) : "—";
                  return (
                    <TableRow key={a.month}>
                      <TableCell>{a.month}</TableCell>
                      <TableCell className="text-right">{present}</TableCell>
                      <TableCell className="text-right">{total}</TableCell>
                      <TableCell className="text-right">
                        {pct !== "—" ? `${pct}%` : pct}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Sports */}
      <div>
        <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
          Sports
        </h4>
        {sports.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No sports records.
          </p>
        ) : (
          <div className="rounded border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sports.map((s: SportsRecord, i: number) => (
                  <TableRow key={`sport-${i}-${s.game}`}>
                    <TableCell>{s.game}</TableCell>
                    <TableCell>{s.level}</TableCell>
                    <TableCell>{s.position || s.remarks || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Activities */}
      <div>
        <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
          Activities
        </h4>
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No activity records.
          </p>
        ) : (
          <div className="rounded border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a: ActivityRecord, i: number) => (
                  <TableRow key={`activity-${i}-${a.activityType}`}>
                    <TableCell>{a.activityType}</TableCell>
                    <TableCell>{a.grade || "—"}</TableCell>
                    <TableCell>{a.remarks || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  studentId: string;
  sessionToken: string;
  allAttendance: MonthlyAttendance[];
  allSports: SportsRecord[];
  allActivities: ActivityRecord[];
}

export function SessionHistoryTab({
  studentId,
  sessionToken,
  allAttendance,
  allSports,
  allActivities,
}: Props) {
  const { data: sessions, isLoading } = useStudentSessionList(
    sessionToken,
    studentId,
  );

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="session_history.loading_state">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div
        className="py-12 text-center text-muted-foreground"
        data-ocid="session_history.empty_state"
      >
        <p className="text-base">No session history available yet.</p>
        <p className="text-sm mt-1">
          Session data will appear here after academic sessions are completed.
        </p>
      </div>
    );
  }

  const sorted = [...sessions].sort((a, b) => b.localeCompare(a));

  return (
    <div data-ocid="session_history.panel">
      <p className="text-sm text-muted-foreground mb-4">
        {sorted.length} session{sorted.length !== 1 ? "s" : ""} found
      </p>
      <Accordion type="multiple" className="space-y-2">
        {sorted.map((sessionYear) => (
          <AccordionItem
            key={sessionYear}
            value={sessionYear}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="font-semibold text-base hover:no-underline">
              <span className="flex items-center gap-3">
                Session {sessionYear}
                <Badge variant="secondary" className="text-xs font-normal">
                  {
                    allAttendance.filter(
                      (a: MonthlyAttendance) =>
                        (a as any).session === sessionYear,
                    ).length
                  }{" "}
                  months
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <SessionYearPanel
                sessionToken={sessionToken}
                studentId={studentId}
                sessionYear={sessionYear}
                allAttendance={allAttendance}
                allSports={allSports}
                allActivities={allActivities}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
