# API Documentation Index

Complete API documentation for all services (except web frontend).

---

## Services Overview

| Service | Port | Description | Documentation |
|---------|------|-------------|---------------|
| **Backend** | 9090 | Main REST API for authentication, projects, and prompts | [Backend API](./apps/backend/API_DOCUMENTATION.md) |
| **K8 Orchestrator** | 3000 | Kubernetes pod management and project assignment | [K8 API](./apps/k8/API_DOCUMENTATION.md) |
| **Worker Orchestrator** | 9092 | Docker container management for local development | [Worker Orchestrator API](./apps/worker-orchestrator/API_DOCUMENTATION.md) |
| **Worker** | 9094 | AI-powered code generation and file operations | [Worker API](./apps/worker/API_DOCUMENTATION.md) |
| **WebSocket** | 9093 | Real-time message relay service | [WebSocket API](./apps/ws/API_DOCUMENTATION.md) |

---

## Quick Start Guide

### 1. Start All Services

```bash
# Terminal 1: Backend
cd apps/backend
bun run dev

# Terminal 2: K8 Orchestrator (if using Kubernetes)
cd apps/k8
bun index.ts

# Terminal 3: Worker Orchestrator (for local Docker management)
cd apps/worker-orchestrator
bun index.ts

# Terminal 4: WebSocket Service
cd apps/ws
bun index.ts

# Terminal 5: Worker (will be managed by orchestrator, but can run standalone)
cd apps/worker
bun index.ts
```

### 2. Test Authentication

1. **Register a user:**
   ```http
   POST http://localhost:9090/api/v1/auth/register
   Content-Type: application/json

   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. **Login to get token:**
   ```http
   POST http://localhost:9090/api/v1/auth/login
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Use token in subsequent requests:**
   ```
   Authorization: Bearer <your_token>
   ```

### 3. Create a Project

```http
POST http://localhost:9090/api/v1/projects/create-project
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "prompt": "create a landing e-commerce page"
}
```

### 4. Assign Project to Pod/Worker

```http
GET http://localhost:3000/projects/<project_id>
```

---

## Postman Collection Setup

### Step 1: Create Environment

Create a Postman environment with these variables:

```
baseUrl: http://localhost:9090
k8Url: http://localhost:3000
workerOrchestratorUrl: http://localhost:9092
workerUrl: http://localhost:9094
wsUrl: ws://localhost:9093
token: (set after login)
projectId: (set after creating project)
```

### Step 2: Import Collection Structure

Create a Postman collection with these folders:
- **Auth** (Register, Login, OAuth)
- **Projects** (Create, Get All, Get by ID, Update, Delete)
- **Prompts** (Get by Project ID)
- **K8 Orchestrator** (Assign Project, Metrics)
- **Worker Orchestrator** (Assign Worker, Health, List Machines)
- **Worker** (Process Prompt)
- **WebSocket** (Subscribe, Send Messages)

### Step 3: Add Pre-request Scripts

For authenticated endpoints, add this pre-request script:

```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('token')
});
```

---

## API Flow Example

### Complete Project Creation and Processing Flow

1. **Register/Login** → Get token
   ```
   POST /api/v1/auth/login
   ```

2. **Create Project** → Get projectId
   ```
   POST /api/v1/projects/create-project
   ```

3. **Assign to Pod/Worker** → Get URLs
   ```
   GET /projects/{projectId}
   ```

4. **Process Prompt** → Generate code
   ```
   POST /prompt
   ```

5. **Get Prompts History**
   ```
   GET /api/v1/prompts/prompts/{projectId}
   ```

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### K8 Orchestrator
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
PORT=3000
```

### Worker Orchestrator
```
PORT=9092
```

### Worker
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
GEMINI_API_KEY=your_gemini_api_key
WS_RELAYER_URL=ws://localhost:9093
PORT=9094
```

### WebSocket
```
PORT=9093
```

---

## Testing Checklist

- [ ] Backend server running on port 9090
- [ ] Database connection working
- [ ] Can register new user
- [ ] Can login and get token
- [ ] Can create project with token
- [ ] Can get all projects
- [ ] Can get project by ID
- [ ] Can update project
- [ ] Can delete project
- [ ] Can get prompts by project ID
- [ ] K8 orchestrator running (if using Kubernetes)
- [ ] Worker orchestrator running (if using Docker)
- [ ] WebSocket service running
- [ ] Worker service accessible

---

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if token is valid and not expired
   - Ensure Authorization header format: `Bearer <token>`

2. **404 Not Found**
   - Verify the service is running
   - Check the correct port
   - Ensure the endpoint path is correct

3. **500 Internal Server Error**
   - Check service logs
   - Verify database connection
   - Check environment variables

4. **Connection Refused**
   - Ensure the service is running
   - Check if port is available
   - Verify firewall settings

---

## Additional Resources

- [Backend API Documentation](./apps/backend/API_DOCUMENTATION.md)
- [K8 Orchestrator API Documentation](./apps/k8/API_DOCUMENTATION.md)
- [Worker Orchestrator API Documentation](./apps/worker-orchestrator/API_DOCUMENTATION.md)
- [Worker API Documentation](./apps/worker/API_DOCUMENTATION.md)
- [WebSocket API Documentation](./apps/ws/API_DOCUMENTATION.md)


