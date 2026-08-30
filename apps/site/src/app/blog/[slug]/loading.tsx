"use client";

export default function BlogSlugLoading() {
  return (
    <div className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-20">
        <div className="space-y-6">
          <div className="sk-item sk-circle h-6 w-24" />
          <div className="sk-item h-10 sm:h-12 w-3/4" />
          <div className="flex items-center gap-4">
            <div className="sk-item sk-circle h-10 w-10" />
            <div className="space-y-1.5">
              <div className="sk-item h-3.5 w-24" />
              <div className="sk-item h-3 w-32" />
            </div>
          </div>
          <div className="sk-item sk-full aspect-video w-full" />
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="sk-item h-3.5 w-full" />
                <div className="sk-item h-3.5 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
