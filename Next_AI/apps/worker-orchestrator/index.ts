import express from "express";
import Docker from "dockerode";

// Docker connection configuration
// On Windows with "Expose daemon on tcp://localhost:2375" enabled, use TCP
// Otherwise use named pipe (//./pipe/docker_engine)
let docker: Docker;

if (process.platform === "win32") {
  // Windows: Try TCP first (default when "Expose daemon" is enabled), fallback to named pipe
  try {
    // Use TCP connection on localhost:2375
    docker = new Docker({ 
      protocol: 'http',
      host: 'localhost',
      port: 2375
    });
    console.log("Connecting to Docker via TCP: localhost:2375");
  } catch (error) {
    // Fallback to named pipe if TCP fails
    console.log("TCP connection failed, trying named pipe...");
    docker = new Docker({ socketPath: "//./pipe/docker_engine" });
    console.log("Connecting to Docker via named pipe: //./pipe/docker_engine");
  }
} else {
  // Linux/Mac: Use Unix socket
  docker = new Docker({ socketPath: "/var/run/docker.sock" });
  console.log("Connecting to Docker via Unix socket: /var/run/docker.sock");
}

const app = express();
app.use(express.json());


type Machine = {
  id: string;
  ip: string;
  port: number;
  isUsed: boolean;
};


const ALL_MACHINES: Machine[] = [];


async function refreshInstance() {
  try {
    const containers = await docker.listContainers({ all: true });

    const workerContainers = containers.filter(c =>
      c.Names?.some((n: string) => n.includes("worker-")) && c.State === "running"
    );

    // Clear and rebuild the machines list
    ALL_MACHINES.splice(0, ALL_MACHINES.length);

    for (const c of workerContainers) {
      const publicPort = c.Ports?.find((p: any) => p.PrivatePort === 9092)?.PublicPort || 
                         c.Ports?.[0]?.PublicPort;
      
      if (publicPort) {
        // Check if machine already exists (preserve isUsed state)
        const existing = ALL_MACHINES.find(m => m.id === c.Id);
        ALL_MACHINES.push({
          id: c.Id,
          ip: "127.0.0.1",
          port: Number(publicPort),
          isUsed: existing?.isUsed || false,
        });
      }
    }
    console.log(`Refreshed: ${ALL_MACHINES.length} worker machines`);
  } catch (error) {
    console.error("Error refreshing instances:", error);
  }
}
async function createWorker(port: number): Promise<void> {
  try {
    const containerName = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const container = await docker.createContainer({
      Image: "yashtech00/worker:v1", // Match the image from docker-compose.yml
      name: containerName,
      ExposedPorts: { "9092/tcp": {} },
      HostConfig: {
        PortBindings: {
          "9092/tcp": [{ HostPort: String(port) }],
        },
      },
      Env: [
        "DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/postgres",
      ],
    });

    await container.start();
    console.log(`Created and started worker container: ${containerName} on port ${port}`);
    
    // Wait a bit for container to be ready, then refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    await refreshInstance();
  } catch (error) {
    console.error(`Error creating worker container:`, error);
    throw error;
  }
}


// Test Docker connection on startup
async function testDockerConnection() {
  try {
    await docker.ping();
    console.log("✓ Docker connection successful");
    await refreshInstance();
  } catch (error) {
    console.error("✗ Docker connection failed. Make sure Docker Desktop is running.");
    console.error("Error:", error);
    process.exit(1);
  }
}

testDockerConnection();

// Refresh instances periodically
setInterval(() => {
  refreshInstance();
}, 10 * 1000); // Refresh every 10 seconds

app.get("/:projectId", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Find an idle machine
    let idle = ALL_MACHINES.find(m => !m.isUsed);

    // If no idle machine, create a new one
    if (!idle) {
      const newPort = 9093 + ALL_MACHINES.length;
      console.log(`No idle machines, creating new worker on port ${newPort}...`);
      await createWorker(newPort);
      
      // Wait a moment and find the new machine
      await new Promise(resolve => setTimeout(resolve, 3000));
      idle = ALL_MACHINES.find(m => !m.isUsed);
      
      if (!idle) {
        return res.status(503).json({ 
          error: "Failed to create worker or no machines available",
          message: "Please retry in a few seconds" 
        });
      }
    }

    idle.isUsed = true;

    res.json({
      ip: idle.ip,
      port: idle.port,
      url: `http://${idle.ip}:${idle.port}`,
    });
  } catch (error: any) {
    console.error("Error in /:projectId:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Release a machine
app.delete("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const machine = ALL_MACHINES.find(m => m.id === projectId);
    
    if (machine) {
      machine.isUsed = false;
      res.json({ message: `Machine ${projectId} released` });
    } else {
      res.status(404).json({ error: "Machine not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", async (req, res) => {
  try {
    await docker.ping();
    res.json({
      status: "ok",
      docker: "connected",
      machines: {
        total: ALL_MACHINES.length,
        idle: ALL_MACHINES.filter(m => !m.isUsed).length,
        used: ALL_MACHINES.filter(m => m.isUsed).length,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      docker: "disconnected",
      error: "Docker connection failed",
    });
  }
});




app.listen(9092, () => {
  console.log("Worker Orchestrator listening on port 9092");
});
