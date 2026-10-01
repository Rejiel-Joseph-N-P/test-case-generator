import { useState } from "react";
import { AlertCircle, CheckCircle2, Download, Loader2, RefreshCw, Save } from "lucide-react";
import { useGenerate, useRequirement, useSaveRequirement } from "../hooks/useApi";
import { downloadCsv } from "../lib/csv";
import { CATEGORIES, CATEGORY_LABELS } from "../lib/labels";
import type { Category } from "../types";
import TestCaseCard from "./TestCaseCard";

interface Props {
  id: string;
  onBack: () => void;
}

export default function Results({ id, onBack }: Props) {
  const { data, isLoading, isError, error } = useRequirement(id);
  const generate = useGenerate();
  const save = useSaveRequirement();
  const [filter, setFilter] = useState<Category | "ALL">("ALL");
  const [feedback, setFeedback] = useState("");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 p-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
        <p className="mt-3 text-slate-700">{error?.message ?? "Could not load this project."}</p>
        <button onClick={onBack} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
          Start a new project
        </button>
      </div>
    );
  }

  const cases = data.testCases ?? [];
  const visible = filter === "ALL" ? cases : cases.filter((c) => c.category === filter);
  const hasEdits = cases.some((c) => c.isEdited);
  const saved = data.status === "SAVED";

  function handleGenerate() {
    if (hasEdits && !window.confirm("Regenerating replaces all current test cases, including your manual edits. Continue?")) {
      return;
    }
    generate.mutate({ id, feedback: feedback.trim() }, { onSuccess: () => setFeedback("") });
  }

  function handleExport() {
    const safeName = data!.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "") || "test-cases";
    downloadCsv(`${safeName}-test-cases.csv`, cases);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-slate-900">{data.title}</h1>
          <p className="text-sm text-slate-500">
            {cases.length} test cases ·{" "}
            <span className={saved ? "font-medium text-emerald-600" : ""}>{saved ? "Saved" : "Draft"}</span>
          </p>
        </div>
        {cases.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
            <button
              onClick={() => save.mutate(id)}
              disabled={save.isPending || saved}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {save.isPending ? "Saving…" : saved ? "Saved" : "Save"}
            </button>
          </div>
        )}
      </header>

      {save.isError && <p role="alert" className="text-sm text-rose-600">{save.error.message}</p>}

      {cases.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(["ALL", ...CATEGORIES] as const).map((c) => {
            const count = c === "ALL" ? cases.length : cases.filter((t) => t.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  filter === c ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {c === "ALL" ? "All" : CATEGORY_LABELS[c]} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {visible.map((tc) => (
          <TestCaseCard key={tc.id} testCase={tc} index={cases.indexOf(tc)} requirementId={id} />
        ))}
        {cases.length > 0 && visible.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">No test cases in this category.</p>
        )}
      </div>

      <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-800">
          {cases.length === 0 ? "Generate test cases" : "Not happy with the result? Regenerate"}
        </h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Optional guidance, e.g. “focus more on security and boundary values”"
          disabled={generate.isPending}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        {generate.isError && (
          <p role="alert" className="flex gap-2 text-sm text-rose-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {generate.error.message}
          </p>
        )}
        <button
          onClick={handleGenerate}
          disabled={generate.isPending}
          className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-60"
        >
          {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {generate.isPending ? "Generating…" : cases.length === 0 ? "Generate" : "Regenerate"}
        </button>
      </section>
    </div>
  );
}