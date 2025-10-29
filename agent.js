import { config } from "dotenv";
config();


import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


import { Ollama } from 'ollama';


import fs from "node:fs/promises";
import path from "node:path";



const url = "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
const localPath = path.resolve("Chinook.db");

const ollama = new Ollama()


const model = new ChatGoogleGenerativeAI({
  temperature: 0.7,
   model: "gemini-1.5-pro",
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});



// const embeddings =  ollama.Embeddings({
//   model: "all-minilm",
// });



async function generateEmbeddings() {
  const modelName = "all-minilm";
  const promptText = "This is a sample text for generating an embedding.";

  try {
    const response = await ollama.embeddings({
      model: modelName,
      prompt: promptText,
    });

    console.log("Embeddings:", response.embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error);
  }
}

generateEmbeddings();




import { Buffer } from "node:buffer";

async function resolveDbPath(localPath, url) {
  try {
   
    await fs.access(localPath);
    console.log("Local DB found:", localPath);
    return localPath;
  } catch {
   
    console.log("Local DB not found");
  }

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to download DB. Status code: ${resp.status}`);
  }

  const buf = Buffer.from(await resp.arrayBuffer());
  await fs.writeFile(localPath, buf);
  console.log("Database downloaded and saved:", localPath);

  return localPath;
}



resolveDbPath(localPath, url)

