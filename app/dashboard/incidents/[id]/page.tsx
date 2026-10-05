"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Alert = {
  SystemAlertId: string;
  TimeGenerated: string;
  AlertName: string;
  AlertSeverity: string;
  Tactics: string;
  Techniques: string;
  CompromisedEntity: string;
  ProviderName: string;
  Description: string;
};

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

type InvestigationData = {
  source: string;
  incident: Incident;
  alertIds: string[];
  alerts: Alert[];
  investigation: {
    alertCount: number;
    host: string;
  };
};

function formatDate(value: string) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function parseTechniques(value: string) {
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

function formatTactic(value: string) {
  if (!value) return "Unknown";

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function severityClasses(severity: string) {
  switch (severity?.toLowerCase()) {
    case "high":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    case "medium":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

    case "low":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";

    default:
      return "border-slate-700 bg-slate-800 text-slate-300";
  }
}

export default function IncidentInvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [data, setData] = useState<InvestigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvestigation() {
      try {
        const { id } = await params;

        const response = await fetch(`/api/security/incidents/${id}`);

        if (!response.ok) {
          throw new Error("Failed to load incident");
        }

        const result = await response.json();

        setData(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load incident investigation data.");
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
            Loading investigation...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-500/20 bg-red-500/5 p-8">
          <h1 className="text-xl font-semibold text-red-400">
            Investigation unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "The requested incident could not be found."}
          </p>

          <Link
            href="/dashboard/incidents"
            className="mt-6 inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-400"
          >
            ← Back to Incidents
          </Link>
        </div>
      </main>
    );
  }

  const incident = data.incident;

  let incidentMeta: {
    tactics?: string[];
    techniques?: string[];
    alertsCount?: number;
  } = {};

  try {
    incidentMeta = JSON.parse(incident.AdditionalData || "{}");
  } catch {
    incidentMeta = {};
  }

  const tactic =
    incidentMeta.tactics && incidentMeta.tactics.length > 0
      ? formatTactic(incidentMeta.tactics[0])
      : "Unknown";

  const technique =
    incidentMeta.techniques && incidentMeta.techniques.length > 0
      ? incidentMeta.techniques[0]
      : "Not mapped";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/dashboard/incidents"
            className="text-sm text-slate-500 transition hover:text-cyan-400"
          >
            ← Back to Incident Queue
          </Link>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-600">
                  INC-{String(incident.IncidentNumber).padStart(4, "0")}
                </span>

                <span
                  className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${severityClasses(
                    incident.Severity
                  )}`}
                >
                  {incident.Severity}
                </span>

                <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  {incident.Status}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight">
                {incident.Title}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {incident.Description}
              </p>
            </div>

            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Investigation
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Microsoft Sentinel
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Severity
            </p>

            <p className="mt-2 text-xl font-bold text-yellow-400">
              {incident.Severity}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Related Alerts
            </p>

            <p className="mt-2 text-xl font-bold text-slate-100">
              {data.alerts.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              MITRE Tactic
            </p>

            <p className="mt-2 text-xl font-bold text-cyan-400">
              {tactic}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Technique
            </p>

            <p className="mt-2 font-mono text-xl font-bold text-cyan-400">
              {technique}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-slate-200">
              Investigation Timeline
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Incident activity timeline from Microsoft Sentinel
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Created
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {formatDate(incident.CreatedTime)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                First Activity
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {formatDate(incident.FirstActivityTime)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Last Activity
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {formatDate(incident.LastActivityTime)}
              </p>
            </div>
          </div>
        </section>

        {/* MITRE */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-slate-200">
              MITRE ATT&CK Mapping
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Detection classification associated with this incident
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Tactic
              </p>

              <p className="mt-2 text-lg font-semibold text-cyan-400">
                {tactic}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Technique
              </p>

              <p className="mt-2 font-mono text-lg font-semibold text-cyan-400">
                {technique}
              </p>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-slate-200">
              Related Security Alerts
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Alerts associated with this Sentinel incident
            </p>
          </div>

          <div className="divide-y divide-slate-800">
            {data.alerts.map((alert) => {
              const techniques = parseTechniques(alert.Techniques);

              return (
                <div key={alert.SystemAlertId} className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-[10px] font-bold uppercase text-yellow-400">
                          {alert.AlertSeverity}
                        </span>

                        <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-mono text-slate-500">
                          {alert.ProviderName}
                        </span>
                      </div>

                      <h3 className="mt-3 font-semibold text-slate-200">
                        {alert.AlertName}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {alert.Description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-md border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                          Tactic:{" "}
                          <span className="text-slate-300">
                            {formatTactic(alert.Tactics)}
                          </span>
                        </span>

                        {techniques.map((item: string) => (
                          <span
                            key={item}
                            className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 font-mono text-xs text-cyan-400"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 text-left lg:text-right">
                      <p className="text-xs uppercase tracking-wider text-slate-600">
                        Alert Time
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(alert.TimeGenerated)}
                      </p>

                      <p className="mt-3 max-w-xs break-all font-mono text-[10px] text-slate-700">
                        {alert.SystemAlertId}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Incident metadata */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-slate-200">
              Incident Metadata
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Incident Number
              </p>

              <p className="mt-2 font-mono text-sm text-slate-300">
                {incident.IncidentNumber}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Provider
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {incident.ProviderName}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Alert IDs
              </p>

              <div className="mt-2 space-y-1">
                {data.alertIds.map((alertId) => (
                  <p
                    key={alertId}
                    className="break-all font-mono text-xs text-slate-500"
                  >
                    {alertId}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Affected Entity
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {data.investigation.host}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <Link
            href="/dashboard/incidents"
            className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-400"
          >
            ← Return to Incident Queue
          </Link>
        </div>
      </section>
    </main>
  );
}