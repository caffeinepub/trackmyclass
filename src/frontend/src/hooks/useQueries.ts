import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ActivityRecord,
  MonthlyAttendance,
  ReportCard,
  SportsRecord,
  StudentProfile,
  SubjectMarks,
} from "../backend.d";
import { useActor } from "./useActor";

export type {
  StudentProfile,
  SubjectMarks,
  MonthlyAttendance,
  SportsRecord,
  ActivityRecord,
  ReportCard,
};

export function useAllStudents(sessionToken: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StudentProfile[]>({
    queryKey: ["allStudents", sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) return [];
      const result =
        await actor.listAllStudentProfilesWithSession(sessionToken);
      return result as unknown as StudentProfile[];
    },
    enabled: !!actor && !isFetching && !!sessionToken,
  });
}

export function useArchivedStudents(sessionToken: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StudentProfile[]>({
    queryKey: ["archivedStudents", sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) return [];
      const result =
        await actor.listArchivedStudentProfilesWithSession(sessionToken);
      return result as unknown as StudentProfile[];
    },
    enabled: !!actor && !isFetching && !!sessionToken,
  });
}

export function useStudentProfile(sessionToken: string, studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StudentProfile | null>({
    queryKey: ["studentProfile", sessionToken, studentId],
    queryFn: async () => {
      if (!actor || !studentId || !sessionToken) return null;
      const result = await actor.getStudentProfileWithSession(
        sessionToken,
        studentId,
      );
      return result as unknown as StudentProfile;
    },
    enabled: !!actor && !isFetching && !!studentId && !!sessionToken,
  });
}

export function useAllStudentRecords(sessionToken: string, studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allRecords", sessionToken, studentId],
    queryFn: async () => {
      if (!actor || !studentId || !sessionToken) return null;
      return actor.getAllRecordsForStudentWithSession(sessionToken, studentId);
    },
    enabled: !!actor && !isFetching && !!studentId && !!sessionToken,
  });
}

export function useSubjectMarks(sessionToken: string, studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SubjectMarks[]>({
    queryKey: ["subjectMarks", sessionToken, studentId],
    queryFn: async () => {
      if (!actor || !studentId || !sessionToken) return [];
      return actor.getSubjectMarksWithSession(sessionToken, studentId);
    },
    enabled: !!actor && !isFetching && !!studentId && !!sessionToken,
  });
}

export function useMonthlyAttendance(sessionToken: string, studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MonthlyAttendance[]>({
    queryKey: ["attendance", sessionToken, studentId],
    queryFn: async () => {
      if (!actor || !studentId || !sessionToken) return [];
      return actor.getMonthlyAttendanceWithSession(sessionToken, studentId);
    },
    enabled: !!actor && !isFetching && !!studentId && !!sessionToken,
  });
}

export function useSportsRecords(sessionToken: string, studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SportsRecord[]>({
    queryKey: ["sports", sessionToken, studentId],
    queryFn: async () => {
      if (!actor || !studentId || !sessionToken) return [];
      return actor.getSportsRecordsWithSession(sessionToken, studentId);
    },
    enabled: !!actor && !isFetching && !!studentId && !!sessionToken,
  });
}

export function useActivityRecords(sessionToken: string, studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ActivityRecord[]>({
    queryKey: ["activities", sessionToken, studentId],
    queryFn: async () => {
      if (!actor || !studentId || !sessionToken) return [];
      return actor.getActivityRecordsWithSession(sessionToken, studentId);
    },
    enabled: !!actor && !isFetching && !!studentId && !!sessionToken,
  });
}

export function useReportCards(sessionToken: string, studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ReportCard[]>({
    queryKey: ["reportCards", sessionToken, studentId],
    queryFn: async () => {
      if (!actor || !studentId || !sessionToken) return [];
      return actor.getReportCardsWithSession(sessionToken, studentId);
    },
    enabled: !!actor && !isFetching && !!studentId && !!sessionToken,
  });
}

export function useSaveStudentProfile(sessionToken: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: StudentProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveStudentProfileWithSession(sessionToken, profile as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allStudents"] });
      qc.invalidateQueries({ queryKey: ["studentProfile"] });
    },
  });
}

