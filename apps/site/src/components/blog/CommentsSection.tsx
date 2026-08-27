"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/site";
import { CommentForm } from "@/components/blog/CommentForm";

type Comment = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

export function CommentsSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`)
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

  return (
    <div className="mt-14">
      <h2 className="font-display text-2xl font-bold">
        {comments && comments.length > 0
          ? `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`
          : "Add a comment"}
      </h2>

      <div className="mt-6 space-y-4">
        {comments === null ? (
          <p className="text-sm text-muted-foreground">
            {error || "Loading comments…"}
          </p>
        ) : (
          <>
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground">Be the first to comment.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="card-hover rounded-lg border border-border bg-card p-5">
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