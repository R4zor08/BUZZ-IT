import type { Request } from "express";

/** Express `req.params.id` as a single string (handles `string | string[]` typing). */
export function idParam(req: Request): string {
  const raw = req.params.id;
  if (Array.isArray(raw)) return raw[0] ?? "";
  return raw ?? "";
}
