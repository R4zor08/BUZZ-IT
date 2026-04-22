/** Numeric enums in DB and API (JSON). */

export enum Category {
  General = 0,
  Work = 1,
  Personal = 2,
  Ideas = 3,
  Urgent = 4,
}

export enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
}

export const CATEGORY_VALUES = [0, 1, 2, 3, 4] as const;
export const PRIORITY_VALUES = [0, 1, 2] as const;
