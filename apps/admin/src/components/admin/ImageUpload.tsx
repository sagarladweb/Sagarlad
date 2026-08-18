"use client";

import { useRef, useState } from "react";
import { Loader2, ImagePlus, X, AlertCircle } from "lucide-react";

type Props = {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
  folder?: string;
  onPastedDataUrl?: (dataUrl: string) => Promise<void>;
};

export function ImageUpload({ value, onChange, label, folder, onPastedDataUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder ?? "general");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && (
        <span className="block text-sm font-medium mb-1.5">{label}</span>
      )}
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-32 w-48 rounded-xl border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-background border border-border text-muted-foreground hover:text-red-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            onPaste={(e) => {
              e.preventDefault();
              const items = e.clipboardData?.items;
              const img = items && Array.from(items).find((i) => i.type.startsWith("image/"));
              if (img && img.getAsFile) {
                const file = img.getAsFile();
                if (file) handleFile(file);
                return;
              }
              const text = e.clipboardData?.getData("text/plain");
              if (text && text.startsWith("data:image/") && onPastedDataUrl) {
                setUploading(true);
                setError("");
                onPastedDataUrl(text)
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : "Upload failed")
                  )
                  .finally(() => setUploading(false));
                return;
              }
              if (text && onPastedDataUrl) return;
            }}
            className="flex items-center justify-center gap-2 h-32 w-48 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ImagePlus className="w-5 h-5" />
            )}
            {uploading ? "Uploading…" : "Upload or paste"}
          </button>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Tip: copy an image (right-click → Copy image) and paste it here with
            Cmd/Ctrl+V.
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}