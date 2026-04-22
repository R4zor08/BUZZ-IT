import { Router } from "express";
import * as reminderController from "../controllers/reminderController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  createReminderBodySchema,
  reminderListQuerySchema,
  updateReminderBodySchema,
} from "../validators/reminder.js";

const r = Router();

r.use(requireAuth);

r.get("/", validateQuery(reminderListQuerySchema), reminderController.list);
r.post("/", validateBody(createReminderBodySchema), reminderController.create);
r.patch("/:id/mark-done", reminderController.markDone);
r.get("/:id", reminderController.getOne);
r.put("/:id", validateBody(updateReminderBodySchema), reminderController.update);
r.delete("/:id", reminderController.remove);

export { r as reminderRoutes };
