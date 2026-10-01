export type Category = "POSITIVE" | "NEGATIVE" | "EDGE_CASE" | "VALIDATION";
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type RequirementStatus = "DRAFT" | "SAVED";

export interface TestCase {
  id: string;
  requirementId: string;
  title: string;
  category: Category;
  priority: Priority;
  preconditions: string | null;
  steps: string[];
  expectedResult: string;
  isEdited: boolean;
  position: number;
}

export interface Requirement {
  id: string;
  title: string;
  rawText: string;
  sourceType: string;
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
  testCases?: TestCase[];
  _count?: { testCases: number };
}

export type TestCaseUpdate = Partial<
  Pick<TestCase, "title" | "category" | "priority" | "preconditions" | "steps" | "expectedResult">
>;