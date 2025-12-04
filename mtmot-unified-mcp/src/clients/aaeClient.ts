const baseUrl = process.env.AAE_BASE_URL;
const apiKey = process.env.AAE_API_KEY;

if (!baseUrl) {
  console.warn("[mtmot-mcp] AAE_BASE_URL not set - AAE tools will fail.");
}

export async function getAAEDashboardSnapshot(params: {
  dashboardId?: string;
  metricKey?: string;
}): Promise<unknown> {
  if (!baseUrl || !apiKey) {
    throw new Error("AAE API not configured.");
  }

  const query = new URLSearchParams();
  if (params.dashboardId) query.set("dashboardId", params.dashboardId);
  if (params.metricKey) query.set("metricKey", params.metricKey);

  const url = `${baseUrl}/snapshot?${query.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AAE API error: ${res.status} - ${text}`);
  }

  return res.json();
}
