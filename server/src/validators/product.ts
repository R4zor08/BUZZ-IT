import { z } from "zod";

export const createProductBodySchema = z.object({
  name: z.string().min(1, "The name field is required."),
  description: z.string().optional(),
  price: z.number({ invalid_type_error: "Price must be a number." }),
  quantity: z.number({ invalid_type_error: "Quantity must be a number." }).int(),
  category: z.string().optional(),
});

export const updateProductBodySchema = createProductBodySchema.partial();
