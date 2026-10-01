import { Request, Response } from "express";
import { requirementService } from "../services/requirement.service";

export const requirementController = {
  async create(req: Request, res: Response) {
    const requirement = await requirementService.create(req.body);
    res.status(201).json(requirement);
  },

  async list(_req: Request, res: Response) {
    res.json(await requirementService.list());
  },

  async getById(req: Request, res: Response) {
    res.json(await requirementService.getById(String(req.params.id)));
  },

  async save(req: Request, res: Response) {
    res.json(await requirementService.markSaved(String(req.params.id)));
  },

  async remove(req: Request, res: Response) {
    await requirementService.remove(String(req.params.id));
    res.status(204).send();
  },
};