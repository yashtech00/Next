# WebSocket Service API Documentation

**Base URL:** `ws://localhost:9093`

**Description:** WebSocket relay service that manages connections between clients (VS Code, Admin) and relays messages in real-time.

---

## WebSocket Connection

### Connection

**WebSocket URL:** `ws://localhost:9093`

No authentication required for local development.

---

## Message Events

All messages use JSON format with `event` and `data` fields:

```json
{
  "event": "event_name",
  "data": { /* event data */ }
}
```

---

## 1. Client Events (Send to Server)

### 1.1 Subscribe

**Event:** `subscribe`

**Description:** Subscribe to receive broadcast messages (typically from admin/vscode events).

**Message:**
```json
{
  "event": "subscribe",
  "data": null
}
```

**Response:** You will start receiving messages with `event: "admin"`

---

### 1.2 API Subscribe

**Event:** `api_subscribe`

**Description:** Subscribe to receive VS Code specific messages.

**Message:**
```json
{
  "event": "api_subscribe",
  "data": null
}
```

**Response:** You will start receiving messages with `event: "vscode"`

---

## 2. Server Events (Received from Server)

### 2.1 Admin Message

**Event:** `admin`

**Description:** Broadcast message sent to all subscribed clients. Typically used for notifications or status updates.

**Message:**
```json
{
  "event": "admin",
  "data": {
    "type": "prompt-start",
    "message": "Processing prompt..."
  }
}
```

---

### 2.2 VS Code Message

**Event:** `vscode`

**Description:** Message relayed to VS Code subscribers. Contains file updates, terminal output, or other VS Code-specific data.

**Message:**
```json
{
  "event": "vscode",
  "data": {
    "type": "file-update",
    "path": "/app/src/index.ts",
    "content": "// updated content"
  }
}
```

---

## Usage Examples

### JavaScript/TypeScript Client

```javascript
const ws = new WebSocket('ws://localhost:9093');

ws.onopen = () => {
  console.log('Connected to WebSocket');
  
  // Subscribe to admin messages
  ws.send(JSON.stringify({
    event: 'subscribe',
    data: null
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch(message.event) {
    case 'admin':
      console.log('Admin message:', message.data);
      break;
    case 'vscode':
      console.log('VS Code message:', message.data);
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed');
};
```

### Postman WebSocket

1. Create a new WebSocket request in Postman
2. Enter URL: `ws://localhost:9093`
3. Connect
4. Send message:
   ```json
   {
     "event": "subscribe",
     "data": null
   }
   ```
5. You will receive messages in real-time

---

## Message Buffering

If a client subscribes and there are pending buffered messages, they will be sent immediately after subscription.

---

## Connection Lifecycle

1. **Open**: Connection established
2. **Subscribe**: Client sends subscribe message
3. **Receive**: Client receives messages based on subscription type
4. **Close**: Connection closed (client or server)

---

## Integration

This WebSocket service is used by:
- **Worker Service**: Sends admin and vscode messages
- **VS Code**: Subscribes to vscode events for real-time updates
- **Admin Panel**: Subscribes to admin events for status updates

---

## Notes

- **Port**: Default port is 9093
- **No Authentication**: Currently no authentication required (TODO: Add auth)
- **Message Format**: All messages must be valid JSON
- **Buffering**: Messages are buffered if no subscribers are available
- **Connection**: Multiple clients can connect simultaneously


