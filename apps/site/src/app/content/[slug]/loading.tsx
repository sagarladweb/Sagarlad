"use client";

export default function ContentSlugLoading() {
  return (
    <div className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-20 space-y-6">
        <div className="sk-item h-5 w-24 rounded-full" />
        <div className="sk-item h-10 sm:h-12 w-3/4" />
        <div className="sk-item h-4 w-48" />
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="sk-item h-3.5 w-full" />
              <div className="sk-item h-3.5 w-5/6" />
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
