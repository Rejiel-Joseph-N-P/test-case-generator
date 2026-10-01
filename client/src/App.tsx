import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import NewProject from "./components/NewProject";
import Results from "./components/Results";

const STORAGE_KEY = "selectedRequirementId";

function loadSelected(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(loadSelected);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      if (selectedId) localStorage.setItem(STORAGE_KEY, selectedId);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable – selection just won't persist */
    }
  }, [selectedId]);

  function select(id: string | null) {
    setSelectedId(id);
    setMenuOpen(false);
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar selectedId={selectedId} open={menuOpen} onClose={() => setMenuOpen(false)} onSelect={select} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">TestGen</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-linear-to-br from-cyan-50/60 via-white to-pink-50/60">
          {selectedId ? (
            <Results key={selectedId} id={selectedId} onBack={() => select(null)} />
          ) : (
            <NewProject onDone={select} />
          )}
        </main>
      </div>
    </div>
  );
}