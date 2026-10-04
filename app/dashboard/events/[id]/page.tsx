"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type AlertData = {
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

export default function AlertInvestigationPage() {
  const params = useParams();
  const id = params.id as string;

  const [alert, setAlert] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`/api/security/alert/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load alert");
        }

        return response.json();
      })
      .then((data) => {
        setAlert(data.alert);
      })
      .catch((error) => {
        console.error("Alert investigation error:", error);
        setError("Unable to load alert details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-slate-500">
            Loading alert investigation...
          </p>
        </div>
      </main>
    );
  }

  if (error || !alert) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-red-400">
            {error || "Alert not found."}
          </p>

          <a
            href="/dashboard/events"
            className="mt-4 inline-block text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Security Events
          </a>
        </div>
      </main>
    );
  }

  const technique = alert.Techniques
    ? alert.Techniques.replace(/[\[\]" ]/g, "")
    : "Not mapped";

  const tactic = alert.Tactics
    ? alert.Tactics.replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
      )
    : "Unknown";

  const formattedTime = new Date(
    alert.TimeGenerated
  ).toLocaleString();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-cyan-400">
              SOC Investigation
            </p>

            <h1 className="mt-2 text-2xl font-semibold">
              Alert Investigation
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Microsoft Sentinel security alert
            </p>
          </div>

          <a
            href="/dashboard/events"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            ← Back to Events
          </a>
        </div>

        {/* Alert Header */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Detection
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                {alert.AlertName}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {alert.Description}
              </p>
            </div>

            <span className="w-fit rounded-md bg-yellow-500/10 px-3 py-1.5 text-sm text-yellow-400">
              {alert.AlertSeverity}
            </span>

          </div>

          {/* Metadata */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-500">
                Tactic
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {tactic}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-500">
                MITRE Technique
              </p>

              <p className="mt-2 text-sm font-medium text-cyan-400">
                {technique}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-500">
                Detected
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {formattedTime}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-500">
                Provider
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {alert.ProviderName}
              </p>
            </div>

          </div>
        </section>

        {/* Investigation */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Alert Evidence */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold">
              Alert Evidence
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Available telemetry context
            </p>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-xs text-slate-500">
                  Alert ID
                </p>

                <p className="mt-1 break-all font-mono text-xs text-slate-300">
                  {alert.SystemAlertId}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Affected Entity
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {alert.CompromisedEntity || "Not reported"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Severity
                </p>

                <p className="mt-1 text-sm text-yellow-400">
                  {alert.AlertSeverity}
                </p>
              </div>

            </div>
          </div>

          {/* MITRE Mapping */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold">
              MITRE ATT&CK Mapping
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Adversary behavior classification
            </p>

            <div className="mt-5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-5">

              <p className="text-xs uppercase tracking-wider text-cyan-400">
                Tactic
              </p>

              <p className="mt-2 text-lg font-semibold">
                {tactic}
              </p>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-wider text-cyan-400">
                  Technique
                </p>

                <p className="mt-2 font-mono text-lg font-semibold">
                  {technique}
                </p>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                The alert is mapped to MITRE ATT&CK technique{" "}
                {technique}.
              </p>

            </div>
          </div>

        </section>

        {/* Investigation Notes */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="font-semibold">
            Investigation Summary
          </h3>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm leading-6 text-slate-400">
              This alert represents repeated unsuccessful SSH
              authentication activity involving invalid usernames.
              Review the associated Linux authentication telemetry,
              source IP addresses, frequency of attempts, and related
              alerts to determine whether the activity represents
              automated internet scanning or a targeted authentication
              attempt.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}