import { config } from "dotenv";
config();


import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


import { Ollama } from 'ollama';


import fs from "node:fs/promises";
import path from "node:path";



import { SqlDatabase } from "@langchain/classic/sql_db";
import { DataSource } from "typeorm";



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



// resolveDbPath(localPath, url)





let db; 

async function resolveDbFile() {
  const dbPath = path.resolve("Chinook.db"); 
  return dbPath;
}

export async function getDb() {
  if (!db) {
    const dbPath = await resolveDbPath(localPath, url);
    const datasource = new DataSource({
      type: "sqlite",
      database: dbPath,
    });

    db = await SqlDatabase.fromDataSourceParams({ appDataSource: datasource });
  }

  return db;
}



// resolveDbFile()

async function getSchema() {
  const db = await getDb();
  return await db.getTableInfo();
}

// getSchema()



import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { humanInTheLoopMiddleware  } from "langchain";
import { MemorySaver } from "@langchain/langgraph";


  const agent = await createReactAgent({
    model,
    tools,
    systemPrompt,
    middleware: [
      new humanInTheLoopMiddleware ({
        interruptOn: { sql_db_query: true },
        descriptionPrefix: "Tool execution pending approval",
      }),
    ],
    checkpointer: new InMemorySaver(),
  });




(async () => {
  const question = "Which genre on average has the longest tracks?";
  const config = { configurable: { thread_id: "1" } };

  for await (const step of agent.stream(
    { messages: [{ role: "user", content: question }] },
    config,
    { streamMode: "values" }
  )) {
    if (step.messages) {
      const lastMessage = step.messages.at(-1);
      console.log(`${lastMessage.role.toUpperCase()}: ${lastMessage.content}`);
    } else if (step.__interrupt__) {
      console.log("INTERRUPTED:");
      const interrupt = step.__interrupt__[0];
      for (const request of interrupt.value.action_requests) {
        console.log(request.description);
      }
    }
  }
})();

