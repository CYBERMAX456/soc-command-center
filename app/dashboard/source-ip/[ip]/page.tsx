"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SSHEvent = {
  TimeGenerated: string;
  Computer: string;
  HostName: string;
  ProcessName: string;
  Username: string;
  SourceIP: string;
  SourcePort: string;
  SyslogMessage: string;
};

type InvestigationData = {
  source: string;
  sourceIP: string;
  summary: {
    attempts: number;
    firstSeen: string | null;
    lastSeen: string | null;
    targetHost: string;
  };
  events: SSHEvent[];
};

function formatDate(value: string | null) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SourceIPInvestigationPage({
  params,
}: {
  params: Promise<{ ip: string }>;
}) {
  const [data, setData] = useState<InvestigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvestigation() {
      try {
        const { ip } = await params;

        const response = await fetch(
          `/api/security/source-ip/${encodeURIComponent(ip)}`
        );

        if (!response.ok) {
          throw new Error("Failed to load source IP investigation");
        }

        const result = await response.json();

        setData(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load source IP investigation data.");
      } finally {
        setLoading(false);
      }
    }

    loadInvestigation();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <p className="mt-4 text-sm text-slate-500">
            Loading source IP investigation...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-5xl rounded-xl border border-red-500/20 bg-red-500/5 p-8">
          <h1 className="text-xl font-semibold text-red-400">
            Investigation unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "No investigation data was found."}
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-400"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const usernames = Array.from(
    new Set(
      data.events
        .map((event) => event.Username)
        .filter((username) => username)
    )
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 transition hover:text-cyan-400"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />

                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  SSH Source Investigation
                </span>
              </div>

              <h1 className="mt-3 font-mono text-3xl font-bold tracking-tight">
                {data.sourceIP}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Failed SSH authentication activity observed on the SOC Linux
                VM.
              </p>
            </div>

            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Data Source
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Azure Log Analytics
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              SSH Attempts
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {data.summary.attempts}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Target Host
            </p>

            <p className="mt-2 font-mono text-lg font-semibold text-slate-200">
              {data.summary.targetHost}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              First Seen
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(data.summary.firstSeen)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Last Seen
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {formatDate(data.summary.lastSeen)}
            </p>
          </div>
        </div>

        {/* Attempted usernames */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-slate-200">
              Attempted Usernames
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Usernames observed in invalid SSH authentication attempts
            </p>
          </div>

          <div className="flex flex-wrap gap-2 p-6">
            {usernames.length > 0 ? (
              usernames.map((username) => (
                <span
                  key={username}
                  className="rounded-md border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 font-mono text-sm text-yellow-400"
                >
                  {username}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">
                No usernames extracted
              </span>
            )}
          </div>
        </section>

        {/* Timeline */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-slate-200">
              SSH Activity Timeline
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Recent authentication events associated with this source IP
            </p>
          </div>

          <div className="divide-y divide-slate-800">
            {data.events.map((event, index) => (
              <div
                key={`${event.TimeGenerated}-${index}`}
                className="px-6 py-5 transition hover:bg-slate-900"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/5 text-xs text-red-400">
                      SSH
                    </div>

                    <div>
                      <p className="font-mono text-sm text-red-400">
                        Invalid SSH User
                      </p>

                      <p className="mt-1 text-sm text-slate-300">
                        Username attempted:{" "}
                        <span className="font-mono text-yellow-400">
                          {event.Username || "Unknown"}
                        </span>
                      </p>

                      <p className="mt-2 break-all font-mono text-xs text-slate-600">
                        {event.SyslogMessage}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 lg:text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Event Time
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(event.TimeGenerated)}
                    </p>

                    <p className="mt-2 font-mono text-xs text-slate-500">
                      Source port:{" "}
                      <span className="text-slate-300">
                          {event.SourcePort || "Unknown"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evidence */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-slate-200">
              Investigation Evidence
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Source telemetry used during investigation
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Source IP
              </p>

              <p className="mt-2 font-mono text-sm text-cyan-400">
                {data.sourceIP}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Process
              </p>

              <p className="mt-2 font-mono text-sm text-slate-300">
                sshd
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Host
              </p>

              <p className="mt-2 font-mono text-sm text-slate-300">
                {data.summary.targetHost}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-400"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}