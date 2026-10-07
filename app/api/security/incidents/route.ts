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
      SecurityIncident
      | summarize arg_max(TimeGenerated, *) by IncidentNumber
      | where Status in ("New", "Active")
      | project
          IncidentNumber,
          Title,
          Severity,
          Status,
          TimeGenerated,
          CreatedTime,
          FirstActivityTime,
          LastActivityTime,
          Description,
          ProviderName,
          AlertIds,
          AdditionalData
      | order by TimeGenerated desc
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

    const incidents = rows.map((row: any[]) => ({
      IncidentNumber: row[0],
      Title: row[1],
      Severity: row[2],
      Status: row[3],
      TimeGenerated: row[4],
      CreatedTime: row[5],
      FirstActivityTime: row[6],
      LastActivityTime: row[7],
      Description: row[8],
      ProviderName: row[9],
      AlertIds: row[10],
      AdditionalData: row[11],
    }));

    return NextResponse.json({
      incidents,
      count: incidents.length,
      source: "Microsoft Sentinel",
    });
  } catch (error) {
    console.error("Azure Log Analytics incident error:", error);

    return NextResponse.json(
      {
        error: "Failed to query Microsoft Sentinel incidents.",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}