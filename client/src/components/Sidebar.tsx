import { Plus, Sparkles, Trash2, X } from "lucide-react";
import { useDeleteRequirement, useRequirements } from "../hooks/useApi";

interface Props {
  selectedId: string | null;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string | null) => void;
}

export default function Sidebar({ selectedId, open, onClose, onSelect }: Props) {
  const { data, isLoading, isError } = useRequirements();
  const remove = useDeleteRequirement();

  function handleDelete(id: string) {
    if (!window.confirm("Delete this project and all its test cases?")) return;
    remove.mutate(id, {
      onSuccess: () => {
        if (id === selectedId) onSelect(null);
      },
    });
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-slate-900 text-slate-200 transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-rose-400" />
            <span className="text-lg font-semibold tracking-wide">TestGen</span>
          </div>
          <button onClick={onClose} className="md:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4">
          <button
            onClick={() => onSelect(null)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600"
          >
            <Plus className="h-4 w-4" /> New project
          </button>
        </div>

        <p className="px-5 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Projects
        </p>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {isLoading && <p className="px-2 text-sm text-slate-500">Loading…</p>}
          {isError && <p className="px-2 text-sm text-rose-400">Could not load projects.</p>}
          {data?.length === 0 && <p className="px-2 text-sm text-slate-500">No projects yet.</p>}
          {data?.map((r) => (
            <div
              key={r.id}
              className={`group flex items-center rounded-lg ${
                r.id === selectedId ? "bg-slate-800" : "hover:bg-slate-800/60"
              }`}
            >
              <button onClick={() => onSelect(r.id)} className="min-w-0 flex-1 px-3 py-2 text-left">
                <span className="block truncate text-sm text-white">{r.title}</span>
                <span className="text-xs text-slate-400">
                  {r._count?.testCases ?? 0} cases · {r.status === "SAVED" ? "Saved" : "Draft"}
                </span>
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                aria-label={`Delete ${r.title}`}
                className="mr-2 rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-rose-400 md:opacity-0 md:group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}