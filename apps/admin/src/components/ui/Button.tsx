"use client";

import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:brightness-110 shadow-sm hover:shadow-md",
  secondary:
    "border border-border text-foreground hover:border-accent hover:bg-accent/5",
  ghost:
    "text-muted-foreground hover:text-foreground hover:bg-muted",
  danger:
    "text-muted-foreground hover:text-red-600 hover:bg-red-500/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 ease-[var(--ease-spring)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function IconButton({
  variant = "ghost",
  size = "sm",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const padding = size === "sm" ? "p-1.5 rounded-lg" : "p-2 rounded-xl";
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-200 ease-[var(--ease-spring)] disabled:opacity-50 disabled:pointer-events-none active:scale-95 ${padding} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
