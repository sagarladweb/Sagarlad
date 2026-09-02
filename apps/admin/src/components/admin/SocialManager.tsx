"use client";

import { useEffect, useState } from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { SOCIAL_ICONS } from "@/lib/social-icons";
import { Modal } from "@/components/ui/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { inputCls } from "@/components/ui/Input";
import { showToast } from "@/components/admin/Toast";

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

export function SocialManager() {
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
  }

  function cancelEdit() {
    setEditing(null);
    setEditingId(null);
  }

  async function save() {
    if (!editing || !editing.label.trim() || !editing.href.trim()) {
      showToast("Label and link URL are required.", undefined, "error");
      return;
    }
    setBusy(true);
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
      showToast(data.error ?? "Something went wrong.", undefined, "error");
      return;
    }
    setEditing(null);
    setEditingId(null);
    showToast("Social link updated.");
    await load();
  }

  async function toggleActive(s: Social) {
    setBusy(true);
    const res = await fetch("/api/admin/socials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: s.id,
        key: s.key,
        label: s.label,
        handle: s.handle,
        href: s.href,
        icon: s.icon,
        logoUrl: s.logoUrl,
        color: s.color,
        sortOrder: s.sortOrder,
        active: !s.active,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      showToast(data.error ?? "Could not update visibility.", undefined, "error");
      return;
    }
    showToast(s.active ? `"${s.label}" hidden from site.` : `"${s.label}" now visible on site.`);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {socials.filter((s) => s.active).length} visible / {socials.length} total
        </p>
      </div>

      {editing && (
        <Modal
          open
          title="Edit social link"
          onClose={cancelEdit}
          footer={
            <>
              <Button type="submit" form="social-form" disabled={busy} loading={busy}>
                Save changes
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit} className="flex-1 sm:flex-none">
                Cancel
              </Button>
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
                className={`group relative flex flex-col gap-3 rounded-2xl border bg-card social-grad p-4 transition-all ${
                  s.active
                    ? "border-border hover:shadow-lg"
                    : "border-dashed opacity-50 hover:opacity-75"
                }`}
                style={{ "--social-color": s.color || meta?.color || "var(--brand-light)" } as React.CSSProperties}
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
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconButton
                      onClick={() => toggleActive(s)}
                      title={s.active ? `Hide "${s.label}" from site` : `Show "${s.label}" on site`}
                      variant={s.active ? "secondary" : "ghost"}
                    >
                      {s.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    </IconButton>
                    <IconButton
                      onClick={() => startEdit(s)}
                      title={`Edit ${s.label}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </IconButton>
                  </div>
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
                <StatusBadge active={s.active} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
