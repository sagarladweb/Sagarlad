"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export type ConfirmRequest = {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
};

let confirmListener: ((request: ConfirmRequest) => void) | null = null;

export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (confirmListener) {
      confirmListener({ options, resolve });
    } else {
      resolve(false);
    }
  });
}

export function ConfirmContainer() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  useEffect(() => {
    confirmListener = (req) => {
      setRequest(req);
    };
    return () => {
      confirmListener = null;
    };
  }, []);

  const close = useCallback(
    (value: boolean) => {
      if (!request) return;
      setRequest(null);
      request.resolve(value);
    },
    [request]
  );

  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [request, close]);

  if (!request) return null;

  const { options } = request;

  return (
    <div
      className="fixed inset-0 z-[150] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={options.title ?? "Confirm action"}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => close(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 fade-in-0">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-bold">
              {options.title ?? "Are you sure?"}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {options.message}
            </p>
          </div>
          <button
            onClick={() => close(false)}
            aria-label="Close"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors -mr-1 -mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => close(false)}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {options.cancelLabel ?? "Cancel"}
          </button>
          <button
            onClick={() => close(true)}
            autoFocus
            className="rounded-full bg-red-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            {options.confirmLabel ?? "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}