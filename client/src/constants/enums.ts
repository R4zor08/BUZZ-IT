export const CATEGORY_LABELS: Record<number, string> = {
  0: "General",
  1: "Work",
  2: "Personal",
  3: "Ideas",
  4: "Urgent",
};

export const PRIORITY_LABELS: Record<number, string> = {
  0: "Low",
  1: "Medium",
  2: "High",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));
