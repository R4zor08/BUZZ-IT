import type { Post } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

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

function toDTO(doc: Post): {
  id: string;
  userId: string;
  title: string;
  content: string;
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
    content: doc.content,
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

export async function listPosts(userId: string) {
  const ownerId = parseId(userId, "user");
  const docs = await prisma.post.findMany({
    where: { userId: ownerId },
    orderBy: { createdAt: "desc" },
  });
  return docs.map(toDTO);
}

export async function getPost(userId: string, id: string) {
  const ownerId = parseId(userId, "user");
  const postId = parseId(id, "post");
  const doc = await prisma.post.findFirst({
    where: { id: postId, userId: ownerId },
  });
  if (!doc) {
    throw Object.assign(new Error("Post not found."), { status: 404 });
  }
  return toDTO(doc);
}

export async function createPost(
  userId: string,
  body: {
    title: string;
    content: string;
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
  const doc = await prisma.post.create({
    data: {
      userId: ownerId,
      title: body.title,
      content: body.content,
      category: body.category,
      priority: body.priority,
      dueDate: body.dueDate,
      isCompleted: withCompletion.isCompleted ?? false,
      completedAt: withCompletion.completedAt ?? null,
    },
  });
  return toDTO(doc);
}

export async function updatePost(
  userId: string,
  id: string,
  body: Partial<{
    title: string;
    content: string;
    category: number;
    priority: number;
    dueDate: Date | null;
    isCompleted: boolean;
    completedAt: Date | null;
  }>
) {
  const ownerId = parseId(userId, "user");
  const postId = parseId(id, "post");
  const existing = await prisma.post.findFirst({
    where: { id: postId, userId: ownerId },
  });
  if (!existing) {
    throw Object.assign(new Error("Post not found."), { status: 404 });
  }

  const merged = {
    title: body.title ?? existing.title,
    content: body.content ?? existing.content,
    category: body.category ?? existing.category,
    priority: body.priority ?? existing.priority,
    dueDate:
      body.dueDate !== undefined ? body.dueDate : (existing.dueDate ?? undefined),
    isCompleted: body.isCompleted ?? existing.isCompleted,
    completedAt:
      body.completedAt !== undefined ? body.completedAt : (existing.completedAt ?? undefined),
  };
  const withCompletion = applyCompletionFields(merged);

  const doc = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.dueDate !== undefined ? { dueDate: body.dueDate } : {}),
      isCompleted: withCompletion.isCompleted,
      completedAt: withCompletion.completedAt ?? null,
    },
  });
  return toDTO(doc);
}

export async function deletePost(userId: string, id: string): Promise<void> {
  const ownerId = parseId(userId, "user");
  const postId = parseId(id, "post");
  const res = await prisma.post.deleteMany({
    where: { id: postId, userId: ownerId },
  });
  if (res.count === 0) {
    throw Object.assign(new Error("Post not found."), { status: 404 });
  }
}

/**
 * PATCH mark-complete: idempotent — if already complete, return null (204);
 * otherwise mark complete and return DTO (200).
 */
export async function markPostComplete(
  userId: string,
  id: string
): Promise<{ status: 204 } | { status: 200; body: ReturnType<typeof toDTO> }> {
  const ownerId = parseId(userId, "user");
  const postId = parseId(id, "post");
  const existing = await prisma.post.findFirst({
    where: { id: postId, userId: ownerId },
  });
  if (!existing) {
    throw Object.assign(new Error("Post not found."), { status: 404 });
  }
  if (existing.isCompleted) {
    return { status: 204 };
  }
  const updated = await prisma.post.update({
    where: { id: postId },
    data: { isCompleted: true, completedAt: new Date() },
  });
  return { status: 200, body: toDTO(updated) };
}
