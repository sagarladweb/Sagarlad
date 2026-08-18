"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/site";
import { CommentForm } from "@/components/blog/CommentForm";
import { getClientToken } from "@/lib/client-token";

type Comment = {
  id: string;
  name: string;
  content: string;
  approved: boolean;
  createdAt: string;
};

export function CommentsSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = getClientToken();
    fetch(
      `/api/comments?postSlug=${encodeURIComponent(postSlug)}&token=${encodeURIComponent(token)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setComments(data.comments);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load comments.");
      });
    return () => {
      cancelled = true;
    };
  }, [postSlug, reload]);

  const afterPosted = useCallback(() => setReload((n) => n + 1), []);

  const approved = comments?.filter((c) => c.approved) ?? [];
  const ownPending = comments?.filter((c) => !c.approved) ?? [];

  return (
    <div className="mt-14">
      <h2 className="font-display text-2xl font-bold">
        {approved.length > 0
          ? `${approved.length} ${approved.length === 1 ? "comment" : "comments"}`
          : "Add a comment"}
      </h2>

      <div className="mt-6 space-y-4">
        {comments === null ? (
          <p className="text-sm text-muted-foreground">
            {error || "Loading comments…"}
          </p>
        ) : (
          <>
            {approved.length === 0 && ownPending.length === 0 && (
              <p className="text-sm text-muted-foreground">Be the first to comment.</p>
            )}
            {ownPending.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-card p-5 opacity-80"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{c.name}</span>
                  <span aria-hidden="true">·</span>
                  <time className="text-muted-foreground text-xs" dateTime={c.createdAt}>
                    {formatDate(new Date(c.createdAt))}
                  </time>
                  <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-semibold">
                    Pending approval
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{c.content}</p>
              </div>
            ))}
            {approved.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{c.name}</span>
                  <span aria-hidden="true">·</span>
                  <time className="text-muted-foreground text-xs" dateTime={c.createdAt}>
                    {formatDate(new Date(c.createdAt))}
                  </time>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{c.content}</p>
              </div>
            ))}
          </>
        )}
      </div>

      <CommentForm postSlug={postSlug} onPosted={afterPosted} />
    </div>
  );
}