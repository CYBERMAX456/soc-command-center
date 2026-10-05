"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Detection = {
  AlertName: string;
  AlertSeverity: string;
  Tactics: string;
  Techniques: string;
  AlertCount: number;
  LatestAlert: string;
};

function formatTactic(value: string) {
  if (!value) return "Unknown";

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function parseTechniques(value: string): string[] {
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

function techniqueName(technique: string) {
  const names: Record<string, string> = {
    T1110: "Brute Force",
    T1548: "Abuse Elevation Control Mechanism",
    T1566: "Phishing",
    "T1059.004": "Unix Shell",
  };

  return names[technique] || "MITRE ATT&CK Technique";
}

function formatDate(value: string) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function tacticClasses(tactic: string) {
  switch (tactic?.toLowerCase()) {
    case "credential access":
      return "border-yellow-500/20 bg-yellow-500/5 text-yellow-400";

    case "privilege escalation":
      return "border-orange-500/20 bg-orange-500/5 text-orange-400";

    case "initial access":
      return "border-red-500/20 bg-red-500/5 text-red-400";

    case "execution":
      return "border-cyan-500/20 bg-cyan-500/5 text-cyan-400";

    default:
      return "border-slate-700 bg-slate-900 text-slate-400";
  }
}

export default function MitrePage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMitreData() {
      try {
        const response = await fetch("/api/security/mitre");

        if (!response.ok) {
          throw new Error("Failed to load MITRE data");
        }

        const data = await response.json();

        setDetections(data.detections || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load MITRE ATT&CK data.");
      } finally {
        setLoading(false);
      }
    }

    loadMitreData();
  }, []);

  const totalAlerts = detections.reduce(
    (total, detection) => total + Number(detection.AlertCount || 0),
    0
  );

  const techniques = new Set<string>();

  detections.forEach((detection) => {
    parseTechniques(detection.Techniques).forEach((technique) => {
      techniques.add(technique);
    });
  });

  const tactics = new Set(
    detections
      .map((detection) => formatTactic(detection.Tactics))
      .filter(Boolean)
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
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  MITRE ATT&CK Coverage
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight">
                MITRE ATT&CK Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Detection coverage and adversary techniques observed by
                Microsoft Sentinel.
              </p>
            </div>

            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Data Source
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Microsoft Sentinel
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Total Alerts
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-100">
              {loading ? "—" : totalAlerts}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Last 30 days
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Techniques Observed
            </p>

            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {loading ? "—" : techniques.size}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Unique ATT&CK techniques
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Tactics Observed
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-100">
              {loading ? "—" : tactics.size}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              ATT&CK tactical categories
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

            <p className="mt-4 text-sm text-slate-500">
              Loading MITRE ATT&CK coverage...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="font-semibold text-red-400">
              MITRE data unavailable
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>
          </div>
        )}

        {/* Detection coverage */}
        {!loading && !error && detections.length > 0 && (
          <section className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="border-b border-slate-800 px-6 py-4">
              <h2 className="font-semibold text-slate-200">
                Detection Coverage
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Actual alert activity mapped to MITRE ATT&CK techniques
              </p>
            </div>

            <div className="divide-y divide-slate-800">
              {detections.map((detection, index) => {
                const techniqueList = parseTechniques(
                  detection.Techniques
                );

                const tactic = formatTactic(detection.Tactics);

                return (
                  <div
                    key={`${detection.AlertName}-${index}`}
                    className="px-6 py-5 transition hover:bg-slate-900"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tacticClasses(
                              tactic
                            )}`}
                          >
                            {tactic}
                          </span>

                          <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500">
                            {detection.AlertSeverity}
                          </span>
                        </div>

                        <h3 className="mt-3 font-semibold text-slate-200">
                          {detection.AlertName}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {techniqueList.map((technique) => (
                            <span
                              key={technique}
                              className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-3 py-2"
                            >
                              <span className="font-mono text-xs font-semibold text-cyan-400">
                                {technique}
                              </span>

                              <span className="ml-2 text-xs text-slate-500">
                                {techniqueName(technique)}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-8 lg:text-right">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-600">
                            Alerts
                          </p>

                          <p className="mt-1 text-2xl font-bold text-slate-200">
                            {detection.AlertCount}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-600">
                            Latest
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(detection.LatestAlert)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Technique summary */}
        {!loading && !error && detections.length > 0 && (
          <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="border-b border-slate-800 px-6 py-4">
              <h2 className="font-semibold text-slate-200">
                Observed ATT&CK Techniques
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Unique techniques represented in Sentinel alert telemetry
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from(techniques).map((technique) => (
                <div
                  key={technique}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-5"
                >
                  <p className="font-mono text-lg font-bold text-cyan-400">
                    {technique}
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    {techniqueName(technique)}
                  </p>

                  <p className="mt-2 text-xs text-slate-600">
                    MITRE ATT&CK technique
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

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