"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Shield,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { SessionProvider } from "@/components/SessionProvider";
import { PHASE_1 } from "@/lib/phase";

const inputBase =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent";

function TextField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon: Icon,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${inputBase} pl-10`}
        />
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
          placeholder="••••••••••••"
          autoComplete={autoComplete}
          className={`${inputBase} px-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {capsLock && (
        <span className="mt-1.5 block text-xs text-amber-600">
          Caps Lock is on
        </span>
      )}
    </div>
  );
}

function AdminLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [loading, setLoading] = useState(false);
  const [greetingState, setGreetingState] = useState<"idle" | "greeting" | "success">("idle");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Target panel destination based on active Phase
  const targetRoute = PHASE_1 ? "/admin/posts" : "/admin/dashboard";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Already logged in — go straight to the admin panel, no intermediate card.
  useEffect(() => {
    if (status === "authenticated") {
      router.push(targetRoute);
    }
  }, [status, router, targetRoute]);

  const hour = new Date().getHours();
  const rawGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const timeOfDayGreeting = mounted ? rawGreeting : "Welcome";

  function adminMessage(): string {
    return step === "otp"
      ? "Invalid code. Check your authenticator app and try again."
      : "Invalid email or password.";
  }

  async function submit(otpCode: string) {
    setLoading(true);
    setGreetingState("greeting");
    setError("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        otp: otpCode,
        redirect: false,
      });

      if (!res) {
        setGreetingState("idle");
        return { needOtp: false, ok: false, message: adminMessage() };
      }

      if (typeof res === "object" && "error" in res && res.error) {
        setGreetingState("idle");
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
        if (errStr === "DB_UNAVAILABLE" || errStr.includes("DB_UNAVAILABLE")) {
          return {
            needOtp: false,
            ok: false,
            message:
              "Database is unavailable right now. Check the Supabase connection (DATABASE_URL) and try again.",
          };
        }
        return { needOtp: false, ok: false, message: adminMessage() };
      }

      if (typeof res === "object" && "ok" in res && res.ok === false) {
        setGreetingState("idle");
        return { needOtp: false, ok: false, message: adminMessage() };
      }

      setGreetingState("success");
      return { needOtp: false, ok: true, message: "" };
    } catch (err: unknown) {
      setGreetingState("idle");
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
      if (errMsg.includes("DB_UNAVAILABLE")) {
        return {
          needOtp: false,
          ok: false,
          message:
            "Database is unavailable right now. Check the Supabase connection (DATABASE_URL) and try again.",
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
      setTimeout(() => {
        router.push(targetRoute);
      }, 1100);
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
      setTimeout(() => {
        router.push(targetRoute);
      }, 1100);
    } else if (r.message) {
      setError(r.message);
    }
  }

  return (
    <div className="admin-panel min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ---- Left: brand panel with luxury animated vectors ---- */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#060b26] via-[#0A1930] to-[#04081c] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          {/* Animated geometric vector & orb layer */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {/* Soft glowing ambient orbs */}
            <div className="login-orb absolute -left-20 -top-20 h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-3xl" />
            <div className="login-orb login-orb-2 absolute -bottom-24 -right-20 h-[34rem] w-[34rem] rounded-full bg-brand-light/30 blur-3xl" />

            {/* Concentric rotating vector rings */}
            <svg className="login-ring absolute -right-32 top-1/4 h-[32rem] w-[32rem] text-white/10" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 2" />
              <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.4" />
              <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="0.4" />
            </svg>

            {/* Floating diamond particles */}
            <div className="login-shape absolute left-16 top-28 h-3.5 w-3.5 rotate-45 bg-accent/50 blur-[0.5px]" />
            <div className="login-shape absolute left-1/3 bottom-44 h-2 w-2 rotate-45 bg-white/40" />
            <div className="login-shape login-orb-2 absolute right-20 top-20 h-3 w-3 rotate-45 bg-accent/70" />

            {/* Precision dotted matrix */}
            <div
              className="absolute inset-x-0 bottom-0 h-80 opacity-15"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
            />
          </div>

          {/* Top Brand Mark */}
          <div className="relative flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent font-display text-lg font-bold text-accent-foreground shadow-lg shadow-accent/20">
              SL
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight tracking-wide">Sagar Lad</p>
              <p className="text-xs text-white/60">Admin Suite</p>
            </div>
          </div>

          {/* Main Hero Banner & Personalized Quote */}
          <div className="relative max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
              <span>{timeOfDayGreeting}, Sagar Lad</span>
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
              Your ideas,
              <br />
              crafted &amp;
              <br />
              <span className="text-accent">published.</span>
            </h1>
            <p className="text-sm leading-relaxed text-white/75">
              Welcome to your publishing platform. Manage your blog articles, books, video series, and newsletters in one quiet, minimal space.
            </p>
          </div>

          {/* Footer */}
          <p className="relative text-xs text-white/40">
            © {new Date().getFullYear()} Sagar Lad · Encrypted Administrator Access
          </p>
        </aside>

        {/* ---- Right: Login Form & Active Session Handler ---- */}
        <main className="flex items-center justify-center px-4 py-12 sm:px-8 bg-background">
          <div className="w-full max-w-md">
            {/* Mobile brand header */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent font-display text-lg font-bold text-accent-foreground">
                SL
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-tight">Sagar Lad</p>
                <p className="text-xs text-muted-foreground">Admin panel</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card card-grad p-8 shadow-xl shadow-muted/50 transition-all duration-300 sm:p-10">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Shield className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  Sagar Lad Admin
                </span>
              </div>

              {status === "authenticated" ? (
                /* ---- Already logged in: redirect in progress ---- */
                <div className="mt-6 space-y-5 animate-fade-in">
                  <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-accent">Signed in as {session?.user?.name || "Sagar Lad"}</p>
                      <p className="text-xs text-muted-foreground">Redirecting to admin panel…</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ---- Credentials / OTP Form ---- */
                <>
                  <h2 className="mt-5 font-display text-2xl font-bold">
                    {step === "otp" ? "Two-factor verification" : "Admin Sign In"}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step === "otp"
                      ? "Enter your 6-digit authenticator code to proceed."
                      : "Welcome back — sign in to continue to your admin suite."}
                  </p>

                  {/* Success / Greeting Feedback Overlay */}
                  {greetingState === "success" && (
                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-accent animate-fade-in">
                      <CheckCircle2 className="h-5 w-5 shrink-0 animate-bounce" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">Welcome back</p>
                        <p className="text-sm font-semibold">Admin Sagar Lad</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    {step === "credentials" ? (
                      <form onSubmit={onCredentialsSubmit} className="space-y-4" noValidate>
                        <TextField
                          id="email"
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={setEmail}
                          placeholder="sagar@sagarlad.com"
                          autoComplete="username"
                          icon={Mail}
                        />
                        <PasswordField
                          id="password"
                          label="Password"
                          value={password}
                          onChange={setPassword}
                          autoComplete="current-password"
                        />

                        {error && (
                          <p className="flex items-center gap-1.5 text-sm text-red-600 animate-fade-in" role="alert">
                            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={loading || greetingState === "success"}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 shadow-md shadow-accent/20"
                        >
                          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                          {greetingState === "greeting"
                            ? "Signing in..."
                            : greetingState === "success"
                              ? "Access Granted"
                              : "Sign In"}
                        </button>

                        <p className="pt-1 text-center text-xs text-muted-foreground">
                          Protected by encrypted credentials · Admin access only
                        </p>
                      </form>
                    ) : (
                      <form onSubmit={onOtpSubmit} className="space-y-4" noValidate>
                        <div>
                          <label htmlFor="otp" className="mb-1.5 block text-sm font-medium">
                            Authentication code
                          </label>
                          <div className="relative">
                            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                            <input
                              id="otp"
                              inputMode="text"
                              autoComplete="one-time-code"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                              placeholder="000000"
                              className={`${inputBase} pl-10 text-center font-mono text-lg tracking-[0.5em]`}
                              autoFocus
                              required
                            />
                          </div>
                        </div>

                        {error && (
                          <p className="flex items-center gap-1.5 text-sm text-red-600 animate-fade-in" role="alert">
                            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={loading || greetingState === "success"}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 shadow-md shadow-accent/20"
                        >
                          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                          {greetingState === "greeting" ? "Verifying..." : greetingState === "success" ? "Access Granted" : "Verify & Sign In"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStep("credentials");
                            setError("");
                          }}
                          className="inline-flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ChevronLeft className="h-4 w-4" /> Back to email &amp; password
                        </button>
                      </form>
                    )}
                  </div>
                </>
              )}
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