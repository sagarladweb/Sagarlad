// Offline mutation queue for the admin panel. Mutations made while offline are
// stored in localStorage and replayed (in order) when the connection returns.
// Order is preserved so a create always lands before its follow-up updates.
//
// ponytail: generic HTTP queue — no conflict resolution, last write wins. If
// two editors edit the same post offline the newest queued version of each
// action wins server-side. Add per-record versioning if multi-editor offline
// editing ever matters.

const KEY = "sl:admin:offline-queue";
export const QUEUE_EVENT = "sl:offline-queue";

export type QueuedRequest = {
  id: string;
  key?: string;
  url: string;
  method: string;
  body: string;
  createdAt: number;
};

export function getQueue(): QueuedRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(queue));
  } catch {
    // Storage full — drop the oldest item so the newest edit is never lost.
    queue.shift();
    try {
      localStorage.setItem(KEY, JSON.stringify(queue));
    } catch {
      /* give up; the caller already has the data in memory */
    }
  }
}

function notify() {
  window.dispatchEvent(new CustomEvent(QUEUE_EVENT, { detail: getQueue().length }));
}

export function enqueue(
  url: string,
  method: string,
  body: unknown,
  key?: string
): number {
  // Same-key items (e.g. the unsaved new-post draft) replace each other so an
  // offline save of the same draft never enqueues duplicate creates.
  let queue = getQueue();
  if (key) queue = queue.filter((item) => item.key !== key);
  queue.push({
    id: crypto.randomUUID(),
    key,
    url,
    method,
    body: typeof body === "string" ? body : JSON.stringify(body),
    createdAt: Date.now(),
  });
  saveQueue(queue);
  notify();
  return queue.length;
}

export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: item.body,
        credentials: "same-origin",
      });
      if (res.ok) {
        synced++;
        queue.splice(i, 1);
        i--;
      } else if (res.status >= 400 && res.status < 500) {
        // Permanent failure (validation, conflict) — drop it so it doesn't
        // loop forever on every reconnect.
        failed++;
        queue.splice(i, 1);
        i--;
      } else {
        failed++;
      }
    } catch {
      // Transient/network error — keep the item for the next attempt.
      failed++;
    }
  }
  saveQueue(queue);
  notify();
  return { synced, failed };
}
