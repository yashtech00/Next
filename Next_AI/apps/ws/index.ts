import type { ServerWebSocket } from "bun";
import type { MessagePayload } from "../../packages/common/type.js";

//TODO: Add auth
const SUBSCRIPTIONS: ServerWebSocket<unknown>[] = []

const API_SUBSCRIPTIONS: ServerWebSocket<unknown>[] = []

let bufferedMessages: any[] = []

const PORT = process.env.PORT || process.env.WS_PORT || 9095;

try {
  Bun.serve({
    fetch(req, server) {
      // upgrade the request to a WebSocket
      if (server.upgrade(req)) {
        return; // do not return a Response
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
        message(ws, message) {
            const { event, data }: MessagePayload = JSON.parse(message.toString());
            if (event === "subscribe") {
                SUBSCRIPTIONS.push(ws);
                if (bufferedMessages.length) {
                    SUBSCRIPTIONS.forEach(ws => ws.send(JSON.stringify(bufferedMessages.shift())));
                    bufferedMessages = [];
                }
            } else if (event === "admin") {
                if (!SUBSCRIPTIONS.length) {
                    bufferedMessages.push(data);
                } else {
                    SUBSCRIPTIONS.forEach(ws => ws.send(JSON.stringify(data)));
                }
            } else if (event === "api_subscribe") {
                API_SUBSCRIPTIONS.push(ws);
            } else if (event === "vscode") {
                API_SUBSCRIPTIONS.forEach(ws => ws.send(JSON.stringify(data)));
            }
        },
        open(ws) {
            console.log("WebSocket connection opened");
        },
        close(ws) {
            console.log("WebSocket connection closed");
            // Remove from subscriptions
            const subIndex = SUBSCRIPTIONS.indexOf(ws);
            if (subIndex > -1) {
                SUBSCRIPTIONS.splice(subIndex, 1);
            }
            const apiIndex = API_SUBSCRIPTIONS.indexOf(ws);
            if (apiIndex > -1) {
                API_SUBSCRIPTIONS.splice(apiIndex, 1);
            }
        },
        
    },
    port: Number(PORT)
  });
  console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
} catch (error: any) {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`Please either:`);
    console.error(`1. Stop the process using port ${PORT}`);
    console.error(`2. Use a different port by setting PORT or WS_PORT environment variable`);
    console.error(`   Example: PORT=9094 bun run index.ts`);
    process.exit(1);
  } else {
    console.error("Failed to start WebSocket server:", error);
    throw error;
  }
}