import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(env.MONGODB_URI);

  await client.connect();

  const dbName =
    env.NODE_ENV === "test"
      ? env.TEST_DB_NAME
      : env.DB_NAME;

  if (!dbName) {
    throw new Error("Database name is not defined");
  }

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
