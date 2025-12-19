# Backend API Documentation

**Base URL:** `http://localhost:9090`

**Content-Type:** `application/json`

---

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User

**POST** `/api/v1/auth/register`

**No Authentication Required**

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "cmxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Email and password are required
- `409` - User already exists with this email
- `500` - Failed to register user

---

### 1.2 Login User

**POST** `/api/v1/auth/login`

**No Authentication Required**

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "cmxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Email and password are required
- `404` - User not found
- `401` - Invalid password
- `500` - Failed to login user

---

### 1.3 Google OAuth

**GET** `/api/v1/auth/google`

**No Authentication Required**

Redirects to Google OAuth consent screen. After authentication, redirects to callback URL.

**Callback URL:** `/api/v1/auth/google/callback`

---

### 1.4 GitHub OAuth

**GET** `/api/v1/auth/github`

**No Authentication Required**

Redirects to GitHub OAuth consent screen. After authentication, redirects to callback URL.

**Callback URL:** `/api/v1/auth/github/callback`

---

### 1.5 OAuth Failure

**GET** `/api/v1/auth/failure`

Returns: `OAuth login failed`

---

## 2. Project Endpoints

**All project endpoints require authentication.**

### 2.1 Create Project

**POST** `/api/v1/projects/create-project`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "create a landing e-commerce page"
}
```

**Response (201 Created):**
```json
{
  "projectId": "cmj7fop3s0002tt2w50m0rvex"
}
```

**Error Responses:**
- `400` - Prompt is required
- `401` - Unauthorized (missing or invalid token)
- `500` - Failed to create project

---

### 2.2 Get All Projects

**GET** `/api/v1/projects/get-projects`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "cmj7fop3s0002tt2w50m0rvex",
    "title": "create a landing e-commerce page",
    "user_id": "cmxxx...",
    "type": "NEXTJS",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Failed to get projects

---

### 2.3 Get Project by ID

**GET** `/api/v1/projects/get-project/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Project ID

**Example:** `/api/v1/projects/get-project/cmj7fop3s0002tt2w50m0rvex`

**Response (200 OK):**
```json
{
  "id": "cmj7fop3s0002tt2w50m0rvex",
  "title": "create a landing e-commerce page",
  "user_id": "cmxxx...",
  "type": "NEXTJS",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Project not found
- `500` - Failed to get project

---

### 2.4 Update Project

**PUT** `/api/v1/projects/update-project/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` - Project ID

**Request Body:**
```json
{
  "title": "Updated Project Title"
}
```

**Response (200 OK):**
```json
{
  "id": "cmj7fop3s0002tt2w50m0rvex",
  "title": "Updated Project Title",
  "user_id": "cmxxx...",
  "type": "NEXTJS",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Project not found
- `500` - Failed to update project

---

### 2.5 Delete Project

**DELETE** `/api/v1/projects/delete-project/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Project ID

**Response (200 OK):**
```json
{
  "id": "cmj7fop3s0002tt2w50m0rvex",
  "title": "create a landing e-commerce page",
  "user_id": "cmxxx...",
  "type": "NEXTJS",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Project not found
- `500` - Failed to delete project

---

## 3. Prompt Endpoints

**All prompt endpoints require authentication.**

### 3.1 Get Prompts by Project ID

**GET** `/api/v1/prompts/prompts/:projectId`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `projectId` - Project ID

**Example:** `/api/v1/prompts/prompts/cmj7fop3s0002tt2w50m0rvex`

**Response (200 OK):**
```json
[
  {
    "id": "cmxxx...",
    "project_id": "cmj7fop3s0002tt2w50m0rvex",
    "content": "create a landing e-commerce page",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Failed to get prompts

---

## Postman Collection Setup

### Environment Variables

Create a Postman environment with these variables:

- `baseUrl`: `http://localhost:9090`
- `token`: (will be set after login)

### Quick Start

1. **Register/Login** to get a token:
   ```
   POST {{baseUrl}}/api/v1/auth/login
   ```

2. **Set the token** in environment variable after login

3. **Use token** in all authenticated requests:
   ```
   Authorization: Bearer {{token}}
   ```

### Example Postman Requests

#### Register
```http
POST http://localhost:9090/api/v1/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

#### Login
```http
POST http://localhost:9090/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Create Project
```http
POST http://localhost:9090/api/v1/projects/create-project
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "prompt": "create a landing e-commerce page"
}
```

#### Get All Projects
```http
GET http://localhost:9090/api/v1/projects/get-projects
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Notes

- JWT tokens expire after 1 hour (for login/register) or 7 days (for OAuth)
- All timestamps are in ISO 8601 format
- Project types: `NEXTJS`, `REACT`, `REACT_NATIVE`
- Make sure the backend server is running on port 9090 before testing


