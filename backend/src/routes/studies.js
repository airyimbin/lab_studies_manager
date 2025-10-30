import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

const router = Router();
const col = () => getDB().collection("studies");

router.get("/", async (req, res) => {
  const items = await col().find({}).toArray();
  res.json(items);
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await col().findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;
