import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService.js";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const out = await authService.register(req.body);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const out = await authService.login(req.body);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
}
