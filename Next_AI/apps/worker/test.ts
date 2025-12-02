import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function listModels() {
  const models = await genAI.listModels();

  models.models.forEach((model: any) => {
    console.log(`\nModel: ${model.name}`);
    console.log(`Description: ${model.description}`);
    console.log(`Methods: ${model.supportedGenerationMethods.join(", ")}`);
  });
}

listModels();
