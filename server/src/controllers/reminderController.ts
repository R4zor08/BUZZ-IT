import type { Request, Response, NextFunction } from "express";
import type { ReminderListQuery } from "../validators/reminder.js";
import * as reminderService from "../services/reminderService.js";
import { idParam } from "../utils/routeParams.js";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const query = (req.validatedQuery ?? {}) as ReminderListQuery;
    const items = await reminderService.listReminders(userId, query);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const item = await reminderService.getReminder(userId, idParam(req));
    res.json(item);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const item = await reminderService.createReminder(userId, req.body);
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const item = await reminderService.updateReminder(userId, idParam(req), req.body);
    res.json(item);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await reminderService.deleteReminder(userId, idParam(req));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function markDone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await reminderService.markReminderDone(userId, idParam(req));
    if (result.status === 204) {
      res.status(204).send();
      return;
    }
    res.status(200).json(result.body);
  } catch (e) {
    next(e);
  }
}
