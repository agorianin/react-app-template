import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAiReply } from "./aiProvider.js";
import { sendVerificationEmail } from "./mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "..", "dist");

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(express.json({ limit: "1mb" }));

app.post("/api/auth/login", (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const token = Buffer.from(`${email}:session`, "utf8").toString("base64");
  res.json({
    user: {
      email,
      token
    }
  });
});

app.post("/api/auth/send-verification-link", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const displayName = typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";

  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  const verificationBaseUrl = process.env.EMAIL_VERIFICATION_URL ?? "http://localhost:5173/verify-email";
  const verificationLink = `${verificationBaseUrl}?email=${encodeURIComponent(email)}`;

  try {
    await sendVerificationEmail({
      to: email,
      displayName: displayName || (email.split("@")[0] ?? "there"),
      verificationLink
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to send verification email." });
  }
});

app.post("/api/chat", async (req, res) => {
  const authHeader = req.header("Authorization");
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required." });
    return;
  }

  if (!email) {
    res.status(400).json({ error: "User context is missing." });
    return;
  }

  try {
    const reply = await getAiReply(prompt, email);
    res.json({ reply });
  } catch {
    res.status(502).json({ error: "Failed to get AI response." });
  }
});

app.use(express.static(distPath));

app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
