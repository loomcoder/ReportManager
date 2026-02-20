# Enhancement: AI-Powered Wizard & Full-Featured Chat

> **Version**: 1.0  
> **Date**: 2026-02-20  
> **Status**: Proposed  
> **Author**: Auto-generated  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Enhancement 1 — AI-Powered Wizard](#enhancement-1--ai-powered-wizard)
   - [Overview](#11-overview)
   - [User Journey & Conversation Flows](#12-user-journey--conversation-flows)
   - [Supported Operations](#13-supported-operations)
   - [XML Task Plan Architecture](#14-xml-task-plan-architecture)
   - [Backend Design](#15-backend-design)
   - [Frontend Design](#16-frontend-design)
   - [Database Changes](#17-database-changes)
   - [Error Handling & Validation](#18-error-handling--validation)
3. [Enhancement 2 — Full-Featured Chat Page](#enhancement-2--full-featured-chat-page)
   - [Overview](#21-overview)
   - [Feature Requirements](#22-feature-requirements)
   - [Backend Design](#23-backend-design)
   - [Frontend Design](#24-frontend-design)
   - [Database Changes](#25-database-changes)
4. [Shared Infrastructure](#shared-infrastructure)
5. [Implementation Phases](#implementation-phases)
6. [API Reference](#api-reference)
7. [Risk & Mitigation](#risk--mitigation)

---

## Executive Summary

This document proposes **two major enhancements** to the Report Manager application:

| # | Enhancement | Description |
|---|-------------|-------------|
| 1 | **AI-Powered Wizard** | A step-by-step conversational wizard that guides users through creating, updating, deleting, and listing reports, dashboards, data sources, and schedules. The LLM generates an **XML task plan** that is validated and executed server-side. |
| 2 | **Full-Featured Chat Page** | A modern, ChatGPT-style chat experience with streaming responses, markdown rendering, code highlighting, conversation history, model switching, and system prompt customization. |

Both features build on the existing Ollama integration and the RAG-based context system already present in the backend.

---

## Enhancement 1 — AI-Powered Wizard

### 1.1 Overview

The AI Wizard is a **guided, conversational UI** that walks users through complex operations without requiring them to navigate multiple pages or understand underlying data structures. The wizard leverages an LLM to:

1. Ask the user what they want to do (create, update, delete, list)
2. Determine which entity they want to work with (report, dashboard, data source, schedule)
3. Resolve dependencies intelligently (e.g., creating a data source before a report)
4. Collect all required parameters through natural conversation
5. Generate an **XML Task Plan** describing the operations
6. Display the plan for user review and confirmation
7. Execute the plan by calling existing backend APIs

```
┌─────────────────────────────────────────────────────────────┐
│                        AI WIZARD FLOW                       │
│                                                             │
│  User ──▶ "What would you like to do?"                     │
│           ├── Create a Report                               │
│           ├── Create a Dashboard                            │
│           ├── Create a Data Source                           │
│           ├── Create a Schedule                             │
│           ├── Update / Delete / List ...                    │
│           └── Something else (free-form)                    │
│                                                             │
│  LLM guides through steps ──▶ Generates XML Plan           │
│  User reviews plan ──▶ Confirms ──▶ Backend executes        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 User Journey & Conversation Flows

#### Flow 1: Create a Dashboard (with dependency resolution)

```
WIZARD: What would you like to do?
  [ ] Create a Report
  [x] Create a Dashboard
  [ ] Create a Data Source
  [ ] Create a Schedule
  [ ] Update an existing item
  [ ] Delete an existing item
  [ ] List existing items
  [ ] Something else

USER: Create a Dashboard

WIZARD: Great! Let's create a dashboard. A dashboard displays one or more reports.
        Do you already have reports created?
  [ ] Yes, I have reports
  [x] No, I don't have reports yet

USER: No

WIZARD: No problem! Let's create a report first.
        Do you have a data source configured?
  [ ] Yes, I have a data source
  [x] No, I need to create one

USER: No

WIZARD: Let's set up a data source first. What type of data source?
  [ ] PostgreSQL Database
  [ ] MySQL Database
  [x] Excel / CSV File
  [ ] SQL Server
  [ ] MongoDB

USER: Excel

WIZARD: Please provide the following details for the Excel data source:
  - Name: ___
  - Upload file: [📎 Upload]

USER: Name: "Sales Data Q4", File: sales_q4.xlsx

WIZARD: File uploaded. I found these sheets: ["Q4 Data", "Summary"]
        Which sheet should be used?
  [x] Q4 Data
  [ ] Summary

USER: Q4 Data

WIZARD: Available columns: [Month, Revenue, Cost, Profit, Region]
        Now let's create the report. What type of chart?
  [x] Bar Chart
  [ ] Line Chart
  [ ] Pie Chart
  [ ] Table
  [ ] Area Chart

USER: Bar Chart

WIZARD: Configure the bar chart:
  - Report Name: ___
  - Description: ___
  - X-Axis (category): [Month ▾]
  - Y-Axis (value): [Revenue ▾]

USER: Name: "Q4 Revenue by Month", X: Month, Y: Revenue

WIZARD: Now let's set up the dashboard.
  - Dashboard Name: ___
  - Description: ___

USER: Name: "Q4 Sales Dashboard", Description: "Quarterly sales overview"

WIZARD: Here's your plan. Review and confirm:

  ┌──────────────────────────────────────────────────┐
  │ TASK PLAN (3 steps)                              │
  │                                                  │
  │ Step 1: Create Data Source "Sales Data Q4"       │
  │   • Type: excel                                  │
  │   • File: sales_q4.xlsx, Sheet: Q4 Data          │
  │                                                  │
  │ Step 2: Create Report "Q4 Revenue by Month"      │
  │   • Chart: bar                                   │
  │   • X-Axis: Month, Y-Axis: Revenue               │
  │   • Source: → Step 1 output                      │
  │                                                  │
  │ Step 3: Create Dashboard "Q4 Sales Dashboard"    │
  │   • Reports: → Step 2 output                     │
  │   • Description: Quarterly sales overview        │
  └──────────────────────────────────────────────────┘

  [✓ Execute Plan]  [✎ Modify]  [✕ Cancel]

USER: Execute Plan

WIZARD: ✅ Step 1 complete — Data source "Sales Data Q4" created (ID: 5)
        ✅ Step 2 complete — Report "Q4 Revenue by Month" created (ID: 8)
        ✅ Step 3 complete — Dashboard "Q4 Sales Dashboard" created (ID: 4)
        
        🎉 All tasks completed successfully!
        [View Dashboard →]
```

#### Flow 2: Update an Existing Report

```
WIZARD: What would you like to do?
USER: Update an existing item

WIZARD: What would you like to update?
  [x] Report
  [ ] Dashboard
  [ ] Data Source
  [ ] Schedule

USER: Report

WIZARD: Here are your existing reports:
  1. Sales Report (ID: 1) — Monthly sales data
  2. User Growth (ID: 2) — New user signups
  3. Q4 Revenue by Month (ID: 8) — Bar chart

  Which report to update? ___

USER: 1

WIZARD: What would you like to change for "Sales Report"?
  [ ] Name
  [ ] Description
  [x] Chart Type
  [x] Axis Configuration
  [ ] Data Source

USER: Chart type and axis

WIZARD: Current: Bar chart, X=month, Y=amount
  - New chart type: [Line ▾]
  - New X-Axis: [month ▾]  (keep current)
  - New Y-Axis: [amount ▾]  (keep current)

USER: Change to Line chart, keep axes

WIZARD: Plan generated:
  Step 1: Update Report "Sales Report" (ID: 1)
    • Chart Type: bar → line
  
  [✓ Execute]  [✕ Cancel]
```

#### Flow 3: List & Delete

```
WIZARD: What would you like to do?
USER: List existing items

WIZARD: What would you like to list?
  [x] All items
  [ ] Reports only
  [ ] Dashboards only
  [ ] Data Sources only
  [ ] Schedules only

WIZARD: Here's everything in your system:

  📊 Reports (3):
  ┌────┬──────────────────────┬──────────┬─────────────┐
  │ ID │ Name                 │ Type     │ Data Source  │
  ├────┼──────────────────────┼──────────┼─────────────┤
  │ 1  │ Sales Report         │ bar      │ Production DB│
  │ 2  │ User Growth          │ line     │ Marketing   │
  │ 8  │ Q4 Revenue by Month  │ bar      │ Sales Data  │
  └────┴──────────────────────┴──────────┴─────────────┘

  📋 Dashboards (3):
  ...

  🔌 Data Sources (3):
  ...

  ⏰ Schedules (2):
  ...

  Would you like to take any action on these items?
```

### 1.3 Supported Operations

| Entity | Create | Read/List | Update | Delete |
|--------|--------|-----------|--------|--------|
| **Data Source** | ✅ Type, connection config, file upload | ✅ List all, filter by type | ✅ Name, config, re-test | ✅ By ID (cascade warning) |
| **Report** | ✅ Name, source, chart type, axes, columns, aggregates | ✅ List all, filter by source | ✅ Name, description, config, source | ✅ By ID (cascade warning) |
| **Dashboard** | ✅ Name, description, add reports to layout | ✅ List all | ✅ Name, description, layout | ✅ By ID |
| **Schedule** | ✅ Name, cron, task type, target | ✅ List all, filter active | ✅ Name, cron, active status | ✅ By ID |

#### "Something Else" — Free-Form Mode

When the user selects "Something else," the wizard enters a free-form conversation mode where the LLM tries to understand the user's intent and maps it to available operations. If the request is within scope, it proceeds with guided questions. If out of scope, it politely declines.

### 1.4 XML Task Plan Architecture

The LLM generates an XML document representing the sequence of operations. The XML schema is designed to be:
- **Declarative** — describes what to do, not how
- **Ordered** — steps execute in sequence
- **Reference-able** — later steps can reference outputs of earlier steps
- **Validatable** — backend validates against a strict XSD before execution

#### XML Schema Definition

```xml
<?xml version="1.0" encoding="UTF-8"?>
<TaskPlan version="1.0" generatedAt="2026-02-20T13:00:00Z">
  
  <metadata>
    <description>Create Q4 Sales Dashboard with report and data source</description>
    <estimatedSteps>3</estimatedSteps>
    <requestedBy>user@example.com</requestedBy>
  </metadata>

  <steps>
    
    <!-- Step 1: Create Data Source -->
    <step id="step-1" operation="CREATE" entity="DATA_SOURCE">
      <params>
        <param name="name">Sales Data Q4</param>
        <param name="type">excel</param>
        <param name="connectionType">file</param>
        <param name="fileMetadata">
          <file name="sales_q4.xlsx" sheet="Q4 Data" />
        </param>
      </params>
      <output ref="ds-1" field="id" />
    </step>

    <!-- Step 2: Create Report (references Step 1 output) -->
    <step id="step-2" operation="CREATE" entity="REPORT" dependsOn="step-1">
      <params>
        <param name="name">Q4 Revenue by Month</param>
        <param name="description">Bar chart showing Q4 revenue</param>
        <param name="sourceId" ref="ds-1" />
        <param name="config">
          <chartConfig type="bar" xAxis="Month" yAxis="Revenue" />
        </param>
      </params>
      <output ref="report-1" field="id" />
    </step>

    <!-- Step 3: Create Dashboard (references Step 2 output) -->
    <step id="step-3" operation="CREATE" entity="DASHBOARD" dependsOn="step-2">
      <params>
        <param name="name">Q4 Sales Dashboard</param>
        <param name="description">Quarterly sales overview</param>
        <param name="layout">
          <widget type="chart" reportId="report-1" position="0,0" size="12,6" />
        </param>
      </params>
      <output ref="dashboard-1" field="id" />
    </step>

  </steps>

</TaskPlan>
```

#### Supported Operations in XML

| `operation` | `entity` | Description |
|-------------|----------|-------------|
| `CREATE` | `DATA_SOURCE`, `REPORT`, `DASHBOARD`, `SCHEDULE` | Create a new entity |
| `UPDATE` | `DATA_SOURCE`, `REPORT`, `DASHBOARD`, `SCHEDULE` | Update existing entity by ID |
| `DELETE` | `DATA_SOURCE`, `REPORT`, `DASHBOARD`, `SCHEDULE` | Delete entity by ID |
| `LIST` | `DATA_SOURCE`, `REPORT`, `DASHBOARD`, `SCHEDULE`, `ALL` | List entities |

#### Reference Resolution

Steps can reference outputs of previous steps using the `ref` attribute:

```xml
<!-- Step 1 declares an output -->
<output ref="ds-1" field="id" />

<!-- Step 2 references it -->
<param name="sourceId" ref="ds-1" />
```

During execution, the backend resolves `ref="ds-1"` by retrieving the `id` field from the Step 1 API response.

### 1.5 Backend Design

#### New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/wizard/start` | Start a new wizard session |
| `POST` | `/wizard/session/:id/message` | Send a message/choice in the wizard |
| `GET`  | `/wizard/session/:id` | Get current wizard session state |
| `POST` | `/wizard/session/:id/execute` | Execute the generated XML task plan |
| `GET`  | `/wizard/session/:id/plan` | Get the generated XML plan for review |
| `DELETE` | `/wizard/session/:id` | Cancel/delete a wizard session |

#### Wizard Session State Machine

```
┌──────────┐    User starts    ┌───────────────┐
│  INIT    │ ──────────────▶  │  COLLECTING   │
└──────────┘                  └───────┬───────┘
                                      │ User provides
                                      │ all required info
                                      ▼
                              ┌───────────────┐
                              │  PLANNING     │ ◀── LLM generates XML
                              └───────┬───────┘
                                      │ User reviews
                                      ▼
                              ┌───────────────┐
                     ┌─ yes ──│  CONFIRMING   │── no ──▶ Back to COLLECTING
                     │        └───────────────┘
                     ▼
              ┌─────────────┐
              │  EXECUTING  │ ──▶ Steps run sequentially
              └──────┬──────┘
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
    ┌────────────┐     ┌─────────────┐
    │ COMPLETED  │     │   FAILED    │
    └────────────┘     └─────────────┘
```

#### LLM System Prompt for Wizard

The wizard uses a specialized system prompt that instructs the LLM to:

1. Only ask one question at a time
2. Provide clickable options where possible
3. Track dependencies between entities
4. Generate valid XML conforming to the schema
5. Never hallucinate entity IDs — always query the database for existing items

```
You are an AI Wizard for the Report Manager application.
Your role is to guide users step-by-step through creating,
updating, deleting, or listing reports, dashboards, data sources,
and schedules.

RULES:
- Ask ONE question at a time
- Always offer concrete choices when possible
- Track what entities the user needs (dependency chain)
- When all information is collected, generate an XML Task Plan
- The XML MUST conform to the TaskPlan schema v1.0
- Reference existing entities by their real database IDs
- For new entities that depend on other new entities, use <output ref="...">

AVAILABLE ENTITIES:
- DATA_SOURCE: Types = postgres, mysql, excel, csv, sqlserver, mongodb, oracle
- REPORT: Chart types = bar, line, pie, table, area
- DASHBOARD: Collection of reports with layout
- SCHEDULE: Cron-based task automation

CURRENT SYSTEM DATA:
{dynamic_context_injected_here}
```

#### XML Validator & Executor

New backend module: `wizard_executor.js`

```javascript
// Pseudocode for the XML executor flow
class WizardExecutor {
    
    async validatePlan(xmlString) {
        // 1. Parse XML
        // 2. Validate against schema (operations, entities, params)
        // 3. Check dependency graph (no circular refs)
        // 4. Verify referenced IDs exist in database
        // 5. Return { valid: boolean, errors: string[] }
    }

    async executePlan(xmlString, userId) {
        const plan = parseXML(xmlString);
        const outputs = {};  // ref -> value mapping
        const results = [];

        for (const step of plan.steps) {
            // Resolve references
            const resolvedParams = resolveRefs(step.params, outputs);
            
            // Execute via existing API handlers
            const result = await this.executeStep(step, resolvedParams, userId);
            
            // Store output for reference by later steps
            if (step.output) {
                outputs[step.output.ref] = result[step.output.field];
            }
            
            results.push({
                stepId: step.id,
                status: 'success',
                entity: step.entity,
                operation: step.operation,
                result
            });
        }
        
        return results;
    }

    async executeStep(step, params, userId) {
        switch (`${step.operation}_${step.entity}`) {
            case 'CREATE_DATA_SOURCE':
                return await createDataSource(params);
            case 'CREATE_REPORT':
                return await createReport(params);
            case 'CREATE_DASHBOARD':
                return await createDashboard(params);
            case 'CREATE_SCHEDULE':
                return await createSchedule(params);
            case 'UPDATE_REPORT':
                return await updateReport(params.id, params);
            case 'DELETE_REPORT':
                return await deleteReport(params.id);
            // ... etc.
        }
    }
}
```

### 1.6 Frontend Design

#### New Route: `/wizard`

A dedicated page at `frontend/src/app/wizard/page.tsx`.

#### UI Components

| Component | Description |
|-----------|-------------|
| `WizardChat` | Main conversation panel (chat-like interface for the wizard conversation) |
| `WizardOptions` | Renders clickable option cards/buttons from the LLM's response |
| `WizardPlanReview` | Visual representation of the generated XML plan with step-by-step preview |
| `WizardProgress` | Shows execution progress with success/error indicators |
| `WizardSidebar` | Lists previous wizard sessions with status |

#### UI Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│  🧙‍♂️ AI Wizard                                    [History ▾] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  What would you like to do today?                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ 📊 Create    │ │ 📋 Create    │ │ 🔌 Create    │          │
│  │ Report       │ │ Dashboard    │ │ Data Source   │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ ⏰ Create    │ │ ✏️ Update    │ │ 🗑️ Delete     │          │
│  │ Schedule     │ │ Item         │ │ Item          │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│  ┌──────────────┐ ┌──────────────┐                           │
│  │ 📋 List      │ │ 💬 Something │                           │
│  │ Items        │ │ Else         │                           │
│  └──────────────┘ └──────────────┘                           │
│                                                               │
│  ┌──────────────────────────────────────┐ ┌────────────────┐  │
│  │ Type your message...                 │ │  Send  ▶       │  │
│  └──────────────────────────────────────┘ └────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### 1.7 Database Changes

#### New Table: `wizard_sessions`

```sql
CREATE TABLE wizard_sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    userId      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      TEXT DEFAULT 'INIT',         -- INIT, COLLECTING, PLANNING, CONFIRMING, EXECUTING, COMPLETED, FAILED
    intent      TEXT,                         -- CREATE, UPDATE, DELETE, LIST
    entity      TEXT,                         -- REPORT, DASHBOARD, DATA_SOURCE, SCHEDULE
    context     TEXT,                         -- JSON: collected params so far
    xmlPlan     TEXT,                         -- Generated XML task plan
    result      TEXT,                         -- JSON: execution results
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt   TIMESTAMP
);
```

#### New Table: `wizard_messages`

```sql
CREATE TABLE wizard_messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId       INTEGER NOT NULL REFERENCES wizard_sessions(id) ON DELETE CASCADE,
    role            TEXT NOT NULL,            -- 'user', 'assistant', 'system'
    content         TEXT NOT NULL,
    options         TEXT,                     -- JSON array of option objects
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.8 Error Handling & Validation

| Scenario | Handling |
|----------|----------|
| Invalid XML generated by LLM | Re-prompt the LLM with validation errors and ask it to fix |
| Referenced entity doesn't exist | Show error to user, ask to create it or pick another |
| Step fails mid-execution | Roll back successful steps (if possible), mark session as FAILED, show partial results |
| LLM timeout | Retry once, then show error with option to retry manually |
| File upload required | Prompt user to upload via the wizard UI before proceeding |
| Permission denied | Check RBAC before execution, surface the specific missing permission |

---

## Enhancement 2 — Full-Featured Chat Page

### 2.1 Overview

Replace the existing basic chat interface with a **full-featured, modern LLM chat experience** comparable to commercial chatbot UIs (ChatGPT, Claude, etc.). This builds on the existing chat routes and RAG system.

### 2.2 Feature Requirements

#### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Streaming Responses** | Real-time token-by-token response rendering using SSE | P0 |
| **Markdown Rendering** | Full markdown with tables, lists, headings, bold, italic | P0 (exists) |
| **Code Highlighting** | Syntax-highlighted code blocks with copy button | P0 (exists, enhance) |
| **Conversation Management** | Create, rename, delete, search conversations | P0 (partial) |
| **Model Selection** | Switch models per conversation with auto-select | P0 (exists) |
| **Message Actions** | Copy, regenerate, edit message | P1 |
| **System Prompt** | User-configurable system prompt per conversation | P1 |
| **Conversation Search** | Search across all conversations | P1 |
| **Message Reactions** | Thumbs up/down for response quality feedback | P2 |
| **Export Chat** | Export conversation as Markdown or PDF | P2 |
| **Keyboard Shortcuts** | Ctrl+Enter to send, Ctrl+N new chat, etc. | P1 |
| **Typing Indicators** | Animated indicator while LLM is processing | P0 |
| **Stop Generation** | Button to abort ongoing generation | P1 |

#### UI/UX Requirements

| Feature | Description |
|---------|-------------|
| **Responsive Layout** | Desktop: sidebar + main. Mobile: collapsible sidebar |
| **Dark/Light Theme** | Follow system theme (already supported) |
| **Auto-scroll** | Smart scroll — auto-scroll during generation, pause if user scrolls up |
| **Message Grouping** | Group consecutive messages by role |
| **Timestamp Display** | Show message timestamps on hover |
| **Empty State** | Welcoming empty state with suggested prompts |
| **Error States** | Graceful error display with retry options |

### 2.3 Backend Design

#### Streaming Chat Endpoint

The key change is enabling **Server-Sent Events (SSE)** for real-time streaming.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat/conversations/:id/messages/stream` | SSE streaming chat endpoint |
| `POST` | `/chat/conversations/:id/messages/stop` | Abort ongoing generation |
| `PATCH` | `/chat/conversations/:id/messages/:msgId` | Edit a message |
| `POST` | `/chat/conversations/:id/messages/:msgId/regenerate` | Regenerate a response |
| `POST` | `/chat/conversations/:id/messages/:msgId/react` | Add reaction to message |
| `GET`  | `/chat/search` | Search across conversations |
| `POST` | `/chat/conversations/:id/export` | Export conversation |
| `PATCH` | `/chat/conversations/:id/system-prompt` | Set custom system prompt |

#### Streaming Implementation

```javascript
// POST /chat/conversations/:id/messages/stream
app.post('/chat/conversations/:id/messages/stream', authenticateToken, async (req, res) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // ... build messages array with RAG context ...

    // Stream from Ollama
    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
        model: modelName,
        messages: messagesForOllama,
        stream: true  // Enable streaming
    }, { responseType: 'stream' });

    let fullContent = '';

    response.data.on('data', (chunk) => {
        const data = JSON.parse(chunk.toString());
        if (data.message?.content) {
            fullContent += data.message.content;
            res.write(`data: ${JSON.stringify({ 
                type: 'token', 
                content: data.message.content 
            })}\n\n`);
        }
    });

    response.data.on('end', async () => {
        // Save complete assistant message to DB
        await knex('chat_messages').insert({
            conversationId, role: 'assistant',
            content: fullContent, createdAt: knex.fn.now()
        });
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
    });

    // Handle client disconnect (stop generation)
    req.on('close', () => {
        response.data.destroy();  // Abort Ollama stream
    });
});
```

#### Stop Generation

```javascript
// Track active streams per conversation
const activeStreams = new Map();

// POST /chat/conversations/:id/messages/stop
app.post('/chat/conversations/:id/messages/stop', authenticateToken, (req, res) => {
    const stream = activeStreams.get(req.params.id);
    if (stream) {
        stream.destroy();
        activeStreams.delete(req.params.id);
    }
    res.sendStatus(200);
});
```

### 2.4 Frontend Design

#### New Component Structure

```
frontend/src/
├── app/chat/
│   └── page.tsx                    # Main chat page (REWRITE)
├── components/chat/
│   ├── ChatSidebar.tsx             # [NEW] Conversation list sidebar
│   ├── ChatHeader.tsx              # [NEW] Top bar with title, model, actions
│   ├── ChatMessageList.tsx         # [NEW] Scrollable message area
│   ├── ChatMessage.tsx             # [NEW] Individual message bubble
│   ├── ChatInput.tsx               # [NEW] Input area with attachments
│   ├── ChatEmptyState.tsx          # [NEW] Welcome screen with suggestions
│   ├── ChatCodeBlock.tsx           # [NEW] Code block with copy + language tag
│   ├── ChatSystemPrompt.tsx        # [NEW] System prompt editor modal
│   ├── ChatExportDialog.tsx        # [NEW] Export options dialog
│   └── ChatSearchDialog.tsx        # [NEW] Search across conversations
```

#### Enhanced Chat UI Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│ 💬 Chat                                                    [User ▾] │
├────────────────┬─────────────────────────────────────────────────────┤
│                │                                                     │
│ [+ New Chat]   │  📊 Data Analysis Chat          [llama3 ▾] [⚙️]  │
│                │  ─────────────────────────────────────────────────  │
│ 🔍 Search...   │                                                     │
│                │  ┌──────────────────────────────────────────────┐   │
│ Today          │  │ 👤 What reports are available in the system? │   │
│ ├ Data Anal... │  └──────────────────────────────────────────────┘   │
│ ├ Sales Q&A    │                                                     │
│                │  ┌──────────────────────────────────────────────┐   │
│ Yesterday      │  │ 🤖 Based on the system data, you have       │   │
│ ├ Dashboard... │  │    3 reports:                                 │   │
│ ├ Help with... │  │                                               │   │
│                │  │    1. **Sales Report** — Monthly sales data   │   │
│ Last 7 days    │  │    2. **User Growth** — New user signups     │   │
│ ├ Report Co... │  │    3. **Q4 Revenue** — Bar chart              │   │
│ ├ API Questi.. │  │                                               │   │
│                │  │    ```sql                                     │   │
│                │  │    SELECT * FROM reports;                     │   │
│                │  │    ```                                [📋]    │   │
│                │  │                                               │   │
│                │  │  [👍] [👎] [📋 Copy] [🔄 Regenerate]        │   │
│                │  └──────────────────────────────────────────────┘   │
│                │                                                     │
│                │  ┌──────────────────────────────────────────────┐   │
│                │  │ 🤖 ██████████░░ Generating...    [⏹ Stop]   │   │
│                │  └──────────────────────────────────────────────┘   │
│                │                                                     │
│                │  ───────────────────────────────────────────────    │
│                │  ┌────────────────────────────────┐ [📎] [⬆️]     │
│                │  │ Ask anything about your data...  │              │
│                │  └────────────────────────────────┘               │
│                │  Ctrl+Enter to send · Shift+Enter for new line    │
└────────────────┴─────────────────────────────────────────────────────┘
```

### 2.5 Database Changes

#### Modify: `chat_conversations` table

```sql
-- Add new columns
ALTER TABLE chat_conversations ADD COLUMN systemPrompt TEXT;
ALTER TABLE chat_conversations ADD COLUMN pinned INTEGER DEFAULT 0;
ALTER TABLE chat_conversations ADD COLUMN archived INTEGER DEFAULT 0;
ALTER TABLE chat_conversations ADD COLUMN userId INTEGER REFERENCES users(id);
```

#### Modify: `chat_messages` table

```sql
-- Add new columns
ALTER TABLE chat_messages ADD COLUMN edited INTEGER DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN originalContent TEXT;
ALTER TABLE chat_messages ADD COLUMN reaction TEXT;        -- 'thumbsup', 'thumbsdown', null
ALTER TABLE chat_messages ADD COLUMN tokenCount INTEGER;
```

---

## Shared Infrastructure

### LLM Service Layer

Both enhancements share the LLM integration. Create a shared service:

```
backend/
├── services/
│   ├── llm_service.js          # [NEW] Shared Ollama communication
│   ├── wizard_executor.js      # [NEW] XML plan validator & executor
│   └── rag_context.js          # [NEW] Extracted from server.js RAG logic
```

#### `llm_service.js` — Shared LLM Wrapper

```javascript
class LLMService {
    constructor(ollamaUrl) {
        this.ollamaUrl = ollamaUrl;
    }

    async chat(model, messages, options = {}) { /* non-streaming */ }
    async chatStream(model, messages, onToken, onDone, onError) { /* streaming */ }
    async selectModel(preferredModels) { /* auto model selection */ }
    async generateTitle(content, model) { /* title generation */ }
    async generateXMLPlan(context, model) { /* wizard XML generation */ }
}
```

### Navigation Update

Add the Wizard to the sidebar navigation:

```
Current nav:                  Updated nav:
├── Dashboard                 ├── Dashboard
├── Reports                   ├── Reports
├── Data Sources              ├── Data Sources
├── Schedules                 ├── Schedules
├── AI Insights               ├── AI Insights
├── Chat                      ├── Chat          (enhanced)
├── Analytics                 ├── 🧙 AI Wizard  (NEW)
├── LLM Management            ├── Analytics
└── Admin                     ├── LLM Management
                              └── Admin
```

### Permission Updates

| Permission | Description |
|------------|-------------|
| `USE_WIZARD` | Access the AI Wizard feature |
| `EXECUTE_WIZARD_PLAN` | Execute generated task plans |
| `VIEW_CHAT` | Access the full chat page (exists) |
| `EXPORT_CHAT` | Export chat conversations |

---

## Implementation Phases

### Phase 1: Foundation (Week 1–2)
- [ ] Extract shared LLM service from `server.js`
- [ ] Extract RAG context builder into its own module
- [ ] Add streaming support to the chat endpoint
- [ ] Create `wizard_sessions` and `wizard_messages` tables
- [ ] Update `chat_conversations` and `chat_messages` schemas

### Phase 2: Enhanced Chat (Week 2–3)
- [ ] Build streaming chat frontend with SSE
- [ ] Implement ChatSidebar with search and conversation grouping
- [ ] Add code block copy functionality
- [ ] Add message actions (copy, regenerate, edit)
- [ ] Add system prompt configuration
- [ ] Implement stop generation
- [ ] Add keyboard shortcuts

### Phase 3: AI Wizard Backend (Week 3–4)
- [ ] Implement wizard session API endpoints
- [ ] Build XML task plan schema and validator
- [ ] Implement XML executor with reference resolution
- [ ] Add wizard-specific LLM system prompt
- [ ] Add rollback capability for failed plans

### Phase 4: AI Wizard Frontend (Week 4–5)
- [ ] Build wizard page with chat-like interface
- [ ] Implement option card components
- [ ] Build XML plan review/visualization component
- [ ] Add execution progress tracking UI
- [ ] Implement wizard session history sidebar

### Phase 5: Polish & Testing (Week 5–6)
- [ ] End-to-end testing of all wizard flows
- [ ] Chat stress testing (long conversations, large outputs)
- [ ] RBAC integration testing
- [ ] Responsive design testing
- [ ] Performance optimization (lazy loading, virtualized lists)
- [ ] Documentation and user guide

---

## API Reference

### Wizard APIs

```
POST   /wizard/start
  Body: { }
  Response: { sessionId, status: "INIT", message: "What would you like to do?", options: [...] }

POST   /wizard/session/:id/message
  Body: { content: "Create a dashboard", selectedOption: "CREATE_DASHBOARD" }
  Response: { message: "...", options: [...], status: "COLLECTING" }

GET    /wizard/session/:id
  Response: { id, status, intent, entity, context, xmlPlan, messages: [...] }

GET    /wizard/session/:id/plan
  Response: { xmlPlan: "<?xml ...?>", summary: "3 steps: ..." }

POST   /wizard/session/:id/execute
  Body: { confirmed: true }
  Response: { results: [{ stepId, status, entity, operation, result }] }

DELETE /wizard/session/:id
  Response: 204 No Content
```

### Enhanced Chat APIs

```
POST   /chat/conversations/:id/messages/stream
  Body: { content: "...", imageUrl?: "...", fileUrl?: "..." }
  Response: SSE stream — data: { type: "token"|"done"|"error", content?: "..." }

POST   /chat/conversations/:id/messages/stop
  Response: 200

PATCH  /chat/conversations/:id/messages/:msgId
  Body: { content: "updated content" }
  Response: 200

POST   /chat/conversations/:id/messages/:msgId/regenerate
  Response: SSE stream (same as /stream)

POST   /chat/conversations/:id/messages/:msgId/react
  Body: { reaction: "thumbsup" | "thumbsdown" | null }
  Response: 200

GET    /chat/search?q=query
  Response: [{ conversationId, title, matchingMessages: [...] }]

POST   /chat/conversations/:id/export
  Body: { format: "markdown" | "pdf" }
  Response: { url: "/exports/chat-123.md" }

PATCH  /chat/conversations/:id/system-prompt
  Body: { systemPrompt: "You are a helpful..." }
  Response: 200
```

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM generates invalid XML | Wizard fails | Strict schema validation + retry with error feedback to LLM |
| Long LLM response times | Poor UX | Streaming (chat), progress indicators (wizard), timeout handling |
| Partial execution failure | Inconsistent state | Transaction-like rollback for wizard plans, status tracking per step |
| Prompt injection attacks | Security | Sanitize user input before including in LLM prompts, validate XML output |
| Context window limits | Truncated responses | Smart context pruning, use sliding window for long conversations |
| Ollama unavailable | Feature unusable | Graceful degradation, clear error messages, connection retry logic |
| Rate limiting | LLM overloaded | Queue wizard executions, rate limit per user |

---

> **Next Steps**: Review this document, provide feedback on priorities and scope, then proceed with Phase 1 implementation.
