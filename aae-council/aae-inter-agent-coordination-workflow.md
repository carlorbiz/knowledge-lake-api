# AAE Inter-Agent Coordination Workflow: Jan (Genspark) → Manus

**Date Created**: 26 November 2025  
**Status**: Active  
**Purpose**: Enable asynchronous task coordination between Jan (Genspark) and Manus via Gmail drafts

---

## Overview

This workflow establishes a scheduled inter-agent coordination mechanism where Jan (Genspark) can create task requests for Manus by drafting emails, which Manus then processes automatically at scheduled intervals.

## Architecture

### Agent Roles

**Jan (Genspark)**
- **Schedule**: 8:00 AM daily (AEDT - GMT+11)
- **Function**: Task creation and request generation
- **Output**: Gmail draft emails addressed to carla@carlorbiz.com.au
- **Subject Line**: "Manus action this"
- **Capabilities**: Can schedule email tasks and create drafts for Manus to process

**Manus**
- **Schedule**: 9:00 AM daily (AEDT - GMT+11) + 4:00 PM daily (AEDT - GMT+11)
- **Function**: Task execution and completion
- **Input**: Gmail drafts with subject "Manus action this"
- **Output**: Completed tasks sent as emails to user's inbox
- **Capabilities**: Full MCP access (Notion, Gmail, Google Calendar), GitHub integration, web development, data analysis, document generation

### Timing Coordination

```
8:00 AM → Jan creates draft email with task request
9:00 AM → Manus checks drafts, processes tasks, sends completion email
4:00 PM → Manus second daily check for any additional drafts
```

**Time Gap**: 1 hour between Jan's draft creation and Manus's processing ensures the draft is ready for pickup.

---

## Workflow Process

### Phase 1: Task Request Creation (Jan)

1. Jan identifies a task or request that requires Manus's capabilities
2. Jan creates a Gmail draft email with:
   - **To**: carla@carlorbiz.com.au
   - **Subject**: "Manus action this"
   - **Body**: Clear task description with context and requirements
3. Draft is saved (not sent) and remains in drafts folder

### Phase 2: Draft Detection (Manus)

1. At 9:00 AM (and 4:00 PM), Manus executes scheduled task
2. Searches Gmail using query: `in:draft subject:"Manus action this"`
3. Retrieves all matching draft thread IDs
4. Reads full thread content using `gmail_read_threads`

### Phase 3: Task Execution (Manus)

1. Parses email body to extract task requirements
2. Executes the requested task using available tools and MCPs:
   - Notion database creation/updates
   - Google Calendar event management
   - Document generation and GitHub commits
   - Web research and data analysis
   - Any other capability within Manus's toolkit
3. Generates completion summary with results

### Phase 4: Response Delivery (Manus)

1. Prepares response in structured format:
   ```
   ---
   TASK COMPLETED - [Date/Time]
   ---
   
   [Summary of what was completed]
   [Key results or findings]
   [Any attachments included: list files]
   
   ---
   ORIGINAL REQUEST BELOW
   ---
   
   [Original draft email body content]
   ```

2. Sends the draft email using `gmail_send_message`:
   - Keeps original recipients (carla@carlorbiz.com.au)
   - Keeps original subject line ("Manus action this")
   - Prepends completion response to original body
   - Attaches any generated files

3. **Draft Cleanup**: Sending the draft automatically:
   - Removes it from the drafts folder
   - Delivers it to the inbox
   - Prevents duplicate processing in subsequent runs

---

## Use Cases

### 1. Cross-Agent Task Requests
Jan can request Manus to perform tasks that require:
- Notion database operations
- GitHub repository management
- Complex document generation
- Web development or deployment
- Data analysis and visualization

### 2. MCP Access Sharing
Jan can request access to Manus's MCP capabilities:
- "Please create a Notion page summarizing [topic]"
- "Add an event to Google Calendar for [details]"
- "Search Gmail for emails from [sender] and summarize"

### 3. AAE Council Coordination
Enables asynchronous collaboration across the AAE Council:
- Task handoffs between agents
- Information sharing and context updates
- Coordinated workflow execution

---

## Technical Specifications

### Gmail Search Query
```
in:draft subject:"Manus action this"
```

### MCP Tools Used

**Gmail MCP**
- `gmail_search_messages`: Locate draft emails
- `gmail_read_threads`: Retrieve full draft content
- `gmail_send_message`: Send completed draft with response

**Notion MCP**
- Available for database and page operations as requested

**Google Calendar MCP**
- Available for event management as requested

### Scheduling Configuration

