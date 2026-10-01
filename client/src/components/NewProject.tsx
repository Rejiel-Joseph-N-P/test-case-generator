import { useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useCreateRequirement, useDeleteRequirement, useGenerate } from "../hooks/useApi";

const MIN_TEXT = 20;
const MAX_TEXT = 20000;

export default function NewProject({ onDone }: { onDone: (id: string) => void }) {
  const create = useCreateRequirement();
  const generate = useGenerate();
  const discard = useDeleteRequirement();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = create.isPending || generate.isPending;
  const valid = title.trim().length >= 3 && text.trim().length >= MIN_TEXT;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid || busy) return;
    setError(null);
    let createdId: string | null = null;
    try {
      const requirement = await create.mutateAsync({ title: title.trim(), rawText: text.trim() });
      createdId = requirement.id;
      await generate.mutateAsync({ id: createdId });
      onDone(createdId);
    } catch (err) {
      // Don't leave an empty draft behind when generation fails.
      if (createdId) discard.mutate(createdId);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-rose-300 via-fuchsia-300 to-sky-300 shadow-md">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome to Test Case Generation</h1>
        <p className="mt-2 text-slate-600">
          Paste your requirements or user stories and get a structured set of test cases.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
            Project name
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="e.g. E-commerce checkout"
            disabled={busy}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label htmlFor="text" className="mb-1 block text-sm font-medium text-slate-700">
            Requirements / user stories
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_TEXT}
            rows={9}
            placeholder="As a user, I want to…"
            disabled={busy}
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-50"
          />
          <p className="mt-1 text-right text-xs text-slate-500">
            {text.trim().length < MIN_TEXT
              ? `At least ${MIN_TEXT} characters (${text.trim().length})`
              : `${text.length.toLocaleString()} / ${MAX_TEXT.toLocaleString()}`}
          </p>
        </div>

        {error && (
          <div role="alert" className="flex gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!valid || busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {generate.isPending ? "Generating test cases… this can take a few seconds" : "Creating project…"}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate test cases
            </>
          )}
        </button>
      </form>
    </div>
  );
}