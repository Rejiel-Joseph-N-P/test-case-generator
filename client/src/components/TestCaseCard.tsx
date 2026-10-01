import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useDeleteTestCase, useUpdateTestCase } from "../hooks/useApi";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_STYLES, PRIORITIES, PRIORITY_STYLES } from "../lib/labels";
import type { Category, Priority, TestCase } from "../types";

interface Props {
  testCase: TestCase;
  index: number;
  requirementId: string;
}

const field =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export default function TestCaseCard({ testCase: tc, index, requirementId }: Props) {
  const update = useUpdateTestCase(requirementId);
  const remove = useDeleteTestCase(requirementId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(tc.title);
  const [category, setCategory] = useState<Category>(tc.category);
  const [priority, setPriority] = useState<Priority>(tc.priority);
  const [preconditions, setPreconditions] = useState(tc.preconditions ?? "");
  const [steps, setSteps] = useState(tc.steps.join("\n"));
  const [expected, setExpected] = useState(tc.expectedResult);

  function startEdit() {
    setTitle(tc.title);
    setCategory(tc.category);
    setPriority(tc.priority);
    setPreconditions(tc.preconditions ?? "");
    setSteps(tc.steps.join("\n"));
    setExpected(tc.expectedResult);
    setError(null);
    setEditing(true);
    setOpen(true);
  }

  function handleSave() {
    const stepList = steps.split("\n").map((s) => s.trim()).filter(Boolean);
    if (title.trim().length < 3) return setError("Title must be at least 3 characters.");
    if (stepList.length === 0) return setError("Add at least one step (one per line).");
    if (expected.trim().length < 3) return setError("Expected result must be at least 3 characters.");

    setError(null);
    update.mutate(
      {
        id: tc.id,
        changes: {
          title: title.trim(),
          category,
          priority,
          preconditions: preconditions.trim() || null,
          steps: stepList,
          expectedResult: expected.trim(),
        },
      },
      {
        onSuccess: () => setEditing(false),
        onError: (err) => setError(err.message),
      }
    );
  }

  function handleDelete() {
    if (window.confirm("Delete this test case?")) remove.mutate(tc.id);
  }

  return (
    <article className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle details"
          className="mt-0.5 text-slate-400 hover:text-slate-700"
        >
          <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">TC-{String(index + 1).padStart(2, "0")}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${CATEGORY_STYLES[tc.category]}`}>
              {CATEGORY_LABELS[tc.category]}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${PRIORITY_STYLES[tc.priority]}`}>
              {tc.priority.charAt(0) + tc.priority.slice(1).toLowerCase()}
            </span>
            {tc.isEdited && <span className="text-xs italic text-slate-400">edited</span>}
          </div>
          <h3 className="mt-1 font-medium text-slate-900">{tc.title}</h3>
        </div>

        <div className="flex shrink-0 gap-1">
          <button onClick={startEdit} aria-label="Edit test case" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} aria-label="Delete test case" className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && !editing && (
        <div className="space-y-3 border-t border-slate-100 px-4 py-4 pl-12 text-sm text-slate-700">
          {tc.preconditions && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preconditions</p>
              <p>{tc.preconditions}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Steps</p>
            <ol className="list-decimal space-y-0.5 pl-5">
              {tc.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expected result</p>
            <p>{tc.expectedResult}</p>
          </div>
        </div>
      )}

      {open && editing && (
        <div className="space-y-3 border-t border-slate-100 p-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} className={field} aria-label="Title" />
          <div className="grid grid-cols-2 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={field} aria-label="Category">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={field} aria-label="Priority">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <textarea value={preconditions} onChange={(e) => setPreconditions(e.target.value)} rows={2} placeholder="Preconditions (optional)" className={field} />
          <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={5} placeholder="Steps, one per line" className={field} />
          <textarea value={expected} onChange={(e) => setExpected(e.target.value)} rows={2} placeholder="Expected result" className={field} />

          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={update.isPending}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {update.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}