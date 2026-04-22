import { Router } from "express";
import * as postController from "../controllers/postController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { createPostBodySchema, updatePostBodySchema } from "../validators/post.js";

const r = Router();

r.use(requireAuth);

r.get("/", postController.list);
r.post("/", validateBody(createPostBodySchema), postController.create);
r.patch("/:id/mark-complete", postController.markComplete);
r.get("/:id", postController.getOne);
r.put("/:id", validateBody(updatePostBodySchema), postController.update);
r.delete("/:id", postController.remove);

export { r as postRoutes };
