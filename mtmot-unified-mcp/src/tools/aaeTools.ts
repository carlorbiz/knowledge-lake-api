import { getAAEDashboardSnapshot } from "../clients/aaeClient.js";

export const aaeTools = [
  {
    name: "get_aae_dashboard_snapshot",
    description:
      "Fetch a snapshot from the AAE Dashboard by dashboardId and/or metricKey. Use for reporting, monitoring and automation routing.",
    inputSchema: {
      type: "object" as const,
      properties: {
        dashboardId: {
          type: "string",
          description: "Identifier of the dashboard to query.",
        },
        metricKey: {
          type: "string",
          description:
            "Optional metric key to narrow the snapshot (e.g., 'courses_published').",
        },
      },
      required: [],
    },
    handler: async (input: { dashboardId?: string; metricKey?: string }) => {
      const { dashboardId, metricKey } = input;

      const data = await getAAEDashboardSnapshot({ dashboardId, metricKey });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  },
];
