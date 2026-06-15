import { Router } from "express";
import * as productController from "../controllers/productController.js";
import { requireBasicAuth } from "../middleware/basicAuth.js";
import { validateBody } from "../middleware/validate.js";
import { createProductBodySchema, updateProductBodySchema } from "../validators/product.js";

const r = Router();

r.use(requireBasicAuth);

r.post("/", validateBody(createProductBodySchema), productController.create);
r.get("/", productController.list);
r.get("/:id", productController.getOne);
r.put("/:id", validateBody(updateProductBodySchema), productController.update);
r.delete("/:id", productController.remove);

export { r as productRoutes };
