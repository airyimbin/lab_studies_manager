import express from "express";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydb";

let db;

(async () => {
  const client = new MongoClient(MONGO_URI, { maxPoolSize: 10 });
  await client.connect();
  db = client.db();
  console.log("[backend] Mongo connected");
})().catch(err => {
  console.error("[backend] Mongo connect error:", err);
  process.exit(1);
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/hello", (req, res) => {
  res.json({ hello: "world" });
});

app.get("/api/items", async (req, res) => {
  try {
    const items = await db.collection("items").find({}).limit(50).toArray();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db error" });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!name) return res.status(400).json({ error: "name required" });
    const result = await db.collection("items").insertOne({ name, createdAt: new Date() });
    res.json({ insertedId: result.insertedId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db error err" });
  }
});

app.listen(PORT, () => {
  console.log(`[backend] API listening on ${PORT}`);
});
