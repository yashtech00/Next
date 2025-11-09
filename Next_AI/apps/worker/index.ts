import express from "express";
import { prisma } from "db/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onShellCommand } from "./os";


const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
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
      { role: "system", content: SystemPrompt },
      ...allPrompts.map((p, i) => ({
        role: i % 2 === 0 ? "user" : "model",
        content: p.content,
      })),
      { role: "user", content: prompt },
    ];

    // --- Your artifact logic preserved ---
  
  let artifactProcess = new ArtifactProcessor("", (filePath, fileContent) => onFileUpdate(filePath, fileContent, projectId, promptDb.id, project.type), (shellCommand) => onShellCommand(shellCommand, projectId, promptDb.id));
  let artifact = "";

    const Client = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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

    // Final save to S3
    if (artifact && artifact.length > 0) {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `projects/${projectId}/${filePath}`,
          Body: artifact,
          ContentType: "text/plain",
        })
      );
    }

    // Save confirmation message
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





    // // Stream setup
    // res.setHeader("Content-Type", "text/event-stream");
    // res.setHeader("Cache-Control", "no-cache, no-transform");
    // res.setHeader("Connection", "keep-alive");
    // res.flushHeaders?.();

    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    // const contents = messages.map((m) => ({
    //   role: m.role,
    //   parts: [{ text: m.content }],
    // }));

    // const result = await model.generateContentStream({ contents });

    // let codeBuffer = "";

    // // Stream token-by-token
    // for await (const chunk of result.stream) {
    //   const token = chunk.text();
    //   if (token) {
    //     // 1️⃣ Send token to frontend
    //     res.write(`data: ${token}\n\n`);

    //     // 2️⃣ Append to local buffer
    //     codeBuffer += token;

    //     // 3️⃣ Periodically auto-save to S3
    //     if (codeBuffer.length > 2000) {
    //       await s3.send(
    //         new PutObjectCommand({
    //           Bucket: BUCKET_NAME,
    //           Key: `projects/${projectId}/${filePath}`,
    //           Body: codeBuffer,
    //           ContentType: "text/plain",
    //         })
    //       );
    //       codeBuffer = ""; // reset buffer
    //     }
    //   }
    // }