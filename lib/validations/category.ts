import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(40),
  icon: z.string().trim().min(1).max(32),
  color: z.string().trim().min(1).max(24)
});
