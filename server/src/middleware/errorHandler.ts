import type { NextFunction, Request, Response } from "express";

export interface ApiErrorBody {
  error: string;
  details?: { field: string; message: string }[];
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = (err as { status?: number })?.status ?? 500;
  const message =
    err instanceof Error ? err.message : "Internal server error.";
  if (status >= 500) {
    console.error(err);
  }
  const body: ApiErrorBody = { error: message };
  res.status(status).json(body);
}