export function useDeleteStudent(sessionToken: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteStudentProfileWithSession(sessionToken, studentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allStudents"] });
      qc.invalidateQueries({ queryKey: ["archivedStudents"] });
    },
  });
}

export function useArchiveStudent(sessionToken: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.archiveStudentProfileWithSession(sessionToken, studentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allStudents"] });
      qc.invalidateQueries({ queryKey: ["archivedStudents"] });
    },
  });
}

export function useRestoreStudent(sessionToken: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.restoreStudentProfileWithSession(sessionToken, studentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allStudents"] });
      qc.invalidateQueries({ queryKey: ["archivedStudents"] });
    },
  });
}

export function useSaveSubjectMarks(sessionToken: string, studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (marks: SubjectMarks[]) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveSubjectMarksWithSession(sessionToken, studentId, marks);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["subjectMarks", sessionToken, studentId],
      });
    },
  });
}

export function useSaveAttendance(sessionToken: string, studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (att: MonthlyAttendance) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveMonthlyAttendanceWithSession(
        sessionToken,
        studentId,
        att,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["attendance", sessionToken, studentId],
      });
    },
  });
}

export function useSaveSportsRecord(sessionToken: string, studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: SportsRecord) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveSportsRecordWithSession(sessionToken, studentId, record);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sports", sessionToken, studentId] });
    },
  });
}

export function useSaveActivityRecord(sessionToken: string, studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (activity: ActivityRecord) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveActivityRecordWithSession(
        sessionToken,
        studentId,
        activity,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["activities", sessionToken, studentId],
      });
    },
  });
}

export function useDeleteAttendance(sessionToken: string, studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      month,
      session,
    }: { month: string; session: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteAttendanceRecordWithSession(
        sessionToken,
        studentId,
        month,
        session,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["attendance", sessionToken, studentId],
      });
    },
  });
}

export function useDeleteSportsRecord(sessionToken: string, studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteSportsRecordWithSession(
        sessionToken,
        studentId,
        entryId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sports", sessionToken, studentId] });
    },
  });
}

export function useDeleteActivityRecord(
  sessionToken: string,
  studentId: string,
) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (index: number) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteActivityRecordWithSession(
        sessionToken,
        studentId,
        BigInt(index),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["activities", sessionToken, studentId],
      });
    },
  });
}

export function useUpdateSportsRecord(sessionToken: string, studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entryId,
      updated,
    }: { entryId: string; updated: SportsRecord }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateSportsRecordWithSession(
        sessionToken,
        studentId,
        entryId,
        updated,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sports", sessionToken, studentId] });
    },
  });
}

export function useUpdateActivityRecord(
  sessionToken: string,
  studentId: string,
) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      index,
      updated,
    }: { index: number; updated: ActivityRecord }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateActivityRecordWithSession(
        sessionToken,
        studentId,
        BigInt(index),
        updated,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["activities", sessionToken, studentId],
      });
    },
  });
}
export function useSaveReportCard(sessionToken: string, studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: ReportCard) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveReportCardWithSession(sessionToken, studentId, report);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["reportCards", sessionToken, studentId],
      });
    },
  });
}

export function useStudentSessionList(sessionToken: string, studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["studentSessionList", sessionToken, studentId],
    queryFn: async () => {
      if (!actor || !studentId || !sessionToken) return [];
      return (actor as any).getStudentSessionListWithSession(
        sessionToken,
        studentId,
      );
    },
    enabled: !!actor && !isFetching && !!studentId && !!sessionToken,
  });
}

export function useSubjectMarksForSession(
  sessionToken: string,
  studentId: string,
  sessionYear: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<SubjectMarks[]>({
    queryKey: ["subjectMarksForSession", sessionToken, studentId, sessionYear],
    queryFn: async () => {
      if (!actor || !studentId || !sessionToken || !sessionYear) return [];
      return (actor as any).getSubjectMarksForSessionWithSession(
        sessionToken,
        studentId,
        sessionYear,
      );
    },
    enabled:
      !!actor && !isFetching && !!studentId && !!sessionToken && !!sessionYear,
  });
}
