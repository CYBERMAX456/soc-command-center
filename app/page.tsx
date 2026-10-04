import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 font-black text-slate-950">
              S
            </div>

            <div>
              <h1 className="font-bold tracking-wide">
                SOC Command Center
              </h1>
              <p className="text-xs text-slate-500">
                Security Operations Platform
              </p>
            </div>
          </div>

          <Link
            href="/auth"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium transition hover:border-cyan-400 hover:text-cyan-400"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-81px)] items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">

            {/* Status badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Security Operations Platform Online
            </div>

            {/* Heading */}
            <h2 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">
              Monitor.
              <span className="block text-cyan-400">
                Detect. Investigate.
              </span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              A centralized Security Operations Center platform for
              monitoring security telemetry, detecting threats, analyzing
              incidents, and investigating suspicious activity.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth"
                className="rounded-lg bg-cyan-400 px-7 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Enter SOC Command Center →
              </Link>

              <a
                href="#features"
                className="rounded-lg border border-slate-700 px-7 py-3.5 font-semibold text-slate-300 transition hover:bg-slate-900"
              >
                Explore Platform
              </a>
            </div>
          </div>

          {/* Features */}
          <div
            id="features"
            className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3"
          >
            <FeatureCard
              number="01"
              title="Threat Detection"
              description="Identify suspicious authentication, process, DNS, and other security activity."
            />

            <FeatureCard
              number="02"
              title="Security Analytics"
              description="Analyze security telemetry, source IPs, events, and detection activity."
            />

            <FeatureCard
              number="03"
              title="Incident Investigation"
              description="Investigate alerts and incidents using timelines, evidence, and MITRE ATT&CK."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-6 text-center text-sm text-slate-600">
        SOC Command Center • Security Operations Platform
      </footer>
    </main>
  );
}

function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur transition hover:border-cyan-500/40">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-bold text-cyan-400">{number}</span>

        <div className="h-2 w-2 rounded-full bg-cyan-400 opacity-50 transition group-hover:opacity-100" />
      </div>

      <h3 className="text-lg font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}