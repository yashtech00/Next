import { KubeConfig } from "@kubernetes/client-node";
import promClient from "prom-client";
import * as k8s from "@kubernetes/client-node";
import express from "express";
import { DOMAIN } from "./config";
import { prisma } from "db/client";
import { Writable } from "stream";

const containerCreateBucket = new promClient.Histogram({
  name: "container_Create_Bucket",
  help: "Number of times a container was created",
  labelNames: ["type"],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000],
});

const app = express();
app.use(express.json());

const kc = new KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const currentContext = kc.getCurrentContext();
const cluster = kc.getCluster(currentContext);

const PROJECT_TYPE_TO_BASE_FOLDER = {
  NEXTJS: "/Next/next-app",
  REACT: "/Next/react-app",
};

async function listPods(): Promise<string[]> {
  const res = await k8sApi.listNamespacedPod({ namespace: "user-apps" });
  
  return res.items
    .filter((pod:any) => pod.status?.phase === "Running" || pod.status?.phase === "Pending")
    .filter((pod:any) => pod.metadata?.name)
    .map((pod:any) => pod.metadata?.name as string);
}

async function createPod(name: string) {
  await k8sApi.createNamespacedPod({
    namespace: "user-apps",
    body: {
      metadata: {
        name: name,
        labels: {
          app: name,
        },
      },
      spec: {
        containers: [
          {
            name: "code-server",
            image: "yashtech00/code-server:v3",
            ports: [{ containerPort: 8080 }, { containerPort: 8081 }],
          },
          {
            name: "worker",
            image: "yashtech00/worker:v1",
            ports: [{ containerPort: 9092 }],
            env: [
              {
                name: "WS_RELAYER_URL",
                value: `wss://localhost:9091`,

              },
              {
                name: "GEMINI_API_KEY",
                valueFrom: {
                  secretKeyRef: {
                    name: "worker-secret",
                    key: "GEMINI_API_KEY",
                  },
                },
              },
              {
                name: "DATABASE_URL",
                valueFrom: {
                  secretKeyRef: {
                    name: "worker-secret",
                    key: "DATABASE_URL",
                  },
                },
              },
            ],
          },
              {
                  name: "ws",
                  image:"yashtech00/ws:v1",
                  ports:[{containerPort:9093}]
          },
        ],
      },
    },
  });

  await k8sApi.createNamespacedService({
    namespace: 'user-apps', body:{
    metadata: {
      name: `session-${name}`,
    },
    spec: {
      selector: {
        app: name,
      },
      ports: [{ port: 8080, targetPort: 8080, protocol: 'TCP', name: 'session' }],
    }
    }
  });
  await k8sApi.createNamespacedService({
    namespace: 'user-apps', body: {
      metadata: {
      name:`preview-${name}`,
      },
      spec: {
        selector: {
          app:name,
        },
        ports:[{port:8080,targetPort:8081,protocol:'TCP',name:'preview'}]
      }
    }
  })
  await k8sApi.createNamespacedService({
    namespace: 'user-apps', body: {
      metadata: {
        name: `worker-${name}`,
      },
      spec: {
        selector: {
          app: name,
        },
        ports: [{ port: 8080, targetPort: 9091, protocol: 'TCP', name: 'preview' }],
      },
    }
  });
}

async function checkPodIsReady(name: string) {
  let attempts = 0;
  while (true) {
    const pod = await k8sApi.readNamespacedPod({ namespace: 'user-apps', name });
    if (pod.status?.phase === 'Running') {
      return;
    }
    if (attempts > 10) {
      throw new Error("Pod is not ready");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;
  }
}

async function assignPodToProject(projectId: string, projectType: "NEXTJS" | "REACT") { 
  const pods = await listPods();
  const podExists = pods.find(pod => pod === projectId);
  if (!podExists) { 
    console.log("pod does not exist,creating pod");
    await createPod(projectId);
  }
  console.log("pod exists, checking if it is ready");
  await checkPodIsReady(projectId);
console.log("pod is ready, moving project to pod");

  const exec = new k8s.Exec(kc)
  let stdout = "";
  let stderr = "";
  console.log(`my ${PROJECT_TYPE_TO_BASE_FOLDER[projectType]}/* /app`);

  exec.exec("user-apps", projectId, "code-server", ["/bin/sh", "-c", `my ${PROJECT_TYPE_TO_BASE_FOLDER[projectType]}/* /app`],
    new Writable({
      write: (chunk: Buffer, encoding: BufferEncoding, callback: () => void) => {
        stdout += chunk;
        callback();
      }
    }),
    new Writable({
      write: (chunk: Buffer, encoding: BufferEncoding, callback: () => void) => {
        stderr += chunk;
        callback();
      }
    }),
    null,
    false,
    (status) => {
      console.log(status);
      console.log(stdout);
      console.log(stderr);
    }
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(stdout);
  console.log(stderr);
  console.log(`Assigned project ${projectId} to pod ${projectId}`);
  
}

app.get("/projects/:projectId", async (req, res) => {
  console.log("Received request to assign project to pod for project ", req.params.projectId);
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    }
  });
  if (!project) {
    res.status(404).json({ error: "project not found" });
    return;
  }

  console.log("project found, assigning to pod");
  const startTime = Date.now();
  await assignPodToProject(projectId, project.type as "NEXTJS" | "REACT");
  console.log("pod assigned, sending response");
  containerCreateBucket.observe({ type: project.type }, Date.now() - startTime);
  res.json({ 
    sessionUrl: `https://session-${projectId}.${DOMAIN}`, 
    previewUrl: `https://preview-${projectId}.${DOMAIN}`, 
    workerUrl: `https://worker-${projectId}.${DOMAIN}` 
});
})

app.get("/worker/:projectId", async (req, res) => {
  console.log("Received request to assign project to pod for project ", req.params.projectId);
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    }
  });
  if (!project) {
    res.status(404).json({ error: "project not found" });
    return;
  }

  console.log("project found, assigning to pod");
  const startTime = Date.now();
  await assignPodToProject(projectId, project.type as "NEXTJS" | "REACT");
  console.log("pod assigned, sending response");
  containerCreateBucket.observe({ type: project.type }, Date.now() - startTime);
  res.json({ 
    sessionUrl: `https://session-${projectId}.${DOMAIN}`, 
    previewUrl: `https://preview-${projectId}.${DOMAIN}`, 
    workerUrl: `https://worker-${projectId}.${DOMAIN}` 
  });
})

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log(`Server is running on port ${PORT}`);
})
