import { motion } from "framer-motion";
import { noteColorClass, rotationFor } from "../lib/notes";

// A framed corkboard hanging on the wall (room view). Shows a few note
// thumbnails + count. Shares a layoutId with the focused board so clicking it
// zooms smoothly into focus.
export default function WallBoard({ id, side, title, notes, onOpen }) {
  const preview = notes.slice(0, 4);
  return (
    <motion.button
      onClick={onOpen}
      className={`wall-board ${side}`}
      whileTap={{ scale: 0.98 }}
      aria-label={`Open ${title} board (${notes.length} notes)`}
    >
      <span className="nail" />
      <span className="string" />
      <div className="frame">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-display text-[10px] text-on-surface uppercase">{title}</span>
          <span className="font-label text-[9px] bg-white/60 px-1.5 py-0.5 rounded text-on-surface-variant">
            {notes.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {preview.map((t) => (
            <div
              key={t.id}
              className={`sticky-note ${t.status === "done" ? "note-completed" : noteColorClass(t.id)} !p-2 !shadow-sm`}
              style={{ transform: `rotate(${rotationFor(t.id)}deg)` }}
            >
              <p className="font-body text-[12px] leading-none text-on-surface-variant line-clamp-2">
                {t.title}
              </p>
            </div>
          ))}
          {preview.length === 0 && (
            <div className="col-span-2 py-4 text-center font-label text-[9px] text-on-surface-variant/70 uppercase">
              empty
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
