// backend/src/routes/auth.js
import { Router } from "express";
import { getDB } from "../db.js";
import bcrypt from "bcrypt";                     // ✅ use real bcrypt only
import {
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from "../utils/auth.js";

const router = Router();

// ---------------------- SIGN UP ----------------------
router.post("/signup", async (req, res) => {
  try {
    const db = getDB();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Check EMAIL or NAME conflict
    const existing = await db.collection("users").findOne({
      $or: [{ email }, { name }],
    });

    if (existing) {
      if (existing.email === email) {
        return res.status(409).json({ error: "Email already registered" });
      }
      if (existing.name === name) {
        return res.status(409).json({ error: "Username already taken" });
      }
    }

    const hash = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      passwordHash: hash,
      role: "admin",
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);
    user._id = result.insertedId;

    setAuthCookie(res, user);
    res.json({ ok: true });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ---------------------- LOGIN ----------------------
router.post("/login", async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;
    console.log(email, password)
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ✅ ensure _id is in token
    setAuthCookie(res, { ...user, _id: user._id });

    res.json({ ok: true });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

// ---------------------- LOGOUT ----------------------
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

// ---------------------- CURRENT USER ----------------------
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
