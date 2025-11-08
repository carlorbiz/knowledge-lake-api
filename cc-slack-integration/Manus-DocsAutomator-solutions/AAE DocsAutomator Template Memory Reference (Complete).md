# AAE DocsAutomator Template Memory Reference (Complete)

**Date Created:** November 5, 2025

**Author:** Manus AI

---

## Final Template Mapping

All 5 DocsAutomator templates have been configured and their `docId`s have been mapped. This document serves as the permanent memory reference for the AAE, ensuring that the correct template is used for each task.

| Template Name                 | Google Doc ID                                  | DocsAutomator `docId`      |
| ----------------------------- | ---------------------------------------------- | -------------------------- |
| `AAE_DeepDive_Analysis`         | `1e-6mDVI__RM7lFO9vocQzkkAZvHowBclyfgqD1sEJnc` | `69088da6d852c9556cec26af` |
| `AAE_MultiAgent_Coordination` | `1IC5TMNr1nIk02aOirQnGcxDYgoKC9n_QZP5EH6YnKH0` | `690b3d3f3756bfff14626684` |
| `AAE_Status_Update`           | `1BeXRTkpytra0acYAusEM5ZW8fZL1fBSppj1cC5viLRQ` | `690b3f973756bfff14626a7a` |
| `AAE_Research_Summary`        | `1tLkXAFHOYLPRQz4H8rqZzGnaMVJPIp9tdk-AmnGu7QE` | `690b3ffa3756bfff14626c17` |
| `AAE_Quick_Note`              | `1F-Q5Q01m1duuGszMxK7CSA36MqR5OYwmmm4ZixdXlFY` | `690b41a53756bfff1462734e` |

---

## Template Selection Decision Tree

Mana will use the following logic to automatically select the correct template based on the content of the Slack task:

```mermaid
graph TD
    A[Start: Analyze Slack Content] --> B{Has "Delegate to" AND "Status Report"?};
    B -- Yes --> C[Use: AAE_MultiAgent_Coordination<br>(690b3d3f3756bfff14626684)];
    B -- No --> D{Has "Status Report" OR "System Status"?};
    D -- Yes --> E[Use: AAE_Status_Update<br>(690b3f973756bfff14626a7a)];
    D -- No --> F{Has "Investigate" OR "Research" OR "Analyze"?};
    F -- Yes --> G[Use: AAE_Research_Summary<br>(690b3ffa3756bfff14626c17)];
    F -- No --> H{Is it a comprehensive, multi-section task?};
    H -- Yes --> I[Use: AAE_DeepDive_Analysis<br>(69088da6d852c9556cec26af)];
    H -- No --> J[Use: AAE_Quick_Note<br>(690b41a53756bfff1462734e)];
```

---

## Workflow Integration

When a webhook is received from the n8n workflow, Manus will:

1.  **Analyze** the incoming Slack content.
2.  **Execute** the decision tree logic to select the appropriate template `docId`.
3.  **Parse and format** the content into the correct JSON structure for the selected template.
4.  **Call** the `docsautomator_create_document` action via the Zapier MCP, providing the selected `docId` and the formatted data.
5.  **Capture** the `documentUrl` from the API response.
6.  **Return** the `documentUrl` to the n8n workflow for storage in the Notion database.

This completes the setup for intelligent, automated document generation within the AAE.
