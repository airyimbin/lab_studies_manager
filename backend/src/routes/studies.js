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

router.put("/:id", async (req, res) => {
  const { title, tags, description, status } = req.body || {};
  const now = new Date();

  let objectId;
  try {
    objectId = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const cleanStatus =
    typeof status === "string" && ["active", "draft", "archived"].includes(status.trim().toLowerCase())
      ? status.trim().toLowerCase()
      : undefined; // ✅ prevents bad values

  try {
    const updateResult = await col().updateOne(
      { _id: objectId },
      {
        $set: {
          title: title?.trim() || "",
          tags: Array.isArray(tags)
            ? tags.map((t) => t.trim()).filter(Boolean)
            : [],
          description: description?.trim() || "",
          ...(cleanStatus && { status: cleanStatus }), // ✅ update only if provided
          updatedAt: now,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: "Study not found" });
    }

    const updatedDoc = await col().findOne({ _id: objectId });
    res.json(updatedDoc);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Failed to update study" });
  }
});

router.delete("/:id", async (req, res) => {
  let objectId;
  try {
    objectId = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const result = await col().deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Study not found" });
    }
    res.status(204).end();
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: "Failed to delete study" });
  }
});


export default router;
