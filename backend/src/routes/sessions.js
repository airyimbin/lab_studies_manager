import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

const router = Router();
const col = () => getDB().collection("sessions");

/* -------------------- HELPERS -------------------- */

// Fallback actor system (until real auth exists)
function getActor(req) {
  return req.headers["x-actor"] || "System";
}

// Convert incoming date safely
function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/* -------------------- ROUTES -------------------- */

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const sessions = await col().find({}).toArray();

    const populatedSessions = await Promise.all(
      sessions.map(async (session) => {
        const [study, participant] = await Promise.all([
          session.studyId
            ? db.collection("studies").findOne(
                { _id: new ObjectId(session.studyId) },
                { projection: { title: 1 } }
              )
            : null,
          session.participantId
            ? db.collection("participants").findOne(
                { _id: new ObjectId(session.participantId) },
                { projection: { name: 1 } }
              )
            : null,
        ]);

        return {
          ...session,
          study:
            study || (session.studyId ? { _id: session.studyId, title: "(deleted)" } : null),
          participant:
            participant ||
            (session.participantId ? { _id: session.participantId, name: "(deleted)" } : null),
        };
      })
    );

    res.json(populatedSessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch sessions" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const sessionId = new ObjectId(req.params.id);
    const session = await col().findOne({ _id: sessionId });

    if (!session) return res.status(404).json({ error: "Not found" });

    const [study, participant] = await Promise.all([
      session.studyId
        ? db.collection("studies").findOne(
            { _id: new ObjectId(session.studyId) },
            { projection: { title: 1 } }
          )
        : null,
      session.participantId
        ? db.collection("participants").findOne(
            { _id: new ObjectId(session.participantId) },
            { projection: { name: 1 } }
          )
        : null,
    ]);

    session.study =
      study || (session.studyId ? { _id: session.studyId, title: "(deleted)" } : null);
    session.participant =
      participant ||
      (session.participantId ? { _id: session.participantId, name: "(deleted)" } : null);

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid ID" });
  }
});

router.put("/:id", async (req, res) => {
  let _id;
  try {
    _id = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const db = getDB();
  const sessions = db.collection("sessions");
  const actor = getActor(req);

  try {
    const current = await sessions.findOne({ _id });
    if (!current) return res.status(404).json({ error: "Not found" });

    const set = {};
    const history = [];
    const now = new Date();

    // Status change
    if (req.body.status !== undefined && req.body.status !== current.status) {
      set.status = req.body.status;
      history.push({
        at: now,
        event: `Status changed to ${req.body.status} by ${actor}`,
      });
    }

    // Start time change
    if (req.body.startedAt !== undefined) {
      const newStart = safeDate(req.body.startedAt);
      const oldStart = current.startedAt ? new Date(current.startedAt) : null;
      const changed =
        (newStart && !oldStart) ||
        (!newStart && oldStart) ||
        (newStart && oldStart && newStart.getTime() !== oldStart.getTime());
      if (changed) {
        set.startedAt = newStart;
        history.push({ at: now, event: `Start time updated by ${actor}` });
      }
    }

    // Notes change
    if (req.body.notes !== undefined && req.body.notes !== current.notes) {
      set.notes = req.body.notes === "" ? null : req.body.notes;
      history.push({ at: now, event: `Notes updated by ${actor}` });
    }

    // End time change
    if (req.body.endedAt !== undefined) {
      const newEnd = safeDate(req.body.endedAt);
      const oldEnd = current.endedAt ? new Date(current.endedAt) : null;
      const changed =
        (newEnd && !oldEnd) ||
        (!newEnd && oldEnd) ||
        (newEnd && oldEnd && newEnd.getTime() !== oldEnd.getTime());
      if (changed) {
        set.endedAt = newEnd;
        history.push({ at: now, event: `End time updated by ${actor}` });
      }
    }

    if (!Object.keys(set).length && history.length === 0) {
      return res.status(400).json({ error: "No changes" });
    }
    set.updatedAt = now;

    const update = {
      $set: set,
      ...(history.length ? { $push: { history: { $each: history } } } : {}),
    };

    const result = await sessions.findOneAndUpdate({ _id }, update, {
      returnDocument: "after",
    });

    res.json(result.value ?? result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not update session" });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const col = db.collection("sessions");
    const actor = (req.headers["x-actor"] || "System");

    const doc = {
      studyId: req.body.studyId ? new ObjectId(req.body.studyId) : null,
      participantId: req.body.participantId ? new ObjectId(req.body.participantId) : null,
      startedAt: req.body.startedAt ? new Date(req.body.startedAt) : new Date(),
      endedAt: null,
      notes: req.body.notes || null,
      results: null,
      status: "Scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: actor,
      history: [{ at: new Date(), event: `Session created by ${actor}`, actor }],
    };

    const result = await col.insertOne(doc);

    // Auto SID like S-XXXX from ObjectId tail
    const sid = `S-${result.insertedId.toString().slice(-4).toUpperCase()}`;
    await col.updateOne({ _id: result.insertedId }, { $set: { sid } });

    res.status(201).json({ ...doc, _id: result.insertedId, sid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create session" });
  }
});

export default router;
