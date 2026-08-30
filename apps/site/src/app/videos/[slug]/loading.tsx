"use client";

export default function VideoSlugLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-20">
        <div className="space-y-6">
          <div className="sk-item sk-full aspect-video w-full" />
          <div className="space-y-3">
            <div className="sk-item h-8 w-3/4" />
            <div className="sk-item h-4 w-48" />
            <div className="sk-item h-4 w-full" />
            <div className="sk-item h-4 w-5/6" />
            <div className="sk-item h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
