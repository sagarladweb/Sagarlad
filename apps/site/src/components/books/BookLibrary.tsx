"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingBag, X, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { validateEmail, validateName } from "@/lib/client-validators";

type BookItem = {
  id: string;
  title: string;
  author: string | null;
  tagline: string | null;
  description: string | null;
  learning: string | null;
  note: string | null;
  imageUrl: string | null;
  buyUrl: string | null;
  free: boolean;
};

type Variant = "published" | "read" | "ebook";

type DownloadTarget = {
  id: string;
  title: string;
  free: boolean;
};

const PER_PAGE = 9;

// Split admin-entered learnings/descriptions into clean bullets. Handles
// newline lists, • / - / * / · markers, and numbered lists.
function toBullets(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-•*·▪◦►]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

export function BookLibrary({ books, variant }: { books: BookItem[]; variant: Variant }) {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<BookItem | null>(null);
  const [target, setTarget] = useState<DownloadTarget | null>(null);

  // Download form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageCount = Math.max(1, Math.ceil(books.length / PER_PAGE));
  const paged = books.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    if (!active && !target) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setActive(null), setTarget(null));
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, target]);

  const ctaLabel = () =>
    variant === "published" ? "Get your Copy" : variant === "ebook" ? "Download" : "Buy this Book";

  const openDownload = (b: BookItem) => {
    setTarget({ id: b.id, title: b.title, free: b.free });
    setActive(null);
    setError(null);
  };

  const resetForm = () => {
    setTarget(null);
    setName("");
    setEmail("");
    setAcceptedTerms(false);
    setSubscribe(false);
    setError(null);
    setSubmitting(false);
  };

  const submitDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setError(null);
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (!acceptedTerms) {
      setError("You must accept the Privacy Policy and Terms");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/ebooks/download/${target.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, acceptedTerms, subscribe }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const fileName = match?.[1] ?? `${target.title.replace(/\s+/g, "-")}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      resetForm();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      {books.length === 0 ? (
        <p className="text-center text-muted-foreground">No titles yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
          {paged.map((book) => (
            <article key={book.id} className="group flex h-full flex-col text-center">
              <button
                type="button"
                onClick={() => setActive(book)}
                aria-label={`View details for ${book.title}`}
                className="relative mx-auto aspect-[3/4] w-full max-w-[260px] text-left focus-visible:outline-none"
              >
                {book.imageUrl ? (
                  <Image
                    src={book.imageUrl}
                    alt={book.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                    className="object-contain drop-shadow-xl transition-transform duration-500 group-hover:-translate-y-1.5"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center rounded-xl bg-muted p-6">
                    <span className="font-display font-bold text-muted-foreground">{book.title}</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActive(book)}
                className="mt-5 focus-visible:outline-none"
              >
                {book.tagline || book.author ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-strong">
                    {variant === "read" ? book.author : book.tagline}
                  </p>
                ) : null}
                <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-accent-strong">
                  {book.title}
                </h3>
              </button>

              {(book.description || book.learning) && (
                variant === "read" && book.learning ? (
                  <ul className="mx-auto mt-2 max-w-sm text-left text-sm leading-relaxed text-muted-foreground line-clamp-2 list-disc pl-4">
                    {toBullets(book.learning).slice(0, 3).map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {book.description}
                  </p>
                )
              )}

              <div className="mt-auto pt-4">
                {variant === "ebook" ? (
                  <button
                    type="button"
                    onClick={() => openDownload(book)}
                    className="btn-premium inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                ) : variant === "read" ? null : (
                  <a
                    href={book.buyUrl ?? "#"}
                    data-no-modal
                    onClick={(e) => !book.buyUrl && e.preventDefault()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {ctaLabel()}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-label={`Page ${n}`}
              aria-current={n === page ? "page" : undefined}
              className={`h-9 w-9 rounded-full text-sm font-semibold transition-colors ${
                n === page
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            aria-label="Next page"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}

      {/* Detail modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActive(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            className="relative grid w-full max-w-3xl max-h-[85vh] grid-cols-1 overflow-y-auto rounded-xl border border-border bg-background shadow-2xl sm:grid-cols-2"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-full border border-border bg-background/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center p-8 sm:p-10">
              {active.imageUrl ? (
                <div className="relative aspect-[3/4] w-full max-w-[280px]">
                  <Image
                    src={active.imageUrl}
                    alt={active.title}
                    fill
                    sizes="(max-width: 640px) 60vw, 280px"
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              ) : (
                <div className="grid aspect-[3/4] w-full max-w-[280px] place-items-center rounded-xl bg-muted p-6">
                  <span className="font-display font-bold text-muted-foreground">{active.title}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col p-8 pt-4 sm:border-l sm:border-border sm:p-10 sm:pl-8">
              {active.tagline || active.author ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-strong">
                  {variant === "read" ? `By ${active.author}` : active.tagline}
                </p>
              ) : (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-strong">
                  {variant === "ebook" ? (active.free ? "Free eBook" : "Premium eBook") : "Book"}
                </p>
              )}
              <h2 className="mt-2 font-display text-2xl font-bold leading-snug">{active.title}</h2>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {variant === "read" && active.learning && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand">Learnings from this book</p>
                    <ul className="space-y-1.5 list-disc pl-4 text-xs font-medium text-foreground/90">
                      {toBullets(active.learning).map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(variant === "published" || variant === "ebook") && active.description && (
                  <div>
                    {toBullets(active.description).length > 1 ? (
                      <ul className="space-y-1.5 list-disc pl-4 text-xs font-normal">
                        {toBullets(active.description).map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{active.description}</p>
                    )}
                  </div>
                )}
              </div>

              {variant === "ebook" ? (
                <div className="mt-auto pt-8">
                  <button
                    type="button"
                    onClick={() => openDownload(active)}
                    className="btn-premium inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              ) : variant !== "read" && active.buyUrl ? (
                <a
                  href={active.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 pt-8"
                  onClick={() => setActive(null)}
                >
                  <span className="btn-premium inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90">
                    <ShoppingBag className="h-4 w-4" />
                    Buy Now
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Download gate modal */}
      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Download eBook"
            className="relative w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={resetForm}
              aria-label="Close"
              className="btn-premium absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-brand text-white">
              <Download className="h-5 w-5" />
            </div>
            <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-strong">
              {target.free ? "Free eBook" : "eBook"}
            </p>
            <h2 className="mt-2 text-center font-display text-2xl font-bold leading-snug">
              Download your copy
            </h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">{target.title}</p>

            <div className="my-6 border-t border-border" />

            <form onSubmit={submitDownload} className="space-y-4" noValidate>
              <div>
                <label htmlFor="ebook-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </label>
                <input
                  id="ebook-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label htmlFor="ebook-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  id="ebook-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribe}
                  onChange={(e) => setSubscribe(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Subscribe to my newsletter for money, life and career insights.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  I have read and agree to the{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                    Terms &amp; Conditions
                  </a>
                  .
                </span>
              </label>

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !acceptedTerms}
                className="btn-premium inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {submitting ? "Preparing…" : "Download"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}