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
      SecurityAlert
      | where TimeGenerated > ago(30d)
      | where isnotempty(AlertName)
      | summarize
          AlertCount = count(),
          LatestAlert = max(TimeGenerated)
        by AlertName, AlertSeverity, Tactics, Techniques
      | order by AlertCount desc
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
          timespan: "P30D",
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

    const rows = data?.tables?.[0]?.rows ?? [];

    const mitreData = rows.map((row: any[]) => ({
      AlertName: row[0],
      AlertSeverity: row[1],
      Tactics: row[2],
      Techniques: row[3],
      AlertCount: row[4],
      LatestAlert: row[5],
    }));

    return NextResponse.json({
      data: mitreData,
      count: mitreData.length,
      source: "Microsoft Sentinel",
    });
  } catch (error) {
    console.error("Azure MITRE query error:", error);

    return NextResponse.json(
      {
        error: "Failed to query MITRE ATT&CK data.",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
