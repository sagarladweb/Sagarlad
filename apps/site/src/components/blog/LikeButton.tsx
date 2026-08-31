"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";

function getClientToken(): string {
  if (typeof window === "undefined") return "";
  const key = "blog_client_token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
    localStorage.setItem(key, token);
  }
  return token;
}

function getLikedPosts(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("liked_posts");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLikedPosts(liked: Set<string>) {
  localStorage.setItem("liked_posts", JSON.stringify([...liked]));
}

export function LikeButton({
  slug,
  initialLikes,
}: {
  slug: string;
  initialLikes: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLiked(getLikedPosts().has(slug));
    setLoading(false);
  }, [slug]);

  const toggle = useCallback(async () => {
    if (loading) return;

    const wasLiked = liked;
    const newLiked = !wasLiked;
    const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);

    // Optimistic update
    setLiked(newLiked);
    setLikes(newLikes);

    const likedPosts = getLikedPosts();
    if (newLiked) {
      likedPosts.add(slug);
    } else {
      likedPosts.delete(slug);
    }
    saveLikedPosts(likedPosts);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug: slug,
          clientToken: getClientToken(),
          action: newLiked ? "like" : "unlike",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
      }
    } catch {
      // Revert on network error
      setLiked(wasLiked);
      setLikes(likes);
      if (wasLiked) {
        likedPosts.add(slug);
      } else {
        likedPosts.delete(slug);
      }
      saveLikedPosts(likedPosts);
    }
  }, [slug, likes, liked, loading]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        liked
          ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      aria-label={liked ? `Unlike (${likes})` : `Like (${likes})`}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-transform ${liked ? "fill-red-500 text-red-500 scale-110" : ""}`}
      />
      {likes.toLocaleString()}
    </button>
  );
}
