"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getClientToken } from "@/lib/client-token";

export function CommentForm({
  postSlug,
  onPosted,
}: {
  postSlug: string;
  onPosted?: () => void;
}) {
  const [form, setForm] = useState({ name: "", content: "" });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, postSlug, clientToken: getClientToken() }),
      });
      if (res.ok) {
        setState("success");
        setForm({ name: "", content: "" });
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
    <form onSubmit={onSubmit} className="mt-8 rounded-2xl border border-border bg-card p-6 space-y-4" noValidate>
      <h3 className="font-display text-lg font-bold">Leave a comment</h3>
      <div>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
          aria-label="Your name"
          required
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <textarea
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        placeholder="Share your thoughts…"
        aria-label="Comment"
        required
        rows={4}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent resize-y"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-2.5 text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
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