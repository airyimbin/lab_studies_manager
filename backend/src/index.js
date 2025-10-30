import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// Example health route
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Serve frontend build later:
// app.use(express.static(path.join(__dirname, "../../frontend/dist")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
