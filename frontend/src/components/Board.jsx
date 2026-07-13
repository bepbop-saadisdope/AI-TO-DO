import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StickyNote from "./StickyNote";

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

const PER_BOARD = 6; // notes per sliding board

// Sliding boards: notes are split across "boards"; when one is full, slide it
// away (like lecture-hall chalkboards on tracks) to reach the next.
const slideVariants = {
  enter: (dir) => ({ y: dir >= 0 ? "100%" : "-100%", opacity: 0.5 }),
  center: { y: 0, opacity: 1 },
  exit: (dir) => ({ y: dir >= 0 ? "-100%" : "100%", opacity: 0.5 }),
};

export default function Board({
  id,
  eyebrow,
  title,
  tone, // "active" | "completed"
  notes,
  search,
  onSearch,
  searchPlaceholder,
  windEnabled,
  accent,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}) {
  const completed = tone === "completed";

  // Split notes into boards of PER_BOARD (always at least one, possibly empty).
  const boards = useMemo(() => {
    if (notes.length === 0) return [[]];
    const out = [];
    for (let i = 0; i < notes.length; i += PER_BOARD) out.push(notes.slice(i, i + PER_BOARD));
    return out;
  }, [notes]);

  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(0);

  // Keep the page in range when boards shrink (search/delete/complete).
  useEffect(() => {
    if (page > boards.length - 1) setPage(Math.max(0, boards.length - 1));
  }, [boards.length, page]);

  const current = boards[Math.min(page, boards.length - 1)] ?? [];

  const slide = (delta) => {
    const next = page + delta;
    if (next < 0 || next > boards.length - 1) return;
    setDir(delta);
    setPage(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between px-2">
        <div className="flex flex-col">
          <span style={{ color: accent }} className="font-label text-[10px] uppercase tracking-widest opacity-90">{eyebrow}</span>
          <h2 className={`font-display text-[16px] text-surface ${completed ? "opacity-70" : ""}`}>{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-label text-[10px] bg-surface-container-high px-2 py-1 rounded text-on-surface-variant">
            {notes.length} {notes.length === 1 ? "item" : "items"}
          </span>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={`Search ${title.toLowerCase()} notes`}
              className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-label text-[11px] outline-none focus:ring-2 focus:ring-primary-container w-40 focus:w-56 transition-all"
            />
          </div>
        </div>
      </div>

      {/* The board frame: fixed height, one board visible; slides between them. */}
      <div data-tone={tone} className="tactile-board relative rounded-xl overflow-hidden h-[66vh] min-h-[400px]">
        <AnimatePresence custom={dir} initial={false}>
          <motion.div
            key={page}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
            className="absolute inset-0 p-5 md:p-7 grid grid-cols-1 sm:grid-cols-2 grid-rows-6 sm:grid-rows-3 gap-4 md:gap-5"
          >
            {current.length === 0 ? (
              <div className="col-span-full row-span-6 sm:row-span-3 flex flex-col items-center justify-center text-center gap-2 text-white/80">
                <Icon name={completed ? "task_alt" : "sticky_note_2"} className="text-[40px]" />
                <p className="font-label text-[11px] uppercase tracking-wider">
                  {search ? "No matches" : completed ? "Nothing done yet" : "No notes — pin one!"}
                </p>
              </div>
            ) : (
              current.map((todo) => (
                <StickyNote
                  key={todo.id}
                  todo={todo}
                  windEnabled={windEnabled}
                  onComplete={onComplete}
                  onUncomplete={onUncomplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Slide controls — the row height is ALWAYS reserved so the board never
          jumps when the count drops from multiple boards to one. */}
      <div className="h-8 flex items-center justify-center gap-3">
        {boards.length > 1 && (
          <>
            <button
              onClick={() => slide(-1)}
              disabled={page === 0}
              aria-label="Previous board"
              className="icon-btn w-8 h-8 rounded-full bg-surface-container-high text-primary disabled:opacity-30 hover:brightness-95"
            >
              <Icon name="keyboard_arrow_up" className="text-[20px]" />
            </button>
            <span className="font-label text-[11px] text-surface tabular-nums">
              {page + 1} / {boards.length}
            </span>
            <button
              onClick={() => slide(1)}
              disabled={page === boards.length - 1}
              aria-label="Next board"
              className="icon-btn w-8 h-8 rounded-full bg-surface-container-high text-primary disabled:opacity-30 hover:brightness-95"
            >
              <Icon name="keyboard_arrow_down" className="text-[20px]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
