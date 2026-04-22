import { z } from "zod";
import { CATEGORY_VALUES, PRIORITY_VALUES } from "../constants/enums.js";

const categorySchema = z.coerce.number().refine((n): n is (typeof CATEGORY_VALUES)[number] =>
  (CATEGORY_VALUES as readonly number[]).includes(n)
);

const prioritySchema = z.coerce.number().refine((n): n is (typeof PRIORITY_VALUES)[number] =>
  (PRIORITY_VALUES as readonly number[]).includes(n)
);

export const createReminderBodySchema = z.object({
  title: z.string().min(1).max(100),
  time: z.coerce.date(),
  description: z.string().max(2000).default(""),
  category: categorySchema,
  priority: prioritySchema,
  dueDate: z.coerce.date().optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.coerce.date().optional(),
});

export const updateReminderBodySchema = createReminderBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" }
);

const boolish = z
  .union([z.literal("true"), z.literal("false"), z.boolean()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (typeof v === "boolean") return v;
    return v === "true";
  });

export const reminderListQuerySchema = z.object({
  search: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.string().trim().max(500).optional()
  ),
  category: z.coerce.number().optional().refine(
    (n) => n === undefined || (CATEGORY_VALUES as readonly number[]).includes(n),
    { message: "Invalid category" }
  ),
  priority: z.coerce.number().optional().refine(
    (n) => n === undefined || (PRIORITY_VALUES as readonly number[]).includes(n),
    { message: "Invalid priority" }
  ),
  isCompleted: boolish,
});

export type ReminderListQuery = z.infer<typeof reminderListQuerySchema>;
