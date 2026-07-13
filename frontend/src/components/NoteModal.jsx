import { useState } from "react";
import { PRIORITIES } from "../lib/notes";

// Create/edit dialog styled as an enlarged sticky note. `initial` is a todo for
// editing, or null for a new note. onSave receives the payload; the parent does
// the POST/PATCH.
export default function NoteModal({ initial, onSave, onClose }) {
  const editing = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [priority, setPriority] = useState(initial?.priority ?? "medium");
  const [tags, setTags] = useState(initial?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [error, setError] = useState("");

  function addTag() {
    const t = tagDraft.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagDraft("");
  }

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("A note needs a title.");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      priority,
      tags,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-variant/50 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-2xl note-yellow sticky-note !p-8 md:!p-10 rounded-lg max-h-[90vh] overflow-y-auto"
        style={{ transform: "rotate(-0.5deg)" }}
      >
        <div className="pushpin" />
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-on-surface-variant/10">
          <h2 className="font-display text-[14px] text-primary uppercase">{editing ? "Edit note" : "New note"}</h2>
          <button type="button" onClick={onClose} className="icon-btn w-8 h-8 text-on-surface-variant hover:text-primary" title="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Title */}
        <input
          autoFocus
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(""); }}
          placeholder="What needs doing?"
          maxLength={200}
          className="w-full bg-transparent border-none outline-none font-display text-[15px] leading-relaxed placeholder:text-on-surface-variant/30 mb-2"
        />
        {error && <p className="font-label text-[11px] text-error mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left: description + tags */}
          <div className="space-y-5">
            <label className="block">
              <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Add some details…"
                className="mt-2 w-full bg-white/40 border border-on-surface-variant/10 rounded-xl p-3 font-body text-[18px] outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </label>
            <div>
              <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">Tags</span>
              <div className="mt-2 flex flex-wrap gap-2 p-2 bg-white/40 border border-on-surface-variant/10 rounded-xl min-h-[48px] items-center">
                {tags.map((t) => (
                  <span key={t} className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label text-[10px] flex items-center gap-1">
                    #{t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  onBlur={addTag}
                  placeholder="Add tag…"
                  className="bg-transparent border-none outline-none font-body text-[16px] w-24"
                />
              </div>
            </div>
          </div>

          {/* Right: due date + priority */}
          <div className="space-y-5">
            <label className="block">
              <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-2 w-full bg-white/40 border border-on-surface-variant/10 rounded-xl px-3 py-3 font-body text-[18px] outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <div>
              <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest">Priority</span>
              <div className="mt-2 flex bg-white/40 border border-on-surface-variant/10 rounded-full p-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-full py-2 font-label text-[11px] uppercase transition-colors ${
                      priority === p ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-white/50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-on-surface-variant/10">
          <button type="button" onClick={onClose} className="font-label text-[11px] text-on-surface-variant hover:text-error uppercase">
            Cancel
          </button>
          <button type="submit" className="pixel-btn bg-primary text-on-primary px-8 py-3 text-[11px] uppercase">
            {editing ? "Save" : "Pin it"}
          </button>
        </div>
      </form>
    </div>
  );
}
