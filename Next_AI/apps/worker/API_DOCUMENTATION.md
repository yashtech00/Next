# Worker API Documentation

**Base URL:** `http://localhost:9094` (or assigned port from worker orchestrator)

**Description:** Worker service that processes prompts using Google Gemini AI and manages file operations, shell commands, and project execution.

---

## 1. Prompt Processing

### 1.1 Process Prompt

**POST** `/prompt`

**Description:** Processes a prompt using Google Gemini AI, executes actions (file operations, shell commands), and updates the project.

**Request Body:**
```json
{
  "prompt": "create a login page with email and password fields",
  "projectId": "cmj7fop3s0002tt2w50m0rvex"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Responses:**
- `404` - Project not found
- `500` - Internal server error

**Notes:**
- Creates a prompt record in the database
- Creates a conversation history entry
- Sends WebSocket messages for real-time updates
- Processes artifacts (file operations, shell commands)
- Uses Google Gemini AI for code generation

---

## Postman Collection Setup

### Environment Variables

Create a Postman environment with:
- `workerUrl`: `http://localhost:9094` (or assigned port from orchestrator)
- `projectId`: (your test project ID)

### Example Request

#### Process Prompt
```http
POST http://localhost:9094/prompt
Content-Type: application/json

{
  "prompt": "create a login page with email and password fields",
  "projectId": "cmj7fop3s0002tt2w50m0rvex"
}
```

---

## Notes

- **Port**: Default port is 9094, but when managed by worker-orchestrator, ports start from 9093
- **WebSocket**: Uses WebSocket for real-time communication with VS Code
- **AI Model**: Uses Google Gemini AI for code generation
- **Database**: Requires database connection for storing prompts and conversation history
- **Project Types**: Supports NEXTJS and REACT projects
- **File Operations**: Can create, update, delete files
- **Shell Commands**: Can execute shell commands (limited set available in WebContainer)

---

## Integration with Other Services

This worker service is typically:
1. Created by the **Worker Orchestrator** (port 9092)
2. Assigned to projects via the **K8 Orchestrator** (port 3000)
3. Communicates with **WS Relayer** (port 9093) via WebSocket
4. Updates project files and executes commands in the project workspace


