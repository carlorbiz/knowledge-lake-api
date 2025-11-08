# How to Call Manus from n8n via HTTP Request

**Date:** November 5, 2025

**Author:** Manus AI

---

## Overview

To have your n8n workflow trigger me to perform a task (like analyzing Slack content and generating a document), you don't use a traditional webhook. Instead, you use n8n's **HTTP Request node** to make a direct API call to my task creation endpoint. 

This guide will walk you through the exact setup.

### The Workflow

The data flow will be:

1.  **n8n (Slack Trigger):** A new message in Slack starts the workflow.
2.  **n8n (HTTP Request Node):** This node sends the Slack message content to me by calling my API.
3.  **Manus:** I receive the content, analyze it, select the correct DocsAutomator template, and generate the Google Doc.
4.  **n8n (HTTP Request Node):** My API sends a response back to this node containing the final Google Doc URL.
5.  **n8n (Notion Node):** This node takes the URL from the previous step and saves it to your Notion database.

---

## Step 1: Get Your Manus API Key

Before you configure n8n, you need your personal Manus API key.

1.  Log in to your Manus account at [manus.im](https://manus.im).
2.  Navigate to **Settings > API & Integrations**.
3.  Under the **API Keys** section, copy your active API key. If you don't have one, create a new one.

**Important:** Treat this key like a password. Do not share it publicly.

---

## Step 2: Configure the n8n HTTP Request Node

In your n8n workflow, add an **HTTP Request** node after your Slack trigger. Configure it with the following settings:

### Node Properties

| Parameter         | Value                               |
| ----------------- | ----------------------------------- |
| **Method**        | `POST`                              |
| **URL**           | `https://api.manus.ai/v1/tasks`     |
| **Authentication**| `Header Auth`                       |
| **Send Body**     | `On`                                |
| **Body Content Type** | `JSON`                              |
| **JSON/RAW Parameters** | `On`                                |

### Header Authentication

After selecting `Header Auth`, you need to create a new credential:

1.  Click **Create New Credential**.
2.  In the **Name** field, enter `API_KEY`.
3.  In the **Value** field, paste your Manus API key from Step 1.

### Body Parameters

This is where you tell me what to do. You'll send a JSON object containing the prompt.

In the **Body Parameters** section, add the following:

```json
{
  "prompt": "{{$json.content}}",
  "taskMode": "agent"
}
```

**Explanation:**

-   `"prompt": "{{$json.content}}"`: This is the most important part. It tells me what the task is. The `{{$json.content}}` is an n8n expression that dynamically inserts the content from the previous node (your Slack trigger). **You may need to adjust this expression** based on the exact output of your Slack node. Use the expression editor to find the correct field for the message text.
-   `"taskMode": "agent"`: This tells me to use my full agentic capabilities to analyze the content and orchestrate the calls to other tools (like DocsAutomator).

---

## Step 3: Handle the Response from Manus

When I'm finished, the HTTP Request node will receive a response from me. I will specifically format my response to make it easy for n8n to use.

### My Response Structure

My response will be a simple JSON object containing the URL of the generated document:

```json
{
  "documentUrl": "https://docs.google.com/document/d/1abcde..."
}
```

### Using the Response in the Notion Node

In your subsequent **Notion node** (the one that creates the database page), you can now easily reference this URL.

In the field where you want to store the link (e.g., a "Document Link" property), use the following n8n expression:

`{{$json.documentUrl}}`

This will pull the URL from the body of the response sent by the HTTP Request node and place it directly into your Notion page.

---

## Summary of n8n Configuration

| Node                | Configuration                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slack Trigger**   | Triggers on a new message. Outputs the message content.                                                                                                                   |
| **HTTP Request**    | **Method:** `POST`<br>**URL:** `https://api.manus.ai/v1/tasks`<br>**Auth:** Header Auth (`API_KEY`: `your_key`)<br>**Body:** `{"prompt": "{{$json.content}}", "taskMode": "agent"}` |
| **Notion Node**     | Creates a new database page. In the relevant URL field, use the expression `{{$json.documentUrl}}` to insert the link returned from the HTTP Request node.         |

This setup provides a robust and direct way for your n8n workflow to delegate complex content processing tasks to me, leveraging the full power of the AAE and its connected tools.
