// Thin client for the FastAPI todo API. One function per endpoint so the rest
// of the app never builds URLs or handles fetch details itself.

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ROOT = `${BASE}/api/todos`;

async function handle(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {
      /* body wasn't JSON */
    }
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  // DELETE returns 204 No Content.
  return res.status === 204 ? null : res.json();
}

export function listTodos({ status, priority, sort } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return fetch(qs ? `${ROOT}?${qs}` : ROOT).then(handle);
}

export function createTodo(data) {
  return fetch(ROOT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updateTodo(id, data) {
  return fetch(`${ROOT}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deleteTodo(id) {
  return fetch(`${ROOT}/${id}`, { method: "DELETE" }).then(handle);
}
