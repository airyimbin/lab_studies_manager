import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

const router = Router();
const col = () => getDB().collection("participants");

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

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, notes, externalId } = req.body || {};

    if (!name && !externalId) {
      return res.status(400).json({ error: "Missing name or externalId" });
    }

    const now = new Date();

    
    let extId = externalId;
    if (!extId) {
      const count = await col().countDocuments();
      extId = `P-${String(count + 1).padStart(5, "0")}`;
      const exists = await col().findOne({ externalId: extId });
      if (exists) extId = `P-${Date.now()}`;
    }

    const doc = {
      externalId: extId,
      name: name || null,
      email: email || null,
      phone: phone || null,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    };

    const r = await col().insertOne(doc);
    const inserted = await col().findOne({ _id: r.insertedId });
    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create participant" });
  }
});

router.put("/:id", async (req, res) => {
  let objectId;
  try {
    objectId = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const { name, email, phone, notes, externalId } = req.body || {};
  const updates = {};
  const setIfDefined = (key, value) => {
    if (value !== undefined) updates[key] = value === "" ? null : value;
  };

  setIfDefined("name", name);
  setIfDefined("email", email);
  setIfDefined("phone", phone);
  setIfDefined("notes", notes);
  setIfDefined("externalId", externalId);

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

    if (!result || !result.value) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update participant" });
  }
});

export default router;
