import express from "express";

import {
  AutoScalingClient,
  DescribeAutoScalingInstancesCommand,
  SetDesiredCapacityCommand,
  TerminateInstanceInAutoScalingGroupCommand,
} from "@aws-sdk/client-auto-scaling";
import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";

const app = express();

const client = new AutoScalingClient({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ec2Client = new EC2Client({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type Machine = {
  ip: string;
  isUsed: boolean;
  assignedProject?: string;
};

const All_Machines: Machine[] = [];

async function refreshInstance() {
  const command = new DescribeAutoScalingInstancesCommand();
  const data = await client.send(command);

  const instanceIds = data.AutoScalingInstances?.map(
    (x) => x.InstanceId
  ).filter((id): id is string => Boolean(id));

  const ec2InstanceCommand = new DescribeInstancesCommand({
    InstanceIds: instanceIds,
  });

  const ec2Response = await ec2Client.send(ec2InstanceCommand);
  // TODO: Enrich the ALL_MACHINES array with the new instances, and remove the instances that have died
}

refreshInstance();
setInterval(() => {
  refreshInstance();
}, 10 * 1000); // Refresh every 5 minutes

app.use("/:projectId", async (req, res, next) => {
  const idleMachine = All_Machines.find((x) => x.isUsed === false);
  if (!idleMachine) {
    return res.status(503).json({ error: "No idle machines available" });
  }

  idleMachine.isUsed = true;

  const copmmand = new SetDesiredCapacityCommand({
    AutoScalingGroupName: "vscode-base-image",
    DesiredCapacity:
      All_Machines.length + (5 - All_Machines.filter((x) => x.isUsed).length), // Keep 5 idle machines
    HonorCooldown: false,
  });
  await client.send(copmmand);

  res.send({
    ip: idleMachine.ip,
  });
});

app.use("/destroy", async (req, res, next) => {
  const machineId: string = req.query.machineId as string;

  const command = new TerminateInstanceInAutoScalingGroupCommand({
    InstanceId: machineId,
    ShouldDecrementDesiredCapacity: true,
  });
  await client.send(command);
});

app.listen(9092, () => {
  console.log("Worker Orchestrator listening on port 4000");
});
