"use client";

import { useEffect, useState } from "react";

type SecurityEvent = {
  SystemAlertId: string;
  TimeGenerated: string;
  AlertName: string;
  AlertSeverity: string;
  Tactics: string;
  CompromisedEntity: string;
  ProviderName: string;
};

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/security/recent-events")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch security events");
        }

        return response.json();
      })
      .then((data) => {
        setEvents(data.events ?? []);
      })
      .catch((error) => {
        console.error("Security events error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Security Events
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Latest Microsoft Sentinel detections
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            ← Back to Dashboard
          </a>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          {loading ? (
            <p className="text-sm text-slate-500">
              Loading security events...
            </p>
          ) : events.length === 0 ? (
            <p className="text-sm text-slate-500">
              No security events found.
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => {
                const formattedTactic = event.Tactics
                  ? event.Tactics.replace(
                      /([a-z])([A-Z])/g,
                      "$1 $2"
                    )
                  : "Unknown";

                const formattedTime = new Date(
                  event.TimeGenerated
                ).toLocaleString();

                const severityClass =
                  event.AlertSeverity?.toLowerCase() === "high"
                    ? "bg-red-500/10 text-red-400"
                    : event.AlertSeverity?.toLowerCase() === "low"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-yellow-500/10 text-yellow-400";

                return (
                    <a
                    key={`${event.TimeGenerated}-${event.AlertName}-${index}`}
                    href={`/dashboard/events/${event.SystemAlertId}`}
                    className="block rounded-lg border border-slate-800 bg-slate-950 p-5 transition hover:border-cyan-500/50 hover:bg-slate-900"
                    >
                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="font-medium">
                          {event.AlertName}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {formattedTactic} · {formattedTime}
                        </p>

                        {event.CompromisedEntity && (
                          <p className="mt-2 text-xs text-slate-600">
                            Host: {event.CompromisedEntity}
                          </p>
                        )}

                        {event.ProviderName && (
                          <p className="mt-1 text-xs text-slate-600">
                            Provider: {event.ProviderName}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-md px-3 py-1 text-xs ${severityClass}`}
                      >
                        {event.AlertSeverity}
                      </span>

                    </div>
                  </a>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}