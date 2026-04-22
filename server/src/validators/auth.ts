import { z } from "zod";

export const registerBodySchema = z.object({
  username: z.string().trim().min(3).max(50),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((e) => e.toLowerCase()),
  password: z.string().min(6),
});

export const loginBodySchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
