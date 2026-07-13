// Small helpers to give each note a stable paper color and tilt derived from
// its id, so a note looks the same across re-renders (no random jitter).

const COLORS = ["note-yellow", "note-pink", "note-mint", "note-lavender"];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function noteColorClass(id) {
  return COLORS[hash(id) % COLORS.length];
}

// Stable rotation in the range [-3deg, 3deg].
export function rotationFor(id) {
  return ((hash(id) % 61) - 30) / 10; // -3.0 .. 3.0
}

export const PRIORITIES = ["low", "medium", "high"];

export function priorityDotClass(priority) {
  return `prio-${priority}`;
}
