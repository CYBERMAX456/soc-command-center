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
      | summarize arg_max(TimeGenerated, *) by SystemAlertId
      | where Status == "New"
      | summarize ActiveAlerts = count()
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
          timespan: "P7D",
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

    const activeAlerts = rows[0]?.[0] ?? 0;

    return NextResponse.json({
      activeAlerts,
      source: "Microsoft Sentinel",
    });
  } catch (error) {
    console.error("Azure Log Analytics error:", error);

    return NextResponse.json(
      {
        error: "Failed to query Microsoft Sentinel.",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}