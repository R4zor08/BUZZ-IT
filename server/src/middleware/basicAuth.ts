import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

function parseBasicAuthHeader(header: string) {
  if (!header.startsWith("Basic ")) {
    return null;
  }

  const encoded = header.slice("Basic ".length).trim();
  if (!encoded) {
    return null;
  }

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const [username, password] = decoded.split(":");
    if (!username || password === undefined) {
      return null;
    }

    return { username, password };
  } catch {
    return null;
  }
}

export function requireBasicAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const credentials = header ? parseBasicAuthHeader(header) : null;

  if (
    !credentials ||
    credentials.username !== env.basicAuthUsername ||
    credentials.password !== env.basicAuthPassword
  ) {
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
    return;
  }

  next();
}
