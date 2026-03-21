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

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<StudentProfile[]>({
    queryKey: ["allStudents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllStudentProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudentProfile(studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StudentProfile | null>({
    queryKey: ["studentProfile", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return null;
      return actor.getStudentProfile(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useAllStudentRecords(studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allRecords", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return null;
      return actor.getAllRecordsForStudent(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useSubjectMarks(studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SubjectMarks[]>({
    queryKey: ["subjectMarks", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getSubjectMarks(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useMonthlyAttendance(studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MonthlyAttendance[]>({
    queryKey: ["attendance", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getMonthlyAttendance(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useSportsRecords(studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SportsRecord[]>({
    queryKey: ["sports", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getSportsRecords(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useActivityRecords(studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ActivityRecord[]>({
    queryKey: ["activities", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getActivityRecords(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useReportCards(studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ReportCard[]>({
    queryKey: ["reportCards", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getReportCards(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useSaveStudentProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: StudentProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveStudentProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allStudents"] });
      qc.invalidateQueries({ queryKey: ["studentProfile"] });
    },
  });
}

export function useSaveSubjectMarks(studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (marks: SubjectMarks[]) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveSubjectMarks(studentId, marks);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjectMarks", studentId] });
    },
  });
}

export function useSaveAttendance(studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (att: MonthlyAttendance) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveMonthlyAttendance(studentId, att);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance", studentId] });
    },
  });
}

export function useSaveSportsRecord(studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: SportsRecord) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveSportsRecord(studentId, record);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sports", studentId] });
    },
  });
}

export function useSaveActivityRecord(studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (activity: ActivityRecord) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveActivityRecord(studentId, activity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities", studentId] });
    },
  });
}

export function useSaveReportCard(studentId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: ReportCard) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveReportCard(studentId, report);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reportCards", studentId] });
    },
  });
}
