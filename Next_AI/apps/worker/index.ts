import express from "express";
import { prisma } from "db/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onPromptEnd, onShellCommand } from "./os";
import { RelayWebsocket } from "./ws";


const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const s3 = new S3Client({ region: process.env.AWS_REGION });
// const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
const SystemPrompt = "You are a helpful AI coding assistant.";

app.post("/prompt", async (req, res) => {
  try {
    const { prompt, projectId } = req.body;
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    })
    if (!projectId) {
      return res.status(404).json({ error: "project not found" })
    }

    const promptDb = await prisma.prompt.create({
      data: {
        content: prompt,
        project_id: projectId
      }
    })
    await prisma.conversationHistory.create({
      data: {
        project_id: projectId,
        type: "TEXT_MESSAGE",
        from: "USER",
        contents: prompt,
        hidden: false,
      },
    })
    const { diff } = await RelayWebsocket.getInstance().sendAndAwaitResponse(
      {
        event: "admin",
        data: { type: "prompt-start" }
      },
      promptDb.id
    );
    if (diff) {
      await prisma.prompt.create({
        data: {
          content: `<bolt-user-diff>${diff}</bolt-user-diff>\n\n`,
          project_id: projectId,
        },
      });

      await prisma.conversationHistory.create({
        data: {
          project_id: projectId,
          type: "TEXT_MESSAGE",
          from: "USER",
          contents: `<bolt-user-diff>${diff}</bolt-user-diff>`,
          hidden: false,
        }
      })
    }
    const allprompts = await prisma.prompt.findMany({
      where: { project_id: projectId },
      orderBy: { createdAt: "asc" }
    })
    const artifactProcessor = new ArtifactProcessor(
      "",
      (filePath, fileContent) =>
        onFileUpdate(filePath, fileContent, projectId, promptDb.id, project.type),
      (shellCommand) =>
        onShellCommand(shellCommand, projectId, promptDb.id)
    );
    let artifact = "";
    const model = genAI.getGenerativeModel({
      model:"gemini-2.0-pro"
    })
    const messages = [
      {
        role: "user",
        parts: [{ text: SystemPrompt }],
      },
      ...allprompts.map((p: any) => ({
        role: "user",
        parts: [{ text: p.content }],
      })),
      {
        role: "user",
        parts: [{ text: prompt }],
      }
    ];
    const stream = await model.generateContentStream({
      contents: messages,
    });

    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text) continue;

      artifactProcessor.append(text);
      artifactProcessor.parse();
      artifact += text;
    }
    console.log("done!");

    await prisma.prompt.create({
      data: {
        content: artifact,
        project_id: projectId,
      }
    });

    await prisma.conversationHistory.create({
      data: {
        project_id: projectId,
        type: "TEXT_MESSAGE",
        from: "ASSISTANT",
        contents: artifact,
        hidden: false,
      }
    })
    
    await prisma.action.create({
      data: {
        content: 'Done!',
        projectId,
        promptId: promptDb.id
      }
    });
    onPromptEnd(promptDb.id)
    res.json({ success: true });

  } catch (e) {
    console.error("gemini error", e);
    res.json({ success: false });
  }
})

app.listen(9092,()=>{
  console.log("worker is listen on port 9092");
  
})