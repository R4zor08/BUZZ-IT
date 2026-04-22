import { z } from "zod";
import { CATEGORY_VALUES, PRIORITY_VALUES } from "../constants/enums.js";

const categorySchema = z.coerce.number().refine((n): n is (typeof CATEGORY_VALUES)[number] =>
  (CATEGORY_VALUES as readonly number[]).includes(n)
);

const prioritySchema = z.coerce.number().refine((n): n is (typeof PRIORITY_VALUES)[number] =>
  (PRIORITY_VALUES as readonly number[]).includes(n)
);

export const createPostBodySchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  category: categorySchema,
  priority: prioritySchema,
  dueDate: z.coerce.date().optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.coerce.date().optional(),
});

export const updatePostBodySchema = createPostBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" }
);
