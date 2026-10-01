import { z } from "zod";
import { categoryEnum, priorityEnum } from "./testCase.schema";

export const generateRequestSchema = z.object({
  feedback: z.string().trim().max(500).optional(),
});

export const aiOutputSchema = z.object({
  issue: z.string().optional(),
  testCases: z
    .array(
      z.object({
        title: z.string().trim().min(3).max(300),
        category: categoryEnum,
        priority: priorityEnum,
        preconditions: z.string().trim().max(1000).nullish(),
        steps: z.array(z.string().trim().min(1).max(500)).min(1).max(30),
        expectedResult: z.string().trim().min(3).max(1000),
      })
    )
    .max(60),
});

export type AiOutput = z.infer<typeof aiOutputSchema>;