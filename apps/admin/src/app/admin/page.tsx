"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Shield, ChevronLeft } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { SessionProvider } from "@/components/SessionProvider";

const input =
  "rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent w-full";

function AdminLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already signed in? Send admin straight to the dashboard.
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
    }
  }, [status, session, router]);

  function adminMessage(): string {
    return step === "otp"
      ? "Invalid code. Check your authenticator app and try again."
      : "Invalid email or password.";
  }

  async function submit(otpCode: string) {
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        otp: otpCode,
        redirect: false,
      });

      if (!res) {
        return { needOtp: false, ok: false, message: adminMessage() };
      }

      if (typeof res === "object" && "error" in res && res.error) {
        const errStr = String(res.error);
        if (errStr === "2FA_REQUIRED" || errStr.includes("2FA_REQUIRED")) {
          return { needOtp: true, ok: false, message: "" };
        }
        if (errStr === "ACCOUNT_LOCKED" || errStr.includes("ACCOUNT_LOCKED")) {
          return {
            needOtp: false,
            ok: false,
            message: "Too many failed attempts. Account locked for 30 minutes.",
          };
        }
        return { needOtp: false, ok: false, message: adminMessage() };
      }

      if (typeof res === "object" && "ok" in res && res.ok === false) {
        return { needOtp: false, ok: false, message: adminMessage() };
      }

      return { needOtp: false, ok: true, message: "" };
    } catch (err: unknown) {
      const errMsg = (err as { message?: string; code?: string })?.message || (err as { code?: string })?.code || "";
      if (errMsg.includes("2FA_REQUIRED")) {
        return { needOtp: true, ok: false, message: "" };
      }
      if (errMsg.includes("ACCOUNT_LOCKED")) {
        return {
          needOtp: false,
          ok: false,
          message: "Too many failed attempts. Account locked for 30 minutes.",
        };
      }
      return { needOtp: false, ok: false, message: adminMessage() };
    } finally {
      setLoading(false);
    }
  }

  async function onCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    const r = await submit("");
    if (r.needOtp) {
      setStep("otp");
      setOtp("");
      setError("");
    } else if (r.ok) {
      gotoDashboard();
    } else if (r.message) {
      setError(r.message);
    }
  }

  async function onOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Enter your 6-digit authenticator code.");
      return;
    }
    const r = await submit(otp.replace(/\s+/g, ""));
    if (r.ok) {
      gotoDashboard();
    } else if (r.message) {
      setError(r.message);
    }
  }

  function gotoDashboard() {
    router.push("/admin/dashboard");
  }

  return (
    <div className="admin-panel min-h-[60vh] grid place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 rounded-full bg-accent text-accent-foreground items-center justify-center font-display font-bold text-xl">
            <Shield className="w-5 h-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">
            {step === "otp" ? "Two-factor authentication" : "Admin sign in"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "otp"
              ? "Enter your 6-digit authenticator code, or a one-time recovery code."
              : "Restricted access. Authorised users only."}
          </p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={onCredentialsSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={onOtpSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-1.5">
                Authentication code
              </label>
              <input
                id="otp"
                inputMode="text"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                placeholder="000000"
                className={`${input} text-center tracking-[0.5em] font-mono text-lg`}
                autoFocus
                required
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify &amp; Sign in
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setError("");
              }}
              className="w-full inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Use a different account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <SessionProvider>
      <AdminLogin />
    </SessionProvider>
  );
}
