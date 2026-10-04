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
      | where TimeGenerated > ago(24h)
      | project
          SystemAlertId,
          TimeGenerated,
          AlertName,
          AlertSeverity,
          Tactics,
          CompromisedEntity,
          ProviderName
      | order by TimeGenerated desc
      | take 10
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
        source: "Microsoft Sentinel",
        events: [],
      });
    }

    const columns = table.columns.map(
      (column: { name: string }) => column.name
    );

    const events = table.rows.map((row: unknown[]) => {
      const item: Record<string, unknown> = {};

      columns.forEach((column: string, index: number) => {
        item[column] = row[index];
      });

      return item;
    });

    return NextResponse.json({
      source: "Microsoft Sentinel",
      events,
    });
  } catch (error) {
    console.error("Recent security events query error:", error);

    return NextResponse.json(
      {
        error: "Failed to query recent security events.",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}