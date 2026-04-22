import type { Request, Response, NextFunction } from "express";
import * as postService from "../services/postService.js";
import { idParam } from "../utils/routeParams.js";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const posts = await postService.listPosts(userId);
    res.json(posts);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const post = await postService.getPost(userId, idParam(req));
    res.json(post);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const post = await postService.createPost(userId, req.body);
    res.status(201).json(post);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const post = await postService.updatePost(userId, idParam(req), req.body);
    res.json(post);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await postService.deletePost(userId, idParam(req));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function markComplete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await postService.markPostComplete(userId, idParam(req));
    if (result.status === 204) {
      res.status(204).send();
      return;
    }
    res.status(200).json(result.body);
  } catch (e) {
    next(e);
  }
}
