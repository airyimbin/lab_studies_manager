import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = new MongoClient(process.env.MONGODB_URI||"mongodb://localhost:27017/mydb");
let db;

export async function connectDB() {
  const client = new MongoClient(MONGO_URI, { maxPoolSize: 10 });
  await client.connect();
  db = client.db();
  console.log("[backend] Mongo connected");
}
connectDB().catch(err => {
  console.error("[backend] Mongo connect error:", err);
  process.exit(1);
});
export function getDB() {
  return db;
}
