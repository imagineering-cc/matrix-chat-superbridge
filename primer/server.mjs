#!/usr/bin/env node
/**
 * The Bridgekeeper's Primer — adaptive backend.
 *
 * Serves the game (index.html) and gives it a live tutor ("the ractor"):
 * every /api/* call shells out to headless Claude Code (`claude -p`), which
 * runs on the Max subscription, with read-only repo tools and web search
 * enabled — so the Primer can grep relay/appservice/ and search the mautrix
 * docs while the learner plays.
 *
 * Zero npm dependencies. Binds to localhost only.
 *
 *   node primer/server.mjs        # then open http://127.0.0.1:7777
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const PORT = process.env.PRIMER_PORT || 7777;

// Read-only tools: the Primer may search the repo and the web, never edit.
const ALLOWED_TOOLS = "Read,Grep,Glob,WebSearch,WebFetch";

/** Run `claude -p` headless and resolve with its stdout text. */
function askClaude(prompt, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "claude",
      ["-p", prompt, "--output-format", "text", "--allowedTools", ALLOWED_TOOLS],
      { cwd: REPO_ROOT, env: process.env }
    );
    let out = "", err = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("The Primer took too long to think."));
    }, timeoutMs);
    child.stdout.on("data", d => (out += d));
    child.stderr.on("data", d => (err += d));
    child.on("close", code => {
      clearTimeout(timer);
      if (code === 0) resolve(out.trim());
      else reject(new Error(err.trim() || `claude exited ${code}`));
    });
    child.on("error", e => { clearTimeout(timer); reject(e); });
  });
}

const PRIMER_VOICE = `You are "The Primer" — the narrator-tutor of an interactive game teaching
how the imagineering.cc Matrix superbridge works: plumbing vs portal rooms, the mautrix
bridgev2 "megabridge" framework, split portals and receivers, the relay appservice with
puppet users, loop prevention, appservice registration on Continuwuity, double puppeting.
Voice: warm, slightly mythic, precise — Diamond Age's Illustrated Primer crossed with a
senior infrastructure engineer. Never condescending.

Ground every claim in THIS repository before asserting it: consult CLAUDE.md,
superbridge.sh, relay/appservice/*.py (handler.py, puppet.py, loop_prevention.py,
event_map.py, config.py) with the Read/Grep tools. Use WebSearch/WebFetch for current
mautrix documentation (docs.mau.fi) when the repo alone cannot answer.`;

/** Free-form question asked mid-game. Returns HTML for a chat bubble. */
async function handleAsk(body) {
  const prompt = `${PRIMER_VOICE}

The learner pauses the game to ask you a question. Current chapter: ${body.chapter || "unknown"}.
Their record so far (mistakes made, hints used, earlier questions): ${JSON.stringify(body.learner || {})}

Their question: """${body.question}"""

Research as needed (repo first, web second), then answer in the Primer's voice.
Reply with 1-3 short paragraphs of plain HTML — only <b>, <i>, <code>, <br> tags,
no markdown, no headings, no surrounding quotes. Cite file paths in <code> when you
ground an answer in the repo.`;
  return { html: await askClaude(prompt, 150_000) };
}

/** Generate a new adaptive chapter as a JSON scene the engine can run. */
async function handleChapter(body) {
  const prompt = `${PRIMER_VOICE}

The learner finished the scripted arc (chapters: ${JSON.stringify(body.completed || [])}).
Their record — use it to adapt difficulty and to revisit weak spots:
${JSON.stringify(body.learner || {})}

Requested topic for the next chapter: ${body.topic ? `"""${body.topic}"""` : "(none — you choose, favouring their weak spots or a natural next lesson, e.g. double puppeting, the event_map reply threading, the appservice registration namespace, media relay, or federation)"}

Research the topic in the repo (and web if needed), then write the chapter as a game
scene. Output ONLY a JSON array — no prose, no markdown fences. Each element is one step:

  {"t":"chapter","title":"Chapter VII · <name>"}
  {"t":"room","name":"#room:imagineering.cc","desc":"— scene-setting"}
  {"t":"msg","platform":"primer|matrix|discord|telegram|whatsapp|signal|error|you","sender":"Name","text":"HTML with <b>/<i>/<code> only","ms":900}
  {"t":"choice","prompt":"question?","options":[{"label":"...","ok":true,"fb":"why right"},{"label":"...","ok":false,"fb":"why wrong"}]}
  {"t":"multi","prompt":"select all...","applyLabel":"Apply","options":[{"label":"...","ok":true,"why":"..."},...]}
  {"t":"input","prompt":"type the command...","pattern":"^!tg\\\\s+set-relay$","hint":"...","placeholder":"..."}
  {"t":"badge","name":"<new badge name>"}

Rules: 12-25 steps. Open with a "chapter" step, end with a "badge" step. Include 1-2
"choice" puzzles with real technical trade-offs, at most one forgiving "input" regex
(case-insensitive is applied for you). Teach something TRUE — verify details against the
repo before asserting them. Wrong-answer feedback must explain the real reason.`;
  const raw = await askClaude(prompt, 240_000);
  // Extract the outermost JSON array (the model may add stray text despite instructions).
  const start = raw.indexOf("["), end = raw.lastIndexOf("]");
  if (start === -1 || end <= start) throw new Error("Primer returned no scene JSON.");
  const steps = JSON.parse(raw.slice(start, end + 1));
  if (!Array.isArray(steps) || !steps.length) throw new Error("Primer returned an empty scene.");
  return { steps };
}

// ---- tiny HTTP layer --------------------------------------------------------
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
}

const server = http.createServer(async (req, res) => {
  const send = (code, obj, type = "application/json") => {
    res.writeHead(code, { "Content-Type": type });
    res.end(type === "application/json" ? JSON.stringify(obj) : obj);
  };
  try {
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html"))
      return send(200, readFileSync(join(__dirname, "index.html")), "text/html");
    if (req.method === "GET" && req.url === "/api/health")
      return send(200, { ok: true });
    if (req.method === "POST" && req.url === "/api/ask")
      return send(200, await handleAsk(await readBody(req)));
    if (req.method === "POST" && req.url === "/api/chapter")
      return send(200, await handleChapter(await readBody(req)));
    send(404, { error: "not found" });
  } catch (e) {
    send(500, { error: e.message });
  }
});

server.listen(PORT, "127.0.0.1", () =>
  console.log(`⛩ The Bridgekeeper's Primer → http://127.0.0.1:${PORT}`)
);
