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

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

router.post("/", async (req, res) => {
  const { title, slug, description, status } = req.body || {};

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Missing title" });
  }

  const now = new Date();
  let studySlug = typeof slug === "string" && slug.trim() ? slugify(slug) : slugify(title);
  const cleanDescription = typeof description === "string" ? description.trim() : "";
  const cleanStatus = typeof status === "string" ? status.trim() : "";

  try {
    if (studySlug) {
      const exists = await col().findOne({ slug: studySlug });
      if (exists) {
        studySlug = `${studySlug}-${Date.now()}`;
      }
    }

    const doc = {
      title: title.trim(),
      slug: studySlug || null,
      description: cleanDescription || null,
      status: cleanStatus || "draft",
      createdAt: now,
      updatedAt: now,
    };

    const result = await col().insertOne(doc);
    const created = await col().findOne({ _id: result.insertedId });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create study" });
  }
});

export default router;
