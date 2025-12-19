# K8 Orchestrator API Documentation

**Base URL:** `http://localhost:3000`

**Description:** Kubernetes orchestrator service that manages pods and assigns projects to containers.

---

## 1. Project Endpoints

### 1.1 Assign Project to Pod

**GET** `/projects/:projectId`

**Description:** Assigns a project to a Kubernetes pod. Creates the pod if it doesn't exist, then returns session, preview, and worker URLs.

**URL Parameters:**
- `projectId` - The ID of the project to assign

**Example:** `/projects/cmj7fop3s0002tt2w50m0rvex`

**Response (200 OK):**
```json
{
  "sessionUrl": "https://session-cmj7fop3s0002tt2w50m0rvex.cloud.antidevs.com",
  "previewUrl": "https://preview-cmj7fop3s0002tt2w50m0rvex.cloud.antidevs.com",
  "workerUrl": "https://worker-cmj7fop3s0002tt2w50m0rvex.cloud.antidevs.com"
}
```

**Error Responses:**
- `404` - Project not found in database

**Notes:**
- This endpoint checks if the project exists in the database before creating a pod
- Pod creation may take some time (10-30 seconds)
- The project type (NEXTJS/REACT) is automatically determined from the database

---

### 1.2 Assign Project to Pod (Alternative Route)

**GET** `/worker/:projectId`

**Description:** Same as `/projects/:projectId`, alternative route for backward compatibility.

**URL Parameters:**
- `projectId` - The ID of the project to assign

**Response:** Same as `/projects/:projectId`

---

## 2. Metrics Endpoint

### 2.1 Get Prometheus Metrics

**GET** `/metrics`

**Description:** Returns Prometheus-compatible metrics for monitoring container creation times.

**Response (200 OK):**
```
# HELP container_Create_Bucket Number of times a container was created
# TYPE container_Create_Bucket histogram
container_Create_Bucket_bucket{type="NEXTJS",le="50"} 0
container_Create_Bucket_bucket{type="NEXTJS",le="100"} 0
...
```

---

## Postman Collection Setup

### Environment Variables

Create a Postman environment with:
- `baseUrl`: `http://localhost:3000`
- `projectId`: (your test project ID)

### Example Requests

#### Assign Project to Pod
```http
GET http://localhost:3000/projects/cmj7fop3s0002tt2w50m0rvex
```

#### Get Metrics
```http
GET http://localhost:3000/metrics
```

---

## Notes

- Requires Kubernetes cluster access
- Requires database connection to check project existence
- Project must exist in database before assigning to pod
- Pods are created in the `user-apps` namespace
- Domain is configured in `apps/k8/config.ts` (default: `cloud.antidevs.com`)


