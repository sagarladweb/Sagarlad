"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "./Toast";
import { showConfirm } from "@/components/admin/ConfirmDialog";
import {
  Megaphone,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  barText: string | null;
  barStyle: string;
  barBgColor: string | null;
  barColor: string | null;
  active: boolean;
  eventDate: string | null;
  createdAt: string;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AnnouncementManager() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      setAnnouncements(data.announcements ?? []);
    } catch {
      showToast("Failed to load announcements", undefined, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    const ok = await showConfirm({ title: "Delete announcement", message: "Delete this announcement? This cannot be undone.", confirmLabel: "Delete" });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Deleted");
      load();
    } catch { showToast("Delete failed", undefined, "error"); }
  }

  async function toggleActive(a: Announcement) {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, active: !a.active }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      showToast(a.active ? "Deactivated" : "Activated");
      load();
    } catch { showToast("Toggle failed", undefined, "error"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground">Manage site announcements and bars</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/announcement/new")}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
        </div>
      )}

      {!loading && announcements.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
          <Megaphone className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">No announcements yet</p>
          <p className="text-xs text-muted-foreground">Create your first announcement to get started</p>
        </div>
      )}

      {!loading && announcements.length > 0 && (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => router.push(`/admin/announcement/${a.id}/edit`)}
            >
              {/* Color indicator */}
              <div
                className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                style={{ backgroundColor: a.barBgColor || "#dbeafe" }}
              >
                <Megaphone className="w-4 h-4" style={{ color: a.barColor || "#1e3a5f" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  {a.active && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 px-2 py-0.5 text-[10px] font-bold">
                      <Eye className="w-2.5 h-2.5" /> Live
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {a.eventDate && (
                    <span className="inline-flex items-center gap-1 mr-2">
                      <CalendarIcon className="w-2.5 h-2.5" />
                      {formatDate(a.eventDate)}
                    </span>
                  )}
                  {a.barText && <span className="mr-2">Bar: &ldquo;{a.barText}&rdquo;</span>}
                  <span>Created {new Date(a.createdAt).toLocaleDateString()}</span>
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => toggleActive(a)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    a.active
                      ? "text-green-600 bg-green-500/10 hover:bg-green-500/20"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  title={a.active ? "Active — click to deactivate" : "Inactive — click to activate"}
                >
                  {a.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/admin/announcement/${a.id}/edit`)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