**9:00 AM Daily Task**
- **Cron Expression**: `0 0 9 * * *`
- **Timezone**: AEDT (GMT+11)
- **Repeat**: Daily
- **Task Name**: "Gmail Draft Monitoring - 9am Daily"

**4:00 PM Daily Task**
- **Cron Expression**: `0 0 16 * * *`
- **Timezone**: AEDT (GMT+11)
- **Repeat**: Daily
- **Task Name**: "Gmail Draft Monitoring - 4pm Daily"

---

## Error Handling

### Draft Not Found
- No action taken
- Wait for next scheduled run
- No error notification sent

### Task Execution Failure
- Send draft email with error details
- Include troubleshooting suggestions
- Log error for review

### Unclear Task Description
- Send draft email with clarification request
- Ask specific questions about requirements
- Preserve original request in email body

---

## Benefits

### For the User (Carla)
1. **Seamless Inter-Agent Collaboration**: Agents work together without manual intervention
2. **Asynchronous Task Processing**: Tasks are queued and executed automatically
3. **Email-Based Audit Trail**: All task requests and completions are documented in inbox
4. **Flexible Timing**: Two daily checkpoints (9am and 4pm) for task processing

### For the AAE Council
1. **Extended Capabilities**: Jan gains access to Manus's MCP tools
2. **Context Continuity**: All agents can reference completed tasks via email history
3. **Scalable Coordination**: Pattern can be extended to other agent pairs
4. **Knowledge Sharing**: Task completions are documented and accessible

---

## Future Enhancements

### Potential Improvements
1. **Priority Flagging**: Use email flags or keywords to indicate urgent tasks
2. **Multi-Agent Requests**: Enable Jan to request tasks from multiple agents
3. **Response Routing**: Allow Jan to specify alternative recipients for results
4. **Task Templates**: Create standardized formats for common request types
5. **Status Tracking**: Implement a Notion database to track inter-agent task status

### Scalability Considerations
- Pattern can be replicated for other agent pairs (e.g., Grok → Manus, Gemini → Manus)
- Could evolve into a full inter-agent task queue system
- May benefit from dedicated AAE coordination dashboard

---

## Monitoring and Maintenance

### Success Metrics
- Number of drafts processed per day
- Task completion rate
- Average processing time
- Error frequency

### Maintenance Tasks
- Weekly review of processed drafts
- Monthly analysis of task patterns
- Quarterly optimization of workflow timing
- As-needed updates to playbook documentation

---

## Related Documentation

- **Playbook**: Gmail Draft Monitoring Workflow (embedded in scheduled task)
- **GitHub Repository**: carlorbiz/mem0 (AAE Council memory points)
- **Notion Workspace**: AAE Council coordination databases
- **Related Agents**: Jan (Genspark), Manus, AAE Council members

---

## Contact and Support

**Primary User**: Carla Taylor (carla@carlorbiz.com.au)  
**AAE Council**: All agents have access to this documentation via GitHub  
**Last Updated**: 26 November 2025  
**Next Review**: Weekly monitoring, monthly optimization

---

## Appendix: Example Task Request

### Sample Draft Email from Jan

**To**: carla@carlorbiz.com.au  
**Subject**: Manus action this  
**Body**:
```
Hi Manus,

Please create a Notion database to track all AAE Council inter-agent 
task requests for the month of December 2025. Include the following 
properties:

- Requesting Agent
- Target Agent
- Task Description
- Date Requested
- Date Completed
- Status (Pending, In Progress, Completed, Failed)
- Priority (High, Medium, Low)
- Results Summary
- Related Links

Also, please add this first coordination task as the initial entry.

Thanks!
Jan (via Genspark)
```

### Expected Response from Manus

```
---
TASK COMPLETED - 26 November 2025, 9:15 AM
---

Hi Carla,

I've successfully created the Notion database for AAE Council inter-agent 
task tracking as requested by Jan.

WHAT WAS COMPLETED:

1. **Notion Database Created**
   - Database Name: "AAE Council - Inter-Agent Task Tracker"
   - Database URL: [Notion URL]
   - All 9 requested properties configured
   - First entry added (this coordination task)

2. **Initial Entry Details**
   - Requesting Agent: Jan (Genspark)
   - Target Agent: Manus
   - Status: Completed
   - Date Completed: 26 November 2025

The database is now ready for tracking all inter-agent coordination 
tasks across the AAE Council.

Best regards,
Manus

---
ORIGINAL REQUEST BELOW
---

[Original Jan's request content]
```

---

**End of Documentation**
