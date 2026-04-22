import type { Prisma, Reminder } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { ReminderListQuery } from "../validators/reminder.js";

function parseId(raw: string, resourceLabel: string): number {
  if (!/^\d+$/.test(raw)) {
    throw Object.assign(new Error(`Invalid ${resourceLabel} id.`), { status: 400 });
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw Object.assign(new Error(`Invalid ${resourceLabel} id.`), { status: 400 });
  }
  return value;
}

function toDTO(doc: Reminder): {
  id: string;
  userId: string;
  title: string;
  time: Date;
  description: string;
  category: number;
  priority: number;
  dueDate: Date | null;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: String(doc.id),
    userId: String(doc.userId),
    title: doc.title,
    time: doc.time,
    description: doc.description,
    category: doc.category,
    priority: doc.priority,
    dueDate: doc.dueDate ?? null,
    isCompleted: doc.isCompleted,
    completedAt: doc.completedAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function applyCompletionFields<T extends { isCompleted?: boolean; completedAt?: Date | null }>(
  data: T
): T & { completedAt?: Date | null } {
  const next = { ...data } as T & { completedAt?: Date | null };
  if (next.isCompleted === true) {
    next.completedAt = next.completedAt ?? new Date();
  } else if (next.isCompleted === false) {
    next.completedAt = null;
  }
  return next;
}

export async function listReminders(userId: string, query: ReminderListQuery) {
  const ownerId = parseId(userId, "user");
  const where: Prisma.ReminderWhereInput = {
    userId: ownerId,
  };

  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }
  if (query.category !== undefined) {
    where.category = query.category;
  }
  if (query.priority !== undefined) {
    where.priority = query.priority;
  }
  if (query.isCompleted !== undefined) {
    where.isCompleted = query.isCompleted;
  }

  const docs = await prisma.reminder.findMany({
    where,
    orderBy: { time: "asc" },
  });
  return docs.map(toDTO);
}

export async function getReminder(userId: string, id: string) {
  const ownerId = parseId(userId, "user");
  const reminderId = parseId(id, "reminder");
  const doc = await prisma.reminder.findFirst({
    where: { id: reminderId, userId: ownerId },
  });
  if (!doc) {
    throw Object.assign(new Error("Reminder not found."), { status: 404 });
  }
  return toDTO(doc);
}

export async function createReminder(
  userId: string,
  body: {
    title: string;
    time: Date;
    description: string;
    category: number;
    priority: number;
    dueDate?: Date;
    isCompleted?: boolean;
    completedAt?: Date;
  }
) {
  const ownerId = parseId(userId, "user");
  const withCompletion = applyCompletionFields({
    ...body,
    isCompleted: body.isCompleted ?? false,
  });
  const doc = await prisma.reminder.create({
    data: {
      userId: ownerId,
      title: body.title,
      time: body.time,
      description: body.description ?? "",
      category: body.category,
      priority: body.priority,
      dueDate: body.dueDate,
      isCompleted: withCompletion.isCompleted ?? false,
      completedAt: withCompletion.completedAt ?? null,
    },
  });
  return toDTO(doc);
}

export async function updateReminder(
  userId: string,
  id: string,
  body: Partial<{
    title: string;
    time: Date;
    description: string;
    category: number;
    priority: number;
    dueDate: Date | null;
    isCompleted: boolean;
    completedAt: Date | null;
  }>
) {
  const ownerId = parseId(userId, "user");
  const reminderId = parseId(id, "reminder");
  const existing = await prisma.reminder.findFirst({
    where: { id: reminderId, userId: ownerId },
  });
  if (!existing) {
    throw Object.assign(new Error("Reminder not found."), { status: 404 });
  }

  const merged = {
    title: body.title ?? existing.title,
    time: body.time ?? existing.time,
    description: body.description ?? existing.description,
    category: body.category ?? existing.category,
    priority: body.priority ?? existing.priority,
    dueDate:
      body.dueDate !== undefined ? body.dueDate : (existing.dueDate ?? undefined),
    isCompleted: body.isCompleted ?? existing.isCompleted,
    completedAt:
      body.completedAt !== undefined ? body.completedAt : (existing.completedAt ?? undefined),
  };
  const withCompletion = applyCompletionFields(merged);

  const doc = await prisma.reminder.update({
    where: { id: reminderId },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.time !== undefined ? { time: body.time } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.dueDate !== undefined ? { dueDate: body.dueDate } : {}),
      isCompleted: withCompletion.isCompleted,
      completedAt: withCompletion.completedAt ?? null,
    },
  });
  return toDTO(doc);
}

export async function deleteReminder(userId: string, id: string): Promise<void> {
  const ownerId = parseId(userId, "user");
  const reminderId = parseId(id, "reminder");
  const res = await prisma.reminder.deleteMany({
    where: { id: reminderId, userId: ownerId },
  });
  if (res.count === 0) {
    throw Object.assign(new Error("Reminder not found."), { status: 404 });
  }
}

/**
 * PATCH mark-done: idempotent — if already complete, 204; else 200 with updated body.
 */
export async function markReminderDone(
  userId: string,
  id: string
): Promise<{ status: 204 } | { status: 200; body: ReturnType<typeof toDTO> }> {
  const ownerId = parseId(userId, "user");
  const reminderId = parseId(id, "reminder");
  const existing = await prisma.reminder.findFirst({
    where: { id: reminderId, userId: ownerId },
  });
  if (!existing) {
    throw Object.assign(new Error("Reminder not found."), { status: 404 });
  }
  if (existing.isCompleted) {
    return { status: 204 };
  }
  const updated = await prisma.reminder.update({
    where: { id: reminderId },
    data: { isCompleted: true, completedAt: new Date() },
  });
  return { status: 200, body: toDTO(updated) };
}
