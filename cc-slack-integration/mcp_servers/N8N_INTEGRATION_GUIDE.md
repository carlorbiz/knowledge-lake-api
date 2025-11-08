# n8n Integration Guide for Manus MCP Servers

**Author:** Manus AI  
**Date:** November 5, 2025

## Overview

This guide provides instructions for connecting your n8n workflows to the custom Manus MCP servers for DocsAutomator and Gamma. By creating custom credentials and using the HTTP Request node, you can seamlessly integrate document automation and AI-powered presentation generation into your n8n workflows.

## Table of Contents

1. [Introduction](#introduction)
2. [Integration Architecture](#integration-architecture)
3. [Prerequisites](#prerequisites)
4. [Creating Custom Credentials in n8n](#creating-custom-credentials-in-n8n)
5. [DocsAutomator Workflow Example](#docsautomator-workflow-example)
6. [Gamma Workflow Example](#gamma-workflow-example)
7. [Troubleshooting](#troubleshooting)

## Introduction

n8n is a powerful workflow automation tool that allows you to connect various services and APIs. By integrating your custom MCP servers with n8n, you can trigger document and presentation generation from any event in your n8n workflows, such as a new entry in a database, a new email, or a form submission.

## Integration Architecture

The integration between n8n and the Manus MCP servers is achieved using n8n's HTTP Request node and custom credentials. The architecture is as follows:

1.  **n8n Workflow**: The workflow is triggered by an event.
2.  **HTTP Request Node**: This node is configured to call the API endpoints of the MCP servers.
3.  **Custom Credentials**: These credentials securely store the API keys for DocsAutomator and Gamma and automatically add the required authentication headers to the HTTP requests.
4.  **MCP Servers**: The MCP servers receive the requests from n8n, call the respective APIs (DocsAutomator or Gamma), and return the results to the n8n workflow.

## Prerequisites

-   n8n instance (self-hosted or cloud).
-   The DocsAutomator and Gamma MCP servers are running and accessible from your n8n instance (e.g., via CloudFlare Tunnel).
-   The `n8n_credential.json` files for DocsAutomator and Gamma.

## Creating Custom Credentials in n8n

To connect to the MCP servers, you need to create custom credentials in n8n for both DocsAutomator and Gamma.

### DocsAutomator Custom Credential

1.  In your n8n instance, go to **Credentials** and click on **Add credential**.
2.  Search for **HTTP Request** and select it.
3.  In the **Authentication** dropdown, select **Custom Auth**.
4.  Copy the content of the `/home/ubuntu/mcp_servers/docsautomator/n8n_credential.json` file and paste it into the JSON configuration field.
5.  Enter your DocsAutomator API key in the **API Key** field.
6.  Save the credential.

### Gamma Custom Credential

1.  In your n8n instance, go to **Credentials** and click on **Add credential**.
2.  Search for **HTTP Request** and select it.
3.  In the **Authentication** dropdown, select **Custom Auth**.
4.  Copy the content of the `/home/ubuntu/mcp_servers/gamma/n8n_credential.json` file and paste it into the JSON configuration field.
5.  Enter your Gamma API key in the **API Key** field.
6.  Save the credential.

## DocsAutomator Workflow Example

This example workflow demonstrates how to create a document using the DocsAutomator MCP server.

1.  Create a new workflow in n8n.
2.  Add an **HTTP Request** node.
3.  Configure the node as follows:
    -   **Authentication**: `DocsAutomator API` (the custom credential you created).
    -   **Method**: `POST`
    -   **URL**: `http://<your_mcp_server_host>:8000/create_document`
    -   **Body Content Type**: `JSON`
    -   **Body**: Add the JSON data for the document you want to create, for example:

        ```json
        {
          "docId": "your_doc_id",
          "documentName": "Invoice_2025_001",
          "data": {
            "customer_name": "Acme Corp",
            "invoice_number": "INV-2025-001"
          }
        }
        ```

4.  Execute the workflow. The HTTP Request node will call the DocsAutomator MCP server and create the document.

## Gamma Workflow Example

This example workflow demonstrates how to generate a presentation using the Gamma MCP server.

1.  Create a new workflow in n8n.
2.  Add an **HTTP Request** node to generate the presentation.
3.  Configure the node as follows:
    -   **Authentication**: `Gamma API` (the custom credential you created).
    -   **Method**: `POST`
    -   **URL**: `http://<your_mcp_server_host>:8001/generate`
    -   **Body Content Type**: `JSON`
    -   **Body**: Add the JSON data for the presentation, for example:

        ```json
        {
          "inputText": "Create a pitch deck about sustainable energy solutions",
          "format": "presentation"
        }
        ```

4.  Add another **HTTP Request** node to poll for the result.
5.  Configure this node as follows:
    -   **Authentication**: `Gamma API`.
    -   **Method**: `GET`
    -   **URL**: `http://<your_mcp_server_host>:8001/generations/{{ $json.generationId }}` (This uses an expression to get the `generationId` from the previous node's output).

6.  You can add a **Wait** node between the two HTTP Request nodes to poll at a specific interval.

## Troubleshooting

-   **401 Unauthorized**: Check if the API keys in your n8n credentials are correct.
-   **Connection Refused**: Ensure that your MCP servers are running and accessible from your n8n instance. If you are running n8n in Docker, make sure the containers are on the same network or that the MCP server ports are exposed to the host.
-   **Node Errors**: Check the output of the HTTP Request node in n8n for detailed error messages from the MCP servers.
