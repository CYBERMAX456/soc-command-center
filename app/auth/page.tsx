import Link from "next/link";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

export default function AuthPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-10 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />

      <div className="pointer-events-none absolute left-10 top-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="pointer-events-none absolute bottom-10 right-10 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        {/* Back */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-slate-500 transition hover:text-cyan-400"
        >
          ← Back to Command Center
        </Link>

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-400 text-xl font-black text-slate-950 shadow-lg shadow-cyan-500/20">
            S
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight">
            SOC Command Center
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Secure access to the Security Operations Platform.
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-7 shadow-2xl shadow-black/20 backdrop-blur-xl">

          {/* Status */}
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-cyan-500/10 bg-cyan-500/5 px-4 py-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

            <div>
              <p className="text-xs font-semibold text-slate-300">
                Authentication Service
              </p>

              <p className="text-xs text-slate-500">
                Kinde Identity Platform
              </p>
            </div>
          </div>

          <div className="space-y-3">

            {/* Sign In */}
            <LoginLink postLoginRedirectURL="/dashboard">
              <span className="flex w-full items-center justify-center rounded-lg bg-cyan-400 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300">
                Sign In to SOC →
              </span>
            </LoginLink>

            {/* Sign Up */}
            <RegisterLink postLoginRedirectURL="/dashboard">
              <span className="flex w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-950 py-3.5 font-bold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-400">
                Create SOC Account →
              </span>
            </RegisterLink>

          </div>

          {/* Security notice */}
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex gap-3">
              <span className="mt-0.5 text-cyan-400">
                🔒
              </span>

              <div>
                <p className="text-xs font-semibold text-slate-300">
                  Secure SOC Access
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Authentication is securely handled by Kinde.
                  Your credentials are not processed by the SOC application.
                </p>
              </div>
            </div>
          </div>

          {/* Access information */}
          <div className="mt-5 text-center">
            <p className="text-xs leading-5 text-slate-600">
              Authorized personnel only. Access to security
              monitoring resources is protected and logged.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          SOC Command Center • Security Operations Platform
        </p>
      </div>
    </main>
  );
}