# DocsAutomator API Integration Research

## Research Date
November 5, 2025

## Objective
Research how to create a custom Zapier API that can call DocsAutomator as a specific element within an n8n workflow, and design flexible DocsAutomator templates that can be selected based on task requirements.

---

## 1. DocsAutomator API Capabilities

### API Overview
DocsAutomator offers a powerful REST API to create documents from anywhere and list, create, update and delete DocsAutomator automations.

**Source:** https://docs.docsautomator.co/integrations-api/docsautomator-api

### Key API Endpoints

#### 1.1 Create Document (POST)
- **Endpoint:** `POST https://api.docsautomator.co/createDocument`
- **Authentication:** Bearer token (API key)
- **Purpose:** Triggers document creation and returns JSON response with URLs

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {apiKey}`

**Request Body Parameters:**
- `docId` (required): The ID of the document/automation
- `documentName` (optional): The name of the generated document (data source API only)
- `recId` (optional): Record ID for Airtable
- `taskId` (optional): Task ID for ClickUp
- `data` (optional): Placeholders data for the template (data source API only)

**Response (Success):**
```json
{
  "pdfUrl": "https://firebasestorage.googleapis.com/...",
  "googleDocUrl": "https://docs.google.com/document/d/...",
  "savePdfGoogleDriveFolderId": "..."
}
```

#### 1.2 Get User Automations
- **Endpoint:** `GET https://api.docsautomator.co/automations`
- **Purpose:** List all automations for the authenticated user
- **Returns:** Array of automation objects with configuration details

#### 1.3 Update Automation
- **Endpoint:** `PUT https://api.docsautomator.co/updateAutomation?docId={docId}`
- **Purpose:** Update automation configuration

### Key Features for Integration
1. **Direct API Access:** Can be called from any system with HTTP capabilities
2. **Dynamic Data:** Accepts placeholder data in the request body
3. **URL Response:** Returns both PDF and Google Doc URLs
4. **Template-based:** Uses pre-configured templates (docId)
5. **Line Items Support:** Supports repeating sections via `line_items_$num` arrays

---

## 2. Zapier MCP Integration

### Available Zapier Tool
From the Zapier MCP server, there is a tool available:

**Tool:** `docsautomator_create_document`
- **Description:** Create a document from a template
- **Parameters:**
  - `instructions` (required, string): Instructions for running this tool. Any parameters that are not given a value will be guessed based on the instructions.
  - `docId` (optional, string): Automation ID

### Zapier Custom API Actions
Zapier also provides tools for managing custom actions:
- `add_tools`: Add new actions to your MCP provider
- `edit_tools`: Edit your existing MCP provider actions

---

## 3. Integration Architecture Options

### Option A: Direct n8n → DocsAutomator API
- n8n HTTP Request node calls DocsAutomator API directly
- No Zapier intermediary needed
- Most direct and efficient approach

### Option B: n8n → Zapier → DocsAutomator
- n8n triggers Zapier webhook
- Zapier calls DocsAutomator via MCP tool
- Adds extra layer but leverages Zapier's error handling

### Option C: n8n → Custom Zapier API → DocsAutomator
- Create custom Zapier action using `add_tools`
- n8n calls custom Zapier endpoint
- Zapier orchestrates DocsAutomator call

---

## Next Steps
1. Research n8n webhook and HTTP request capabilities
2. Research DocsAutomator template design best practices
3. Investigate Zapier custom API creation methods
4. Design flexible template structure for multiple use cases

## 4. DocsAutomator Webhook Notifications

### Webhook Capabilities
DocsAutomator can notify other services about successful document creations via webhooks.

**Source:** https://docs.docsautomator.co/features/actions-after-document-generation/notify-webhook

### Configuration
- **Webhook URL:** Can be configured in the automation settings
- **Trigger:** Fires after successful document creation
- **Purpose:** Allows integration with other systems (like n8n) to continue workflows

### Additional Parameters via API
You can send additional parameters to your webhook address by adding a `webhookParams` object to your API requests:

```json
{
  "webhookParams": {
    "recId": "674643b9f84a82822fe2192e",
    "test": "test"
  }
}
```

These will appear as `additionalParams` in the webhook payload sent to your endpoint.

**Note:** In the case of Airtable, the record ID is always sent as an additional parameter automatically.

### Integration Pattern: DocsAutomator → n8n
This webhook feature enables a powerful integration pattern:
1. External system (or n8n) triggers DocsAutomator via API
2. DocsAutomator generates document
3. DocsAutomator sends webhook notification to n8n
4. n8n continues workflow with document URLs

---

## 5. n8n HTTP Request Node Capabilities

### Overview
The HTTP Request node is one of the most versatile nodes in n8n. It allows you to make HTTP requests to query data from any app or service with a REST API.

**Source:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/

### Key Features for DocsAutomator Integration

#### HTTP Methods Supported
- DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT

#### Authentication Options
1. **Predefined Credential Type** (recommended when available)
2. **Generic Credentials** including:
   - Basic auth
   - Custom auth
   - Digest auth
   - Header auth
   - OAuth1 API
   - OAuth2 API
   - Query auth

#### Request Configuration
- **URL**: Endpoint to call
- **Query Parameters**: Can be specified using fields or JSON
- **Headers**: Can be specified using fields or JSON
- **Body**: Multiple content types supported:
  - Form URLencoded
  - Form-Data
  - JSON (can specify using fields or raw JSON)
  - n8n Binary File
  - Raw

#### Response Handling
- **Response Format**: Autodetect, File, JSON, Text
- **Include Response Headers and Status**: Option to return full response
- **Never Error**: Option to return success regardless of status code

### Integration Pattern for DocsAutomator
The n8n HTTP Request node can directly call the DocsAutomator API:

**Configuration:**
- **Method**: POST
- **URL**: `https://api.docsautomator.co/createDocument`
- **Authentication**: Header auth with Bearer token
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {apiKey}`
- **Body**: JSON format with:
  - `docId`: Template/automation ID
  - `documentName`: Optional document name
  - `data`: Placeholder values as object

**Response:**
Returns JSON with:
- `pdfUrl`: URL of generated PDF
- `googleDocUrl`: URL of Google Doc (if enabled)
- `savePdfGoogleDriveFolderId`: Folder ID

---

## 6. n8n Webhook Node Capabilities

### Overview
The Webhook node creates webhooks that can receive data from apps and services when an event occurs. It's a trigger node that can start an n8n workflow.

**Source:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

### Key Features

#### Webhook URLs
n8n provides two types of webhook URLs:
- **Test URL**: For development and testing (displays data in workflow)
- **Production URL**: For live workflows (data viewable in Executions tab)

#### HTTP Methods Supported
- DELETE, GET, HEAD, PATCH, POST, PUT

#### Authentication Methods
- Basic auth
- Header auth
- JWT auth
- None (public webhook)

#### Response Options
1. **Immediately**: Returns response code and "Workflow got started" message
2. **When Last Node Finishes**: Returns response code and data output from last node
3. **Using 'Respond to Webhook' Node**: Custom response defined in separate node
4. **Streaming response**: Real-time data streaming

#### Response Configuration
- **Response Code**: Customizable HTTP response codes
- **Response Data**: Options include all entries, first entry JSON, first entry binary, or no response body
- **Response Headers**: Can send custom headers
- **Response Content-Type**: Customizable format

#### Advanced Options
- **Allowed Origins (CORS)**: Control cross-origin requests
- **Binary Property**: Receive binary data (images, audio, etc.)
- **Ignore Bots**: Filter out bot requests
- **IP Whitelist**: Restrict access by IP address
- **Raw Body**: Receive data in raw format (JSON, XML)
- **Property Name**: Return specific JSON key

### Integration Pattern: DocsAutomator → n8n Webhook

**Workflow:**
1. Configure n8n Webhook node as trigger
2. Set webhook to respond "Immediately" or "When Last Node Finishes"
3. Configure DocsAutomator automation with webhook URL in "Notify Webhook" settings
4. When DocsAutomator creates document, it sends webhook notification to n8n
5. n8n workflow receives document URLs and continues processing

**Webhook Payload from DocsAutomator:**
The webhook will contain the document URLs and any additional parameters specified in `webhookParams`.

---

## 7. DocsAutomator Template Design Best Practices

### Template Syntax Overview
DocsAutomator uses curly brackets `{{...}}` to declare variables/placeholders in Google Docs templates.

**Source:** https://docs.docsautomator.co/docsautomator-basics/google-doc-template-guide

### Three Types of Variables

#### 1. Text Variables/Placeholders
- **Syntax:** `{{variable_name}}`
- **Examples:** `{{name}}`, `{{client_name}}`, `{{invoice_date}}`
- **Usage:** Can be declared anywhere in the document (including headers and footers)
- **Key Feature:** Variable names must be unique, but the same placeholder can be used multiple times throughout the document

#### 2. Image Variables/Placeholders
- **Syntax:** `{{image_variable_name}}`
- **Examples:** `{{image_headshot}}`, `{{image_product}}`, `{{image_logo}}`
- **Usage:** For dynamically adding images to documents
- **Accepts:** Single image or multiple images

#### 3. Line Item Variables/Placeholders
- **Syntax:** Declared as a row in a table with `{{line_items_1}}{{placeholder}}`
- **Example:**
  ```
  | PRODUCT | AMOUNT | UNIT | TOTAL |
  | {{line_items_1}}{{product}} | {{amount}} pieces | {{unit}} | {{total}} |
  ```
- **Usage:** For lists of data (invoice items, timesheet entries, etc.)
- **Key Feature:** Can increment numbers for multiple line item sections (line_items_1, line_items_2, etc.)
- **Flexibility:** Supports static text and multiple variables per cell

### Advanced Placeholder Options

**Source:** https://docs.docsautomator.co/features/advanced-placeholder-options

Each placeholder has a settings menu with advanced options:

1. **Delete line/row when empty**: Automatically removes entire line or table row if no value is passed
2. **Enable Markdown formatting**: Allows Markdown syntax in placeholder values
3. **Hidden Values**: Use values as conditions without displaying them in the document
4. **Show/hide conditionally**: Display or hide values based on conditions
5. **Style conditionally**: Apply Google Docs text styles (bold, color, etc.) based on conditions

### Dynamic Sections

**Source:** https://docs.docsautomator.co/features/sections

Sections allow rendering entire areas of documents conditionally.

**Syntax:**
```
{{section_SECTION_NAME}}
... content here ...
{{/section_SECTION_NAME}}
```

**Key Features:**
- Wrap any area of the document with section tags
- Define conditions in automation settings (equals, not equals, contains, etc.)
- Conditions apply to any placeholder values in the document
- Pro tip: Add color to section tags for easier identification in templates

### Template Design Tips

1. **Start with existing templates**: Use DocsAutomator's Template Gallery instead of starting from scratch
2. **Use tables for positioning**: Tables can position elements even when borders are hidden
3. **Fixed positioning for images**: Apply fixed position (in front of/behind text) for images in headers, footers, or page tops
4. **Sharing settings**: Generated Google Docs inherit sharing settings from the parent folder

### Creating Flexible Templates for Multiple Use Cases

**Recommended Approach:**
1. **Generic placeholders**: Use descriptive but flexible placeholder names
   - Instead of: `{{invoice_number}}`, use: `{{document_number}}`
   - Instead of: `{{client_name}}`, use: `{{recipient_name}}`

2. **Optional sections**: Use sections for content that may or may not appear
   - Example: `{{section_payment_terms}}` for financial documents only
   - Example: `{{section_technical_specs}}` for technical documents only

3. **Multiple line item sections**: Support different types of lists in one template
   - `{{line_items_1}}` for main content items
   - `{{line_items_2}}` for additional/optional items

4. **Conditional styling**: Use advanced options to adapt formatting based on document type

---
