import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

const router = Router();
const col = () => getDB().collection("sessions");

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

router.put("/:id", async (req, res) => {
  let objectId;
  try {
    objectId = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const { endedAt, notes, results } = req.body || {};
  const updates = {};

  if (endedAt !== undefined) {
    if (endedAt === null || endedAt === "") {
      updates.endedAt = null;
    } else {
      const dateValue = new Date(endedAt);
      if (Number.isNaN(dateValue.getTime())) {
        return res.status(400).json({ error: "Invalid endedAt" });
      }
      updates.endedAt = dateValue;
    }
  }

  if (notes !== undefined) {
    updates.notes = notes === "" ? null : notes;
  }

  if (results !== undefined) {
    updates.results = Array.isArray(results) ? results : null;
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: "No fields to update" });
  }

  updates.updatedAt = new Date();

  try {
    const result = await col().findOneAndUpdate(
      { _id: objectId },
      { $set: updates },
      { returnDocument: "after" }
    );

    const updatedDoc = result?.value ?? result ?? null;

    if (!updatedDoc) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(updatedDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update session" });
  }
});

export default router;
