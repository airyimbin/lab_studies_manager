// backend/src/index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import sessionsRoutes from "./routes/sessions.js";
import participantsRoutes from "./routes/participants.js";
import studiesRoutes from "./routes/studies.js";
import { requireAuth, readUserFromReq } from "./utils/auth.js";
import passport from "../config/passport.js";
import session from "express-session";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

// ✅ Built-in middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));    

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());  

// ✅ Healthcheck (no auth needed)
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ✅ Auth (signup, login, logout, me)
app.use("/api/auth", authRoutes);

// ✅ Auth State Checker (helps frontend know who is logged in)
app.get("/api/auth/me", (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user });
});

// ✅ Protected APIs (require login)
app.use("/api/sessions", requireAuth, sessionsRoutes);
app.use("/api/participants", requireAuth, participantsRoutes);
app.use("/api/studies", requireAuth, studiesRoutes);

// ✅ Connect DB before starting API server
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Backend running at http://localhost:${PORT}`)
  );
});
