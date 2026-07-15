import { noteColorClass, rotationFor, priorityDotClass } from "../lib/notes";

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

// One sticky note with explicit action buttons (complete/undo/edit/delete) so it
// works for keyboard and pointer users alike.
export default function StickyNote({ todo, windEnabled, onComplete, onUncomplete, onEdit, onDelete }) {
  const done = todo.status === "done";

  const rot = rotationFor(todo.id);
  const style = { "--rot": `${rot}deg`, transform: `rotate(${rot}deg)` };

  const colorClass = done ? "note-completed" : noteColorClass(todo.id);
  const flutter = windEnabled && !done ? "note-flutter" : "";

  return (
    <div style={style} className={`sticky-note ${colorClass} ${flutter} group select-none h-full overflow-hidden flex flex-col`}>
      {done ? <div className="pushpin pushpin-gray" /> : <div className="pushpin" />}

      {/* Title + priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className={`font-display text-[11px] leading-snug uppercase text-on-surface ${
            done ? "line-through opacity-60" : ""
          }`}
        >
          {todo.title}
        </h3>
        {!done && (
          <span
            className={`shrink-0 mt-1 w-3 h-3 rounded-full ${priorityDotClass(todo.priority)}`}
            title={`Priority: ${todo.priority}`}
          />
        )}
      </div>

      {/* Description */}
      {todo.description && (
        <p className={`font-body text-[18px] leading-tight text-on-surface-variant mb-3 ${done ? "opacity-60" : ""}`}>
          {todo.description}
        </p>
      )}

      {/* Due date */}
      {todo.due_date && (
        <div className="flex items-center gap-1 text-on-surface-variant mb-2">
          <Icon name="calendar_month" className="text-[16px]" />
          <span className="font-label text-[10px]">{todo.due_date}</span>
        </div>
      )}

      {/* Tags */}
      {todo.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {todo.tags.map((t) => (
            <span
              key={t}
              className="font-label text-[9px] bg-white/50 px-2 py-0.5 rounded border border-black/5 text-on-surface-variant"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {done && (
        <div className="stamp-done font-display text-[10px]">DONE</div>
      )}

      {/* Hover actions (also keyboard-focusable). Stop pointerdown so clicking
          a button doesn't start a drag. */}
      <div
        className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {done ? (
          <button className="icon-btn w-8 h-8 bg-white/80 hover:bg-white text-primary shadow-sm" title="Move back to active" onClick={() => onUncomplete(todo)}>
            <Icon name="undo" className="text-[18px]" />
          </button>
        ) : (
          <>
            <button className="icon-btn w-8 h-8 bg-white/80 hover:bg-white text-primary shadow-sm" title="Complete" onClick={() => onComplete(todo)}>
              <Icon name="check" className="text-[18px]" />
            </button>
            <button className="icon-btn w-8 h-8 bg-white/80 hover:bg-white text-primary shadow-sm" title="Edit" onClick={() => onEdit(todo)}>
              <Icon name="edit" className="text-[18px]" />
            </button>
          </>
        )}
        <button className="icon-btn w-8 h-8 bg-white/80 hover:bg-white text-error shadow-sm" title="Delete" onClick={() => onDelete(todo)}>
          <Icon name="delete" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
