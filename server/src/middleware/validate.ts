import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

function formatZodError(err: { issues: { path: (string | number)[]; message: string }[] }) {
  return err.issues.map((i) => ({
    field: i.path.length ? i.path.join(".") : "request",
    message: i.message,
  }));
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        error: "Validation failed",
        details: formatZodError(result.error),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(422).json({
        error: "Validation failed",
        details: formatZodError(result.error),
      });
      return;
    }
    req.validatedQuery = result.data;
    next();
  };
}
