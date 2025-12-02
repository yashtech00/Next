import { KubeConfig } from "@kubernetes/client-node";
import promClient from "prom-client";
import * as k8s from "@kubernetes/client-node";
import express from "express";

const containerCreateBucket = new promClient.Histogram({
  name: "container_Create_Bucket",
  help: "Number od times a conatainer was created",
  labelNames: ["type"],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000],
});

const app = express();

const kc = new KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreApi);
const currentContext = kc.getCurrentContext();
const cluster = kc.getCluster(currentContext);

const PROJECT_TYPE_TO_BASE_FOLDER = {
  NEXTJS: "/Next/next-app",
  REACT: "/Next/react-app",
};

async function listPods(): Promise<string[]> {
  const res = await k8sApi.listNamespacePod({ namespace: "user-app" });
  
  return res.items
    .filter(
      (pod) =>
        pod.status?.phase === "Running" || pod.status?.phase === "Pending"
    )
    .filter((pod) => pod.metadata?.name)
    .map((pod) => pod.metadata?.name as string);
}

async function createPod(name: string) {
  await k8sApi.createNamespacePod({
    namespace: "user-apps",
    body: {
      metadata: {
        name: name,
        label: {
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
            ports: [{ containerPort: 9091 }],
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
}
