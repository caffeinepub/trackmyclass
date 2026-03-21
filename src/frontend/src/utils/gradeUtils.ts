export function getGrade(percentage: number): string {
  if (percentage > 90) return "A1";
  if (percentage > 80) return "A2";
  if (percentage > 70) return "B1";
  if (percentage > 60) return "B2";
  if (percentage > 50) return "C1";
  if (percentage > 40) return "C2";
  if (percentage > 32) return "D";
  return "E";
}

// Classes 1-3: English, Hindi, Mathematics, EVS (lower class marks)
export const LOWER_CLASS_SUBJECTS = ["English", "Hindi", "Mathematics", "EVS"];
// Classes 4-5: English, Hindi, Mathematics, EVS (upper class exam pattern)
export const UPPER_45_SUBJECTS = ["English", "Hindi", "Mathematics", "EVS"];
// Classes 6-8: English, Hindi, Sanskrit, Mathematics, Science, Social Science
export const UPPER_68_SUBJECTS = [
  "English",
  "Hindi",
  "Sanskrit",
  "Mathematics",
  "Science",
  "Social Science",
];

export function getSubjectsForClass(classLevel: number): string[] {
  if (classLevel <= 3) return LOWER_CLASS_SUBJECTS;
  if (classLevel <= 5) return UPPER_45_SUBJECTS;
  return UPPER_68_SUBJECTS;
}

export function isLowerClass(classLevel: number): boolean {
  return classLevel <= 3;
}

export const MONTHS = [
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

export const LEVELS = ["School", "District", "State", "National"];
export const ACTIVITY_TYPES = [
  "Cultural",
  "Literary",
  "Science",
  "Art",
  "Other",
];
export const DAILY_RECORD_TYPES = ["classTest", "assignment", "other"];
