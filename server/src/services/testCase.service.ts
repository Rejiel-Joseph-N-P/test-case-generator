import { prisma } from "../lib/prisma";
import { UpdateTestCaseInput } from "../schemas/testCase.schema";

export const testCaseService = {
  update(id: string, data: UpdateTestCaseInput) {
    return prisma.testCase.update({
      where: { id },
      data: { ...data, isEdited: true },
    });
  },

  async remove(id: string) {
    await prisma.testCase.delete({ where: { id } });
  },
};