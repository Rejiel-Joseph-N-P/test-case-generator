import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { aiService } from "./ai.service";
import { requirementService } from "./requirement.service";

export const generationService = {
  async generate(requirementId: string, feedback?: string) {
    const requirement = await requirementService.getById(requirementId);

    const output = await aiService.generateTestCases({
      title: requirement.title,
      rawText: requirement.rawText,
      feedback,
    });

    if (output.testCases.length === 0) {
      throw new HttpError(
        422,
        output.issue ?? "This requirement is too vague to generate meaningful test cases. Add more detail and try again."
      );
    }

    // Drop duplicate titles the model may have produced.
    const seen = new Set<string>();
    const unique = output.testCases.filter((tc) => {
      const key = tc.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Regenerate replaces the previous set atomically.
    await prisma.$transaction([
      prisma.testCase.deleteMany({ where: { requirementId } }),
      prisma.testCase.createMany({
        data: unique.map((tc, index) => ({
          requirementId,
          title: tc.title,
          category: tc.category,
          priority: tc.priority,
          preconditions: tc.preconditions?.trim() || null,
          steps: tc.steps,
          expectedResult: tc.expectedResult,
          position: index,
        })),
      }),
      prisma.requirement.update({ where: { id: requirementId }, data: { status: "DRAFT" } }),
    ]);

    return requirementService.getById(requirementId);
  },
};