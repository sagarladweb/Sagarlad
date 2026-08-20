"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Pencil,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { SOCIAL_ICONS } from "@/lib/social-icons";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Modal } from "@/components/ui/Modal";

type Social = {
  id: string;
  key: string;
  label: string;
  handle: string | null;
  href: string;
  icon: string;
  logoUrl: string | null;
  color: string | null;
  sortOrder: number;
  active: boolean;
};

type SocialForm = {
  key: string;
  label: string;
  handle: string;
  href: string;
  icon: string;
  logoUrl: string;
  color: string;
  sortOrder: number;
  active: boolean;
};

const inputCls =
  "rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent w-full";

export function SocialManager() {
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/socials");
      if (res.ok) {
        const data = await res.json();
        setSocials(data.socials);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(s: Social) {
    setEditing({
      key: s.key,
      label: s.label,
      handle: s.handle ?? "",
      href: s.href,
      icon: s.icon,
      logoUrl: s.logoUrl ?? "",
      color: s.color ?? "",
      sortOrder: s.sortOrder,
      active: s.active,
    });
    setEditingId(s.id);
    setError("");
    setOk("");
  }

  function cancelEdit() {
    setEditing(null);
    setEditingId(null);
    setError("");
  }

  async function handlePastedImage(dataUrl: string) {
    if (!editing) return;
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, folder: "social" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setEditing({ ...editing, logoUrl: data.url });
      } else {
        setOk("");
        setError(data.error ?? "Could not upload pasted logo.");
      }
    } catch {
      setError("Could not upload pasted logo.");
    }
  }

  async function save() {
    if (!editing || !editing.label.trim() || !editing.href.trim()) {
      setError("Label and link URL are required.");
      return;
    }
    setBusy(true);
    setError("");
    setOk("");
    const payload = {
      id: editingId,
      key: editing.key.trim(),
      label: editing.label.trim(),
      handle: editing.handle.trim() || null,
      href: editing.href.trim(),
      icon: editing.icon || "link",
      logoUrl: editing.logoUrl.trim() || null,
      color: editing.color.trim() || null,
      sortOrder: Number(editing.sortOrder || 0),
      active: editing.active,
    };
    const res = await fetch("/api/admin/socials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setEditing(null);
    setEditingId(null);
    setOk("Social link updated.");
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {socials.length} social link{socials.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}
      {ok && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-600" role="status">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {ok}
        </p>
      )}

      {editing && (
        <Modal
          open
          title="Edit social link"
          onClose={cancelEdit}
          footer={
            <>
              <button
                type="submit"
                form="social-form"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Save changes
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 sm:flex-none rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </>
          }
        >
        <form
          id="social-form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Platform name / Label *</label>
              <input
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                className={inputCls}
                placeholder="Instagram"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Handle / Username</label>
              <input
                value={editing.handle}
                onChange={(e) => setEditing({ ...editing, handle: e.target.value })}
                className={inputCls}
                placeholder="@handle"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">
                Link URL *
              </label>
              <input
                value={editing.href}
                onChange={(e) => setEditing({ ...editing, href: e.target.value })}
                className={inputCls}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Sort order</label>
              <input
                type="number"
                value={editing.sortOrder}
                onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                className={inputCls}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="accent-[var(--accent)] h-4 w-4 rounded"
                />
                Active (visible on site)
              </label>
            </div>
          </div>
        </form>
        </Modal>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : socials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No social links yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {socials.map((s) => {
            const meta = SOCIAL_ICONS[s.icon];
            const Icon = meta?.icon;
            return (
              <li
                key={s.id}
                className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card card-grad p-4 transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-muted overflow-hidden"
                    style={{ color: s.color || meta?.color || "#000" }}
                  >
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : Icon ? (
                      <Icon className="w-5 h-5" />
                    ) : (
                      s.icon
                    )}
                  </span>
                  <button
                    onClick={() => startEdit(s)}
                    aria-label={`Edit ${s.label}`}
                    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground hover:bg-muted"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {s.label}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({s.handle ?? s.key})
                    </span>
                  </p>
                  <p
                    className="mt-0.5 truncate text-xs"
                    style={{ color: s.color || meta?.color || "var(--border)" }}
                  >
                    {s.href}
                  </p>
                </div>
                <span
                  className={
                    s.active
                      ? "mt-auto w-fit rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px]"
                      : "mt-auto w-fit rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[11px]"
                  }
                >
                  {s.active ? "Active" : "Hidden"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}