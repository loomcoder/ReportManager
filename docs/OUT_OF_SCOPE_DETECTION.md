# Out-of-Scope Query Detection - Implementation Summary

## Overview
Added intelligent guardrails to the LLM Chat Manager to politely decline questions that are outside the scope of the Report Manager application.

## Implementation

### Detection Strategy (Two-Layer Approach)

#### Layer 1: Project Keyword Detection
The system checks if the query contains any project-related keywords:
```javascript
const projectKeywords = [
    'report', 'dashboard', 'data', 'source', 'chart', 'graph',
    'api', 'database', 'user', 'admin', 'llm', 'chat',
    'project', 'application', 'system', 'manager', ...
];
```

#### Layer 2: Generic Pattern Filtering
Even if project keywords are found, the system checks for common out-of-scope patterns:
```javascript
const genericQuestionPatterns = [
    /^who (is|was|are|were)/i,           // "Who is Mahatma Gandhi?"
    /^what (is|was) (the|a) (capital|president)/i,  // "What is the capital of France?"
    /tell me (a|an) (joke|story)/i,      // "Tell me a joke"
    /weather (today|tomorrow)/i,          // "What's the weather?"
    /(explain|define) (quantum|physics)/i // "Explain quantum physics"
];
```

### Decision Logic
```javascript
const isProjectRelated = projectKeywords.some(k => query.includes(k));
const matchesGenericPattern = genericQuestionPatterns.some(p => p.test(query));
const finallyProjectRelated = isProjectRelated && !matchesGenericPattern;

if (!finallyProjectRelated) {
    return politeDeclineMessage();
}
```

## Response Behavior

### Out-of-Scope Query:
**User**: "Who is Mahatma Gandhi?"

**System Response**:
```
I apologize, but I'm specifically designed to assist with questions about 
this Report Manager application, including reports, dashboards, data sources, 
and related features. I cannot answer questions outside this scope. 
Is there anything about the project I can help you with?
```

### In-Scope Query:
**User**: "What reports do I have?"

**System Response**:
```
Based on your current system, you have the following reports:
- Sales Report: Monthly sales data
- User Growth: New user signups
- Sample Pie Chart Report: Sample Pie Chart Report
```

## Test Cases

### ❌ Will Be Declined (Out of Scope):
- "Who is Mahatma Gandhi?"
- "What is the capital of France?"
- "Tell me a joke"
- "What's the weather today?"
- "Explain quantum physics"
- "Who was the first president?"

### ✅ Will Be Processed (In Scope):
- "What reports do I have?"
- "How do I create a dashboard?"
- "Show me the data sources"
- "Can you help me with the project?"
- "What is this application?"
- "How does the system work?"
- "How do I upload Excel data?"
- "What users are in the system?"

## Benefits

1. **Prevents Hallucinations**: LLM won't attempt to answer questions it shouldn't
2. **Sets Clear Boundaries**: Users understand the assistant's scope
3. **Saves Resources**: Doesn't waste tokens on irrelevant queries
4. **Professional UX**: Polite, helpful decline messages

## Configuration

### Adding New Generic Patterns
Edit `backend/server.js` around line 1705:
```javascript
const genericQuestionPatterns = [
    /^who (is|was|are|were)/i,
    // Add your pattern here
    /your custom pattern/i,
];
```

### Adding New Project Keywords
Edit `backend/server.js` around line 1676:
```javascript
const projectKeywords = [
    'report', 'dashboard', 'data',
    // Add your keyword here
    'yourcustomkeyword',
];
```

## Logging
Out-of-scope queries are logged for monitoring:
```bash
tail -f backend/logs/debug.log | grep "Out-of-scope"
```

Output:
```json
{
  "level": "debug",
  "message": "Out-of-scope query detected",
  "query": "Who is Mahatma Gandhi?"
}
```

## Future Enhancements

### Recommended:
1. **LLM-Based Intent Classification**: Use a small model (llama3.2:3b) for more sophisticated intent detection
2. **User Feedback Loop**: Track declined queries to improve keyword/pattern lists
3. **Contextual Decline Messages**: Customize decline message based on query type
4. **Soft Boundaries**: Allow some general queries if they relate to tech concepts (e.g., "What is SQL?")

## Status
✅ **Implemented and Running**
- Backend restarted with new guardrails
- Ready for testing via chat interface
- Logs available for monitoring

## Testing
1. Open chat interface: `http://localhost:3050/chat`
2. Try asking: "Who is Mahatma Gandhi?"
3. Expected response: Polite decline message
4. Try asking: "What reports do I have?"
5. Expected response: List of actual reports from database
