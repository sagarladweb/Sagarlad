"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getClientToken } from "@/lib/client-token";
import { sanitizeText } from "@/lib/client-validators";

export function CommentForm({
  postSlug,
  onPosted,
}: {
  postSlug: string;
  onPosted?: () => void;
}) {
  const [form, setForm] = useState({ name: "", content: "" });
  const [errors, setErrors] = useState<{ name?: string; content?: string }>({});
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  function validate(): boolean {
    const e: typeof errors = {};
    const name = sanitizeText(form.name);
    const content = form.content.trim();
    if (!name || name.length < 2) e.name = "Name is required";
    else if (name.length > 80) e.name = "Name must be under 80 characters";
    if (!content || content.length < 3) e.content = "Comment must be at least 3 characters";
    else if (content.length > 1000) e.content = "Comment must be under 1000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setState("loading");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizeText(form.name),
          content: form.content.trim(),
          postSlug,
          clientToken: getClientToken(),
        }),
      });
      if (res.ok) {
        setState("success");
        setForm({ name: "", content: "" });
        setErrors({});
        setMessage(
          "Thanks! Your comment is queued for approval. It's visible only to you until an admin approves it."
        );
        onPosted?.();
      } else {
        const data = await res.json().catch(() => ({}));
        setState("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-hover mt-8 rounded-lg border border-border bg-card p-6 space-y-4" noValidate>
      <h3 className="font-display text-lg font-bold">Leave a comment</h3>
      <div>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          placeholder="Your name"
          aria-label="Your name"
          required
          className={`w-full rounded-md border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent ${
            errors.name ? "border-red-500" : "border-border"
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>
      <div>
        <textarea
          value={form.content}
          onChange={(e) => {
            setForm({ ...form, content: e.target.value });
            if (errors.content) setErrors({ ...errors, content: undefined });
          }}
          placeholder="Share your thoughts…"
          aria-label="Comment"
          required
          rows={4}
          className={`w-full rounded-md border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent resize-y ${
            errors.content ? "border-red-500" : "border-border"
          }`}
        />
        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{form.content.length}/1000</p>
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="btn-premium inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-2.5 text-sm font-semibold disabled:opacity-60 hover:opacity-90"
      >
        {state === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
        Post comment
      </button>
      {state === "success" && (
        <p className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </p>
      )}
      {state === "error" && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" /> {message}
        </p>
      )}
    </form>
  );
}