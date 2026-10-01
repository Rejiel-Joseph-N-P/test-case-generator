import type { TestCase } from "../types";

function cell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, cases: TestCase[]) {
  const header = ["#", "Title", "Category", "Priority", "Preconditions", "Steps", "Expected Result"];
  const rows = cases.map((tc, i) => [
    String(i + 1),
    tc.title,
    tc.category,
    tc.priority,
    tc.preconditions ?? "",
    tc.steps.map((s, n) => `${n + 1}. ${s}`).join("\n"),
    tc.expectedResult,
  ]);
  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}