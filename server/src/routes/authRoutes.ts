import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { registerBodySchema, loginBodySchema } from "../validators/auth.js";

const r = Router();

r.post("/register", validateBody(registerBodySchema), authController.register);
r.post("/login", validateBody(loginBodySchema), authController.login);

export { r as authRoutes };
