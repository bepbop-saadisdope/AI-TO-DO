import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { listTodos, createTodo, updateTodo, deleteTodo } from "./api/todos";
import { loadAmbiance, saveAmbiance } from "./lib/ambiance";
import Header from "./components/Header";
import Board from "./components/Board";
import WallBoard from "./components/WallBoard";
import NoteModal from "./components/NoteModal";
import AmbiancePanel from "./components/AmbiancePanel";
import RoomScene from "./components/RoomScene";

function matches(todo, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    todo.title.toLowerCase().includes(q) ||
    (todo.description ?? "").toLowerCase().includes(q) ||
    todo.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSearch, setActiveSearch] = useState("");
  const [doneSearch, setDoneSearch] = useState("");

  const [focus, setFocus] = useState(null); // null | "active" | "completed"
  const [modal, setModal] = useState({ open: false, initial: null });
  const [ambianceOpen, setAmbianceOpen] = useState(false);
  const [ambiance, setAmbiance] = useState(loadAmbiance);

  useEffect(() => {
    listTodos()
      .then(setTodos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => saveAmbiance(ambiance), [ambiance]);

  const activeNotes = useMemo(() => todos.filter((t) => t.status !== "done"), [todos]);
  const doneNotes = useMemo(() => todos.filter((t) => t.status === "done"), [todos]);

  function upsert(todo) {
    setTodos((prev) => {
      const i = prev.findIndex((t) => t.id === todo.id);
      if (i === -1) return [...prev, todo];
      const next = [...prev];
      next[i] = todo;
      return next;
    });
  }

  async function setStatus(todo, status) {
    upsert({ ...todo, status });
    try {
      upsert(await updateTodo(todo.id, { status }));
    } catch (e) {
      setError(e.message);
      upsert(todo);
    }
  }

  async function handleSave(payload) {
    try {
      if (modal.initial) upsert(await updateTodo(modal.initial.id, payload));
      else upsert(await createTodo(payload));
      setModal({ open: false, initial: null });
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(todo) {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    try {
      await deleteTodo(todo.id);
    } catch (e) {
      setError(e.message);
      upsert(todo);
    }
  }

  const windEnabled = ambiance.wind > 0.05;

  // Remember the last focused board so the zoom origin stays put while exiting
  // (otherwise the dolly-out happens around a different point than the dolly-in).
  const lastFocus = useRef("active");
  useEffect(() => {
    if (focus) lastFocus.current = focus;
  }, [focus]);
  const originX = (focus ?? lastFocus.current) === "completed" ? "40%" : "14%";

  // Mood accent (matches the header buttons) — also used for the focused board
  // header + back button so they stay legible on the dark focus overlay.
  const ACCENT = { morning: "#cf6a34", noon: "#d98a3c", dusk: "#c1512f", night: "#5b6aa8" };
  const accent = ACCENT[ambiance.time] ?? ACCENT.morning;

  // High-contrast text for elements sitting on the room itself (dark on the
  // light moods, light at night) so they never blend into the background.
  const CONTRAST = { morning: "#5a463d", noon: "#5a463d", dusk: "#4a2c1c", night: "#ece8f6" };
  const contrast = CONTRAST[ambiance.time] ?? CONTRAST.morning;

  // Props for whichever board is focused.
  const boardHandlers = {
    windEnabled,
    onComplete: (t) => setStatus(t, "done"),
    onUncomplete: (t) => setStatus(t, "todo"),
    onEdit: (t) => setModal({ open: true, initial: t }),
    onDelete: handleDelete,
  };

  const focusBoard =
    focus === "active"
      ? { id: "active", tone: "active", eyebrow: "Workspace", title: "ACTIVE", notes: activeNotes.filter((t) => matches(t, activeSearch)), search: activeSearch, onSearch: setActiveSearch, searchPlaceholder: "SEARCH…" }
      : focus === "completed"
      ? { id: "completed", tone: "completed", eyebrow: "History", title: "COMPLETED", notes: doneNotes.filter((t) => matches(t, doneSearch)), search: doneSearch, onSearch: setDoneSearch, searchPlaceholder: "ARCHIVE…" }
      : null;

  return (
    <>
      {/* Background zooms toward the focused board (camera dolly-in), so it
          feels like we move into the board rather than the board flying to us. */}
      <motion.div
        className="fixed inset-0 z-0"
        animate={{ scale: focus ? 1.8 : 1 }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
        style={{ transformOrigin: `${originX} 42%` }}
      >
        <RoomScene ambiance={ambiance} />
      </motion.div>
      <div className="noise-overlay" />

      <div className="relative z-10 min-h-screen">
        <Header time={ambiance.time} onNew={() => setModal({ open: true, initial: null })} onOpenAmbiance={() => setAmbianceOpen(true)} />

        {error && (
          <div className="max-w-[1200px] mx-auto px-6 md:px-10">
            <div className="bg-error-container text-on-error-container font-label text-[11px] px-4 py-2 rounded-lg flex items-center justify-between">
              <span>⚠ {error}</span>
              <button onClick={() => setError("")} className="material-symbols-outlined text-[16px]">close</button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="font-label text-[12px] text-primary text-center py-20">Loading your desk…</p>
        ) : (
          <>
            {focus === null && (
              <>
                <WallBoard id="active" side="a" title="ACTIVE" notes={activeNotes} onOpen={() => setFocus("active")} />
                <WallBoard id="completed" side="b" title="COMPLETED" notes={doneNotes} onOpen={() => setFocus("completed")} />
                <p style={{ color: contrast }} className="fixed bottom-6 left-1/2 -translate-x-1/2 font-label text-[10px] uppercase tracking-widest opacity-90">
                  click a board to focus
                </p>
              </>
            )}

            {/* Focus overlay: scale + fade, symmetric in/out (no spring bounce) */}
            <AnimatePresence>
              {focusBoard && (
                <motion.div
                  key="focus"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="focus-shade" onClick={() => setFocus(null)} />
                  <div className="focus-wrap">
                    <motion.div
                      className="focus-card"
                      initial={{ scale: 0.86 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.86 }}
                      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                    >
                      <button
                        onClick={() => setFocus(null)}
                        style={{ background: accent }}
                        className="pixel-btn text-white px-4 py-2 text-[10px] mb-3 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        BACK TO ROOM
                      </button>
                      <Board {...focusBoard} {...boardHandlers} accent={accent} />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {modal.open && (
        <NoteModal initial={modal.initial} onSave={handleSave} onClose={() => setModal({ open: false, initial: null })} />
      )}
      {ambianceOpen && (
        <AmbiancePanel
          ambiance={ambiance}
          onChange={(patch) => setAmbiance((a) => ({ ...a, ...patch }))}
          onClose={() => setAmbianceOpen(false)}
        />
      )}
    </>
  );
}
