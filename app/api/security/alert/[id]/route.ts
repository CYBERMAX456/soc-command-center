import { DefaultAzureCredential } from "@azure/identity";
import { NextResponse } from "next/server";

const workspaceId = process.env.AZURE_LOG_ANALYTICS_WORKSPACE_ID;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is missing." },
        { status: 500 }
      );
    }

    const { id } = await params;

    if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid alert ID." },
        { status: 400 }
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
      | where SystemAlertId == "${id}"
      | project
          SystemAlertId,
          TimeGenerated,
          AlertName,
          AlertSeverity,
          Tactics,
          Techniques,
          CompromisedEntity,
          ProviderName,
          Description
      | order by TimeGenerated desc
      | take 1
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
    const table = data?.tables?.[0];

    if (!table || !table.rows?.length) {
      return NextResponse.json(
        { error: "Alert not found." },
        { status: 404 }
      );
    }

    const columns = table.columns.map(
      (column: { name: string }) => column.name
    );

    const row = table.rows[0];

    const alert: Record<string, unknown> = {};

    columns.forEach((column: string, index: number) => {
      alert[column] = row[index];
    });

    return NextResponse.json({
      source: "Microsoft Sentinel",
      alert,
    });
  } catch (error) {
    console.error("Alert investigation query error:", error);

    return NextResponse.json(
      {
        error: "Failed to query alert.",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}