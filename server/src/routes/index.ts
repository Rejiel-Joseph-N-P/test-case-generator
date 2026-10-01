import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middleware/validate";
import { createRequirementSchema } from "../schemas/requirement.schema";
import { updateTestCaseSchema } from "../schemas/testCase.schema";
import { generateRequestSchema } from "../schemas/generation.schema";
import { requirementController } from "../controllers/requirement.controller";
import { testCaseController } from "../controllers/testCase.controller";
import { generationController } from "../controllers/generation.controller";

export const router = Router();

const generateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many generation requests. Please wait a minute." },
});

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.post("/requirements", validate(createRequirementSchema), requirementController.create);
router.get("/requirements", requirementController.list);
router.get("/requirements/:id", requirementController.getById);
router.post(
  "/requirements/:id/generate",
  generateLimiter,
  validate(generateRequestSchema),
  generationController.generate
);
router.post("/requirements/:id/save", requirementController.save);
router.delete("/requirements/:id", requirementController.remove);

router.patch("/test-cases/:id", validate(updateTestCaseSchema), testCaseController.update);
router.delete("/test-cases/:id", testCaseController.remove);