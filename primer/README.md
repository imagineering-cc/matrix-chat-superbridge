# The Bridgekeeper's Primer

A chat-shaped teaching game about how the superbridge works — plumbing vs portal
rooms, the mautrix bridgev2 "megabridge", the Telegram receiver-lock, the relay
appservice, and loop prevention. Every puzzle re-enacts a real gotcha from this
repo's history.

Inspired by the Young Lady's Illustrated Primer (Diamond Age): a scripted arc
with a live tutor — "the ractor" — behind it.

## Play it

The static build is published at **https://primer.imagineering.cc** (and the
Mautrix Galaxy at https://primer.imagineering.cc/land). That's degraded mode —
see below — because the adaptive ractor needs a local Claude Code login.
Deployed via `imagineering-infra`: `./scripts/deploy-to.sh <ip> primer`.

## Run it (full, with the live ractor)

```bash
node primer/server.mjs
# open http://127.0.0.1:7777
```

The server shells out to headless Claude Code (`claude -p`, Max plan — no API
key) with read-only repo tools and web search. That powers two adaptive layers:

- **🪶 Ask the Primer** — a free-question box available throughout play. The
  Primer greps `relay/appservice/`, reads `CLAUDE.md`/`superbridge.sh`, and
  searches the mautrix docs before answering, in character.
- **Generated chapters** — after the scripted arc (Chapters I–VI), the Primer
  writes Chapter VII, VIII, … live: new scenes in the game's own step format
  (choices, command inputs, badges), adapted to the mistakes you made and any
  topic you request (double puppeting, reply threading, media relay…).

## Degraded mode

Opening `index.html` directly (no server) still works — you get the static
six-chapter arc; the adaptive layer stays dark ("ractor offline").

## Architecture

| File | Role |
|---|---|
| `index.html` | Single-file game: chat UI, step engine, learner model, ractor hooks |
| `server.mjs` | Zero-dependency Node server: serves the game, bridges `/api/ask` and `/api/chapter` to `claude -p` (tools: `Read,Grep,Glob,WebSearch,WebFetch`, cwd = repo root) |

Generated chapters arrive as JSON arrays of engine steps and are spliced into
the running script — the game's structure is mutable at play time by design.
