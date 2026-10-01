import { Request, Response } from "express";
import { generationService } from "../services/generation.service";

export const generationController = {
  async generate(req: Request, res: Response) {
    const result = await generationService.generate(String(req.params.id), req.body.feedback);
    res.json(result);
  },
};