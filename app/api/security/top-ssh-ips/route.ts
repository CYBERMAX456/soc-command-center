import { DefaultAzureCredential } from "@azure/identity";
import { NextResponse } from "next/server";

const workspaceId = process.env.AZURE_LOG_ANALYTICS_WORKSPACE_ID;

export async function GET() {
  try {
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is missing." },
        { status: 500 }
      );
    }

    const credential = new DefaultAzureCredential();

    const token = await credential.getToken(
      "https://api.loganalytics.io/.default"
    );

    if (!token) {
      throw new Error("Unable to acquire Azure access token.");
    }

    const query = `
      Syslog
      | where TimeGenerated > ago(24h)
      | where Computer == "SOC-Linux-VM"
      | where Facility in ("auth", "authpriv")
      | where ProcessName == "sshd"
      | where SyslogMessage has_any ("Failed password", "Invalid user")
      | extend SourceIP = extract(
          @"from ([0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+)",
          1,
          SyslogMessage
        )
      | where isnotempty(SourceIP)
      | summarize Attempts = count() by SourceIP
      | top 10 by Attempts desc
    `;

    const response = await fetch(
      `https://api.loganalytics.azure.com/v1/workspaces/${workspaceId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          timespan: "P1D",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: "Azure Log Analytics query failed.",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const table = data?.tables?.[0];

    if (!table) {
      return NextResponse.json({
        source: "Azure Log Analytics",
        topSSHIPs: [],
      });
    }

    const columns = table.columns.map(
      (column: { name: string }) => column.name
    );

    const rows = table.rows.map((row: unknown[]) => {
      const item: Record<string, unknown> = {};

      columns.forEach((column: string, index: number) => {
        item[column] = row[index];
      });

      return item;
    });

    return NextResponse.json({
      source: "Azure Log Analytics",
      topSSHIPs: rows,
    });
  } catch (error) {
    console.error("Top SSH IP query error:", error);

    return NextResponse.json(
      {
        error: "Failed to query top SSH source IPs.",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}