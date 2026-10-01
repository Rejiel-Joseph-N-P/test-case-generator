import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { CreateRequirementInput } from "../schemas/requirement.schema";

export const requirementService = {
  create(data: CreateRequirementInput) {
    return prisma.requirement.create({ data });
  },

  list() {
    return prisma.requirement.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { testCases: true } } },
    });
  },

  async getById(id: string) {
    const requirement = await prisma.requirement.findUnique({
      where: { id },
      include: { testCases: { orderBy: { position: "asc" } } },
    });
    if (!requirement) throw new HttpError(404, "Requirement not found");
    return requirement;
  },

  async markSaved(id: string) {
    const requirement = await this.getById(id);
    if (requirement.testCases.length === 0) {
      throw new HttpError(400, "Generate test cases before saving");
    }
    return prisma.requirement.update({
      where: { id },
      data: { status: "SAVED" },
    });
  },

  async remove(id: string) {
    await prisma.requirement.delete({ where: { id } });
  },
};