"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Incident = {
  IncidentNumber: number;
  Title: string;
  Severity: string;
  Status: string;
  TimeGenerated: string;
  CreatedTime: string;
  FirstActivityTime: string;
  LastActivityTime: string;
  Description: string;
  ProviderName: string;
  AlertIds: string;
  AdditionalData: string;
};

type IncidentMeta = {
  alertsCount?: number;
  tactics?: string[];
  techniques?: string[];
  alertProductNames?: string[];
};

function parseAdditionalData(value: string): IncidentMeta {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function formatTactic(tactic: string) {
  return tactic
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function severityClasses(severity: string) {
  switch (severity?.toLowerCase()) {
    case "high":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    case "medium":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

    case "low":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";

    case "informational":
      return "border-slate-500/30 bg-slate-500/10 text-slate-400";

    default:
      return "border-slate-700 bg-slate-800 text-slate-300";
  }
}

function statusClasses(status: string) {
  switch (status?.toLowerCase()) {
    case "new":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";

    case "active":
      return "border-orange-500/30 bg-orange-500/10 text-orange-400";

    default:
      return "border-slate-700 bg-slate-800 text-slate-400";
  }
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIncidents() {
      try {
        setLoading(true);

        const response = await fetch("/api/security/incidents");

        if (!response.ok) {
          throw new Error("Failed to load incidents");
        }

        const data = await response.json();

        setIncidents(data.incidents || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load Sentinel incidents.");
      } finally {
        setLoading(false);
      }
    }

    loadIncidents();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 transition hover:text-cyan-400"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Incident Queue
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Microsoft Sentinel security incidents requiring investigation
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <span className="text-xs font-medium text-cyan-400">
              SENTINEL LIVE
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Open Incidents
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-100">
              {loading ? "—" : incidents.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Medium Severity
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {loading
                ? "—"
                : incidents.filter(
                    (incident) =>
                      incident.Severity?.toLowerCase() === "medium"
                  ).length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              High Severity
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {loading
                ? "—"
                : incidents.filter(
                    (incident) => incident.Severity?.toLowerCase() === "high"
                  ).length}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

            <p className="mt-4 text-sm text-slate-500">
              Loading incidents from Microsoft Sentinel...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="font-semibold text-red-400">
              Incident retrieval failed
            </p>

            <p className="mt-2 text-sm text-slate-500">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && incidents.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center">
            <p className="text-lg font-semibold text-slate-300">
              No open incidents
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Microsoft Sentinel currently has no New or Active incidents.
            </p>
          </div>
        )}

        {/* Incident list */}
        {!loading && !error && incidents.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="border-b border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-200">
                    Active Investigations
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    New and active incidents from Microsoft Sentinel
                  </p>
                </div>

                <span className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                  {incidents.length} incidents
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-800">
              {incidents.map((incident) => {
                const meta = parseAdditionalData(incident.AdditionalData);

                const tactic =
                  meta.tactics && meta.tactics.length > 0
                    ? formatTactic(meta.tactics[0])
                    : "Unknown";

                const technique =
                  meta.techniques && meta.techniques.length > 0
                    ? meta.techniques[0]
                    : "Not mapped";

                return (
                  <div
                    key={incident.IncidentNumber}
                    className="group px-6 py-5 transition hover:bg-slate-900"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* Main incident information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-slate-600">
                            INC-{String(incident.IncidentNumber).padStart(
                              4,
                              "0"
                            )}
                          </span>

                          <span
                            className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${severityClasses(
                              incident.Severity
                            )}`}
                          >
                            {incident.Severity}
                          </span>

                          <span
                            className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClasses(
                              incident.Status
                            )}`}
                          >
                            {incident.Status}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-semibold text-slate-200 transition group-hover:text-cyan-400">
                          {incident.Title}
                        </h3>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                          {incident.Description}
                        </p>

                        {/* Metadata */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-400">
                            Tactic:{" "}
                            <span className="text-slate-300">{tactic}</span>
                          </span>

                          <span className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-400">
                            Technique:{" "}
                            <span className="font-mono text-cyan-400">
                              {technique}
                            </span>
                          </span>

                          <span className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-400">
                            Alerts:{" "}
                            <span className="text-slate-300">
                              {meta.alertsCount ?? "—"}
                            </span>
                          </span>

                          <span className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-400">
                            Provider:{" "}
                            <span className="text-slate-300">
                              {incident.ProviderName || "Unknown"}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                        <div className="text-xs text-slate-600">
                          Created
                        </div>

                        <div className="text-xs text-slate-400">
                          {formatDate(incident.CreatedTime)}
                        </div>

                        <Link
                          href={`/dashboard/incidents/${incident.IncidentNumber}`}
                          className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 text-xs font-semibold text-cyan-400 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
                        >
                          Investigate →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}