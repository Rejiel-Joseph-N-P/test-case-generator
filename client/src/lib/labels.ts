import type { Category, Priority } from "../types";

export const CATEGORY_LABELS: Record<Category, string> = {
  POSITIVE: "Positive",
  NEGATIVE: "Negative",
  EDGE_CASE: "Edge case",
  VALIDATION: "Validation",
};

export const CATEGORY_STYLES: Record<Category, string> = {
  POSITIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  NEGATIVE: "bg-rose-50 text-rose-700 ring-rose-200",
  EDGE_CASE: "bg-amber-50 text-amber-700 ring-amber-200",
  VALIDATION: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH: "bg-red-50 text-red-700 ring-red-200",
  MEDIUM: "bg-slate-100 text-slate-700 ring-slate-200",
  LOW: "bg-sky-50 text-sky-700 ring-sky-200",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
export const PRIORITIES: Priority[] = ["HIGH", "MEDIUM", "LOW"];