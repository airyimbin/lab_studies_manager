import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

import sessionsRoutes from "./routes/sessions.js";
import studiesRoutes from "./routes/studies.js";
import participantsRoutes from "./routes/participants.js";

dotenv.config();


const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/sessions", sessionsRoutes);
app.use("/api/studies", studiesRoutes);
app.use("/api/participants", participantsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Backend running on port ${PORT}`)
  );
});