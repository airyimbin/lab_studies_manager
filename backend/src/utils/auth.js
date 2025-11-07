// backend/src/utils/auth.js
import fs from "fs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "lsm_token";
const DAY = 24 * 60 * 60 * 1000;
const JWT_SECRET = process.env.JWT_SECRET || (() => { try { return fs.readFileSync(new URL("../../.env", import.meta.url), "utf8").match(/^JWT_SECRET=(.*)$/m)?.[1]?.trim(); } catch { return null; } })() || (() => { throw new Error("JWT_SECRET is not configured."); })();

// --- Build signed JWT payload ---
function signToken(user) {
  return jwt.sign(
    {
      _id: user._id?.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "viewer",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// --- Write secure cookie ---
export function setAuthCookie(res, user) {
  const token = signToken(user);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // ✅ only secure in prod
    maxAge: 7 * DAY,
    path: "/",
  });
}

// --- Clear cookie on logout ---
export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

// --- Get current user from request cookie ---
export function readUserFromReq(req) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

// --- Route guard middleware ---
export function requireAuth(req, res, next) {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

// --- Helper for UI: returns user or null ---
export function isAuthed(req) {
  return readUserFromReq(req) !== null;
}

// --- Used by sessions history system ---
export function getActor(req) {
  return req?.user?.name || req?.user?.email || "unknown";
}
