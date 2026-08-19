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
    <div className="admin-panel min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ---- Left: brand panel with animated vectors ---- */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand via-brand to-[#060d4d] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          {/* Geometric vector layer (light, gentle animation) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {/* soft glows */}
            <div className="login-orb absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-light/30 blur-3xl" />
            <div className="login-orb login-orb-2 absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
            {/* concentric rings */}
            <svg className="login-ring absolute -right-24 top-1/3 h-[26rem] w-[26rem] text-white/10" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.4" />
              <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.4" />
              <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.4" />
            </svg>
            {/* floating diamonds */}
            <div className="login-shape absolute left-12 top-24 h-3 w-3 rotate-45 bg-white/30" />
            <div className="login-shape absolute left-1/3 bottom-40 h-2 w-2 rotate-45 bg-accent/60" />
            <div className="login-shape login-orb-2 absolute right-16 top-16 h-2.5 w-2.5 rotate-45 bg-white/40" />
            {/* dotted grid */}
            <div
              className="absolute inset-x-0 bottom-0 h-64 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            />
          </div>

          {/* brand mark */}
          <div className="relative flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent font-display text-lg font-bold text-accent-foreground">
              SL
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight">Sagar Lad</p>
              <p className="text-xs text-white/60">Admin panel</p>
            </div>
          </div>

          {/* pitch */}
          <div className="relative max-w-md">
            <h1 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
              Your ideas,
              <br />
              beautifully
              <br />
              <span className="text-accent">published.</span>
            </h1>
            <p className="mt-6 text-sm leading-relaxed text-white/70">
              Write, shape and ship your blog posts, books and newsletters — one calm
              place for everything you share with the world.
            </p>
          </div>

          {/* footer */}
          <p className="relative text-xs text-white/40">
            © {new Date().getFullYear()} Sagar Lad · Restricted access
          </p>
        </aside>

        {/* ---- Right: login form ---- */}
        <main className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-sm">
            {/* mobile brand header */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent font-display text-lg font-bold text-accent-foreground">
                SL
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-tight">Sagar Lad</p>
                <p className="text-xs text-muted-foreground">Admin panel</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-muted/60">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Shield className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">
                {step === "otp" ? "Two-factor authentication" : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {step === "otp"
                  ? "Enter your 6-digit authenticator code, or a one-time recovery code."
                  : "Sign in to manage your content."}
              </p>

              <div className="mt-8">
                {step === "credentials" ? (
                  <form onSubmit={onCredentialsSubmit} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
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
                      <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
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
                        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Continue
                    </button>
                  </form>
                ) : (
                  <form onSubmit={onOtpSubmit} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="otp" className="mb-1.5 block text-sm font-medium">
                        Authentication code
                      </label>
                      <input
                        id="otp"
                        inputMode="text"
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                        placeholder="000000"
                        className={`${input} text-center font-mono text-lg tracking-[0.5em]`}
                        autoFocus
                        required
                      />
                    </div>

                    {error && (
                      <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
                        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Verify &amp; Sign in
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep("credentials");
                        setError("");
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ChevronLeft className="h-4 w-4" /> Use a different account
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
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
