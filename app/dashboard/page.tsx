"use client";

import { useEffect, useState } from "react";

const recentEvents = [
  {
    title: "Repeated Invalid SSH User Attempts",
    tactic: "Credential Access",
    severity: "Medium",
  },
  {
    title: "Privileged Sudo Command Execution",
    tactic: "Privilege Escalation",
    severity: "Medium",
  },
  {
    title: "Suspicious DNS Query Activity",
    tactic: "Command and Control",
    severity: "Medium",
  },
  {
    title: "Suspicious Process Execution",
    tactic: "Execution",
    severity: "Medium",
  },
];

export default function Dashboard() {
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [failedSSH, setFailedSSH] = useState<number | null>(null);
  const [openIncidents, setOpenIncidents] = useState<number | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<number | null>(null);
  const [topSSHIPs, setTopSSHIPs] = useState<
    { SourceIP: string; Attempts: number }[]
  >([]);
  const topIPs = topSSHIPs.map((item) => ({
    ip: item.SourceIP,
    count: item.Attempts,
  }));
  const [eventsOverTime, setEventsOverTime] = useState<
    { TimeGenerated: string; EventCount: number }[]
  >([]);
  const [detections, setDetections] = useState<
    { AlertName: string; AlertCount: number }[]
  >([]);
  const [recentSecurityEvents, setRecentSecurityEvents] = useState<
    {
      SystemAlertId: string;
      TimeGenerated: string;
      AlertName: string;
      AlertSeverity: string;
      Tactics: string;
      CompromisedEntity: string;
      ProviderName: string;
    }[]
  >([]);

  useEffect(() => {
      fetch("/api/security/total-events")
        .then((response) => response.json())
        .then((data) => {
          setTotalEvents(data.totalEvents);
        })
        .catch((error) => {
          console.error("Failed to load total events:", error);
        });
      
      fetch("/api/security/failed-ssh")
        .then((response) => response.json())
        .then((data) => {
          setFailedSSH(data.failedSSHAttempts);
        })
        .catch((error) => {
          console.error("Failed to load SSH data:", error);
        });

      fetch("/api/security/open-incidents")
        .then((response) => response.json())
        .then((data) => {
          setOpenIncidents(data.openIncidents);
        })
        .catch((error) => {
          console.error("Failed to load incidents:", error);
        });

      fetch("/api/security/active-alerts")
        .then((response) => response.json())
        .then((data) => {
          setActiveAlerts(data.activeAlerts);
        })
        .catch((error) => {
          console.error("Failed to load alerts:", error);
        });

      fetch("/api/security/top-ssh-ips")
        .then((response) => response.json())
        .then((data) => {
          setTopSSHIPs(data.topSSHIPs ?? []);
        })
        .catch((error) => {
          console.error("Failed to load top SSH IPs:", error);
        });

      fetch("/api/security/events-over-time")
        .then((response) => response.json())
        .then((data) => {
          setEventsOverTime(data.events ?? []);
        })
        .catch((error) => {
          console.error("Failed to load events over time:", error);
        });

      fetch("/api/security/detection-distribution")
        .then((response) => response.json())
        .then((data) => {
          setDetections(data.detections ?? []);
        })
        .catch((error) => {
          console.error("Detection distribution error:", error);
        });
      
      fetch("/api/security/recent-events")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch recent security events");
          }

          return response.json();
        })
        .then((data) => {
          setRecentSecurityEvents(data.events ?? []);
        })
        .catch((error) => {
          console.error("Recent security events error:", error);
        });
    }, []);

    const stats = [
    { 
      label: "Total Events", 
      value: totalEvents !== null ? totalEvents.toLocaleString() : "..." 
    },
    { 
      label: "Failed SSH", 
      value: failedSSH !== null ? failedSSH.toLocaleString() : "..."
    },
    { 
      label: "Open Incidents", 
      value: openIncidents !== null ? openIncidents.toLocaleString() : "..."
    },
    { 
      label: "Active Alerts", 
      value: activeAlerts !== null ? activeAlerts.toLocaleString() : "..." 
    },
  ];
  
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 font-black text-slate-950">
              S
            </div>

            <div>
              <h1 className="font-bold">
                SOC Command Center
              </h1>

              <p className="text-xs text-slate-500">
                Security Operations Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                SOC Analyst
              </p>

              <p className="text-xs text-slate-500">
                analyst@example.com
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

              <span className="text-sm text-emerald-400">
                Online
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Dashboard */}
      <section className="space-y-6 p-6">

        {/* Page heading */}
        <div>
          <h2 className="text-2xl font-bold">
            Security Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monitor security telemetry and investigate suspicious activity.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-500">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-bold">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-emerald-400">
                Last 24 hours
              </p>
            </div>
          ))}

        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Events Timeline */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Security Events Over Time
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Last 24 hours
                </p>
              </div>

              <span className="rounded-md bg-cyan-400/10 px-3 py-1 text-xs text-cyan-400">
                Live
              </span>
            </div>

            <div className="mt-8 flex h-64 items-end gap-2">

              {eventsOverTime.map((event, index) => {
                const maxEvents = Math.max(
                  ...eventsOverTime.map((item) => item.EventCount),
                  1
                );

                const height = (event.EventCount / maxEvents) * 100;

                return (
                  <div
                    key={index}
                    className="group relative flex-1 rounded-t bg-cyan-500/70 transition hover:bg-cyan-400"
                    style={{ height: `${height}%` }}
                    title={`${new Date(event.TimeGenerated).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}: ${event.EventCount} events`}
                  />
                );
              })}

            </div>

            <div className="mt-3 flex justify-between text-xs text-slate-600">
              <span>24h ago</span>
              <span>12h ago</span>
              <span>Now</span>
            </div>

          </div>

          {/* Detection Distribution */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold">
              Detection Distribution
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Security detections by category · Last 24 hours
            </p>

            <div className="mt-7 space-y-6">
              {detections.length === 0 ? (
                <div className="text-sm text-slate-500">
                  No detections found in the last 24 hours.
                </div>
              ) : (
                detections.map((detection) => {
                  const maxCount = Math.max(
                    ...detections.map((item) => item.AlertCount),
                    1
                  );

                  const width = (detection.AlertCount / maxCount) * 100;

                  return (
                    <div key={detection.AlertName}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-300">
                          {detection.AlertName}
                        </span>

                        <span className="text-sm font-semibold text-white">
                          {detection.AlertCount}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Top IPs */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="font-semibold">
                  Top SSH Source IPs
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Most frequent sources
                </p>
              </div>

              <span className="text-xs text-slate-600">
                Last 24h
              </span>

            </div>

            <div className="mt-5 space-y-3">

              {topIPs.map((item, index) => (
                <div
                  key={item.ip}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3"
                >

                  <div className="flex items-center gap-4">

                    <span className="w-5 text-xs text-slate-600">
                      {index + 1}
                    </span>

                    <span className="font-mono text-sm text-slate-300">
                      {item.ip}
                    </span>

                  </div>

                  <span className="rounded-md bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                    {item.attempts}
                  </span>

                </div>
              ))}

            </div>
          </div>

          {/* Recent Events */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="font-semibold">
                  Recent Security Events
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Latest detections
                </p>
              </div>

              <a
                href="/dashboard/events"
                className="text-xs text-cyan-400 transition hover:text-cyan-300"
              >
                View all →
              </a>

            </div>

            <div className="mt-5 space-y-3">

              {recentSecurityEvents.map((event, index) => {
                const formattedTactic = event.Tactics
                  ? event.Tactics.replace(/([a-z])([A-Z])/g, "$1 $2")
                  : "Unknown";

                const formattedTime = new Date(
                  event.TimeGenerated
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const severityClass =
                  event.AlertSeverity?.toLowerCase() === "high"
                    ? "bg-red-500/10 text-red-400"
                    : event.AlertSeverity?.toLowerCase() === "low"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-yellow-500/10 text-yellow-400";

                return (
                  <div
                    key={`${event.TimeGenerated}-${event.AlertName}-${index}`}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          {event.AlertName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formattedTactic} · {formattedTime}
                        </p>

                        {event.CompromisedEntity && (
                          <p className="mt-1 text-xs text-slate-600">
                            Host: {event.CompromisedEntity}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-md px-2 py-1 text-xs ${severityClass}`}
                      >
                        {event.AlertSeverity}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-5 text-center text-xs text-slate-600">
        SOC Command Center • Security Operations Platform
      </footer>

    </main>
  );
}