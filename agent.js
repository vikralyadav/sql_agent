
import fs from "node:fs/promises";
import path from "node:path";
import { SqlDatabase } from "@langchain/classic/sql_db";
import { DataSource } from "typeorm";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";




const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: "your-api-key"
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