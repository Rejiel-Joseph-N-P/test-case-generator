import { z } from "zod";

export const categoryEnum = z.enum(["POSITIVE", "NEGATIVE", "EDGE_CASE", "VALIDATION"]);
export const priorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const updateTestCaseSchema = z
  .object({
    title: z.string().trim().min(3).max(300),
    category: categoryEnum,
    priority: priorityEnum,
    preconditions: z.string().trim().max(1000).nullable(),
    steps: z.array(z.string().trim().min(1).max(500)).min(1).max(30),
    expectedResult: z.string().trim().min(3).max(1000),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field is required",
  });

export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;