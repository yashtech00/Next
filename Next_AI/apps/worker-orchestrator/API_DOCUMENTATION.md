# Worker Orchestrator API Documentation

**Base URL:** `http://localhost:9092`

**Description:** Docker-based worker orchestrator that manages worker containers for local development. Creates and manages Docker containers instead of EC2 instances.

---

## Prerequisites

- Docker Desktop must be running
- Docker daemon must be accessible (TCP on localhost:2375 or named pipe)

---

## 1. Worker Management Endpoints

### 1.1 Assign Worker to Project

**GET** `/:projectId`

**Description:** Assigns an idle worker container to a project. Creates a new container if no idle workers are available.

**URL Parameters:**
- `projectId` - The ID of the project (used for identification, but not validated)

**Example:** `/cmj7fop3s0002tt2w50m0rvex`

**Response (200 OK):**
```json
{
  "ip": "localhost",
  "port": 9093,
  "url": "http://localhost:9093",
  "containerId": "worker-1234567890-abc123"
}
```

**Error Responses:**
- `503` - Failed to create worker or no machines available (retry in a few seconds)
- `500` - Internal server error

**Notes:**
- If no idle workers exist, a new container is automatically created
- Containers are created on ports starting from 9093
- Each container runs the worker image: `yashtech00/worker:v1`

---

### 1.2 Release Worker

**DELETE** `/:projectId`

**Description:** Releases a worker container, marking it as available for reuse.

**URL Parameters:**
- `projectId` - The container/machine ID to release

**Response (200 OK):**
```json
{
  "message": "Machine cmj7fop3s0002tt2w50m0rvex released"
}
```

**Error Responses:**
- `404` - Machine not found
- `500` - Internal server error

---

### 1.3 Destroy Container

**POST** `/destroy`

**Description:** Permanently destroys a worker container.

**Request Body:**
```json
{
  "containerId": "worker-1234567890-abc123"
}
```

**Response (200 OK):**
```json
{
  "message": "Container worker-1234567890-abc123 destroyed successfully"
}
```

**Error Responses:**
- `400` - containerId is required
- `500` - Failed to destroy container

---

## 2. Health & Monitoring Endpoints

### 2.1 Health Check

**GET** `/health`

**Description:** Checks the health of the orchestrator and Docker connection.

**Response (200 OK):**
```json
{
  "status": "ok",
  "docker": "connected",
  "machines": {
    "total": 2,
    "idle": 1,
    "used": 1
  }
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "error",
  "docker": "disconnected",
  "error": "Docker connection failed"
}
```

---

### 2.2 List All Machines

**GET** `/machines/list`

**Description:** Returns a list of all worker containers and their status.

**Response (200 OK):**
```json
{
  "machines": [
    {
      "id": "worker-1234567890-abc123",
      "containerId": "abc123def456",
      "ip": "172.17.0.2",
      "port": 9093,
      "isUsed": false,
      "assignedProject": null,
      "url": "http://localhost:9093"
    },
    {
      "id": "worker-1234567891-xyz789",
      "containerId": "xyz789ghi012",
      "ip": "172.17.0.3",
      "port": 9094,
      "isUsed": true,
      "assignedProject": "cmj7fop3s0002tt2w50m0rvex",
      "url": "http://localhost:9094"
    }
  ]
}
```

---

## Postman Collection Setup

### Environment Variables

Create a Postman environment with:
- `baseUrl`: `http://localhost:9092`
- `projectId`: (your test project ID)
- `containerId`: (set after creating a worker)

### Example Requests

#### Assign Worker to Project
```http
GET http://localhost:9092/cmj7fop3s0002tt2w50m0rvex
```

#### Health Check
```http
GET http://localhost:9092/health
```

#### List All Machines
```http
GET http://localhost:9092/machines/list
```

#### Release Worker
```http
DELETE http://localhost:9092/cmj7fop3s0002tt2w50m0rvex
```

#### Destroy Container
```http
POST http://localhost:9092/destroy
Content-Type: application/json

{
  "containerId": "worker-1234567890-abc123"
}
```

---

## Container Management

### Automatic Management

- **Idle Machine Pool**: Maintains at least 2 idle machines by default
- **Auto-scaling**: Creates new containers when no idle machines are available
- **Health Checks**: Refreshes container list every 10 seconds
- **Cleanup**: Removes containers that no longer exist from the internal list

### Container Configuration

- **Image**: `yashtech00/worker:v1`
- **Port Range**: Starts from 9093 and increments for each new container
- **Environment Variables**: 
  - `DATABASE_URL`: `postgresql://postgres:postgres@host.docker.internal:5432/postgres`

---

## Notes

- **Docker Required**: This service requires Docker Desktop to be running
- **Port Conflicts**: Make sure ports 9093+ are available
- **Container Lifecycle**: Containers persist until explicitly destroyed or Docker restarts
- **Local Development**: This is designed for local development, not production
- **Worker Image**: Make sure the worker Docker image is available locally or pull it first:
  ```bash
  docker pull yashtech00/worker:v1
  ```


