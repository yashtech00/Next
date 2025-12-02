import express from "express";
import { prisma } from "db/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onShellCommand } from "./os";


const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const s3 = new S3Client({ region: process.env.AWS_REGION });
// const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
const SystemPrompt = "You are a helpful AI coding assistant.";

// STREAM + SAVE to S3
app.post("/prompt", async (req, res) => {
  try {
    const { prompt, projectId, filePath = "index.js" } = req.body;

    if (!prompt || !projectId) {
      return res.status(400).json({ error: "Missing prompt or projectId" });
    }

    // Collect chat history
    const allPrompts = await prisma.prompt.findMany({
      where: { project_id: projectId },
      orderBy: { createdAt: "asc" },
    });

    // Save user prompt in DB
    await prisma.prompt.create({
      data: {
        project_id: projectId,
        content: prompt,
      },
    });

    // Save conversation (USER message)
    await prisma.conversationHistory.create({
      data: {
        project_id: projectId,
        type: "TEXT_MESSAGE",
        from: "USER",
        contents: prompt,
        hidden: false,
      },
    });

    // Prepare messages for Gemini
   const messages = [
  {
    role: "user",
    content: `SYSTEM: ${SystemPrompt}`
  },
  ...allPrompts.map((p: any, i: any) => ({
    role: i % 2 === 0 ? "user" : "model",
    content: p.content,
  })),
  { role: "user", content: prompt },
];


    // --- Your artifact logic preserved ---
  
    let artifactProcess = new ArtifactProcessor("", (filePath, fileContent) =>
      onFileUpdate(filePath, fileContent, projectId, prompt.id, projectId.type), (shellCommand) =>
      onShellCommand(shellCommand, projectId, prompt.id));
    let artifact = "";

    const Client = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await Client.generateContent("Say hello");
    console.log(result.response.text());


    const stream = await Client.generateContentStream({
      contents: messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    });

    // SSE streaming setup
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text) {
        artifactProcess.append(text);
        artifactProcess.parse();
        artifact += text;
        res.write(`data: ${text}\n\n`);
      }
    }

    console.log("done!");

    // Save Gemini response
    await prisma.prompt.create({
      data: {
        project_id: projectId,
        content: artifact,
      },
    });

    // Save conversation (ASSISTANT message)
    await prisma.conversationHistory.create({
      data: {
        project_id: projectId,
        type: "TEXT_MESSAGE",
        from: "ASSISTANT",
        contents: artifact,
        hidden: false,
      },
    });

    await prisma.prompt.create({
      data: {
        project_id: projectId,
        content: "[Code generated and saved to S3]",
      },
    });

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Error in /prompt route:", error);
    res.status(500).json({ error: "Failed to process prompt" });
  }
});

app.listen(4000, () => {
  console.log("Worker server running on port 4000");
});




