import fs from "node:fs/promises";
import path from "node:path";
import { DataSource } from "typeorm";
import { SqlDatabase } from "@langchain/community/sql_db";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createOpenAIFunctionsAgent, AgentExecutor } from "@langchain/langchain/agents";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});



const url = "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
const localPath = path.resolve("Chinook.db");



async function resolveDbPath() {
  if (await fs.exists(localPath)) {
    return localPath;
  }
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to download DB. Status code: ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  await fs.writeFile(localPath, buf);
  return localPath;
}



const  db = new SqlDatabase ;
async function getDb() {
  if (!db) {
    const dbPath = await resolveDbFile();
    const datasource = new DataSource({ type: "sqlite", database: dbPath });
    db = await SqlDatabase.fromDataSourceParams({ appDataSource: datasource });
  }
  return db;
}

async function getSchema() {
  const db = await getDb();
  return await db.getTableInfo();
}

// async function getDb() {
//   const dbPath = path.resolve("database.sqlite");
//   const datasource = new DataSource({
//     type: "sqlite",
//     database: dbPath,
//   });
//   await datasource.initialize();
//   return await SqlDatabase.fromDataSourceParams({
//     appDataSource: datasource,
//   });
// }




const agent = await createOpenAIFunctionsAgent({
  llm: model,
  tools: [db.asTool()],
  systemPrompt: "You are an SQL assistant that helps answer questions from the database.",
});


const executor = new AgentExecutor({
  agent,
  tools: [db.asTool()],
});


async function executeQueryWithApproval(question) {
  console.log(` Question: ${question}`);
  console.log(" This may run SQL queries. Approve? (y/n)");

  const response = await new Promise((resolve) => {
    process.stdin.once("data", (data) => resolve(data.toString().trim()));
  });

  if (response.toLowerCase() !== "y") {
    console.log(" Query cancelled by user.");
    process.exit(0);
  }

  const result = await executor.invoke({ input: question });
  console.log("Result:", result.output);
}

await executeQueryWithApproval("Which genre on average has the longest tracks?");
