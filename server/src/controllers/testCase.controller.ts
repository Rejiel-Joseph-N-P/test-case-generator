import { Request, Response } from "express";
import { testCaseService } from "../services/testCase.service";

export const testCaseController = {
  async update(req: Request, res: Response) {
    res.json(await testCaseService.update(String(req.params.id), req.body));
  },

  async remove(req: Request, res: Response) {
    await testCaseService.remove(String(req.params.id));
    res.status(204).send();
  },
};