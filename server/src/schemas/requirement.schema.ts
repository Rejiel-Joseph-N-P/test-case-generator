import { z } from "zod";

export const createRequirementSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  rawText: z
    .string()
    .trim()
    .min(20, "Requirement must be at least 20 characters")
    .max(20000, "Requirement is too long"),
});

export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;