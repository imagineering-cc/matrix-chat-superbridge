# Matrix Self-Hosted Server Research

**Date:** 2026-02-01 (Updated: 2026-02-02)

## Executive Summary

Matrix is a decentralized, open-standard communication protocol for real-time communication with full federation support. This document covers server options, bridges for popular chat apps, federation configuration, and self-hosting best practices.

### Quick Start Recommendations

| Use Case | Server | Database | Why |
|----------|--------|----------|-----|
| Personal/Small (1-10 users) | Synapse | PostgreSQL | Most reliable, best bridge support |
| Small-Medium (10-100 users) | Synapse | PostgreSQL | Mature, full features, good bridge support |
| Large/Enterprise (100+ users) | Synapse (workers) | PostgreSQL | Scalable, battle-tested |
| Lightweight/Experimental | Continuwuity | RocksDB | Active Rust community fork, low resources |

> **Note (2026-02):** Dendrite is now in maintenance mode at Matrix.org (moved to Element). Conduit's main fork (conduwuit) was archived in April 2025. For lightweight options, consider Continuwuity (community continuation) or stick with Synapse for stability.

### Top Bridge Recommendations

| Platform | Recommended Bridge | Notes |
|----------|-------------------|-------|
| Discord | mautrix-discord | Best feature support, active development |
| Telegram | mautrix-telegram | Excellent, most mature mautrix bridge |
| WhatsApp | mautrix-whatsapp | Works well, uses WhatsApp Web protocol |
| Signal | mautrix-signal | Good but requires signald daemon |
| Slack | mautrix-slack | Better than appservice-slack for most cases |
| iMessage | mautrix-imessage | Requires macOS or jailbroken iOS |
| IRC | Heisenbridge | Modern replacement for older bridges |

---

## 1. Matrix Server Options

### Synapse (Python - Reference Implementation)

The original and most widely deployed Matrix homeserver.

**Pros:**
- Most mature and battle-tested
- Full Matrix spec compliance
- Excellent documentation
- Best bridge compatibility
- Supports workers for horizontal scaling
- Largest community and support

**Cons:**
- Highest resource usage
- Requires PostgreSQL for production
- Can be slow on large rooms

**Resource Requirements:**
- RAM: 1-4GB+ depending on usage
- CPU: 1-2+ cores
- Storage: Grows with media/history

**Repository:** https://github.com/matrix-org/synapse

### Dendrite (Go - Second Generation)

Second-generation homeserver written in Go.

> **Status (2026-02):** The Matrix.org Foundation archived Dendrite in November 2024. Development continues under Element at [element-hq/dendrite](https://github.com/element-hq/dendrite), but the project is now in maintenance mode with limited active development.

**Pros:**
- Lower resource usage than Synapse
- Better performance characteristics
- Can run as monolith or microservices

**Cons:**
- In maintenance mode (limited new development)
- Not fully feature-complete
- Smaller community
- Some bridges may have compatibility issues
- Future tied to Element's priorities

**Resource Requirements:**
- RAM: 200-500MB for active use
- CPU: 1 core typically sufficient
- Storage: Similar to Synapse

**Repository:** https://github.com/element-hq/dendrite (active)
**Archived:** https://github.com/matrix-org/dendrite (read-only)

### Conduit / Continuwuity (Rust - Lightweight)

Lightweight Rust-based homeservers.

> **Status (2026-02):** The original Conduit is in maintenance/beta mode. Its popular fork **conduwuit** was archived in April 2025. The community has continued development as **Continuwuity**.

**Pros:**
- Extremely lightweight (50-200MB RAM)
- Single binary deployment
- Very easy setup
- Fast startup time
- Uses RocksDB (no separate database needed)

**Cons:**
- Fragmented ecosystem (multiple forks)
- Fewer features than Synapse
- Limited admin tooling
- Some bridges may have compatibility issues
- Smaller community for troubleshooting

**Resource Requirements:**
- RAM: 50-200MB
- CPU: 1 core typically sufficient
- Storage: Grows with usage

**Repositories:**
- **Continuwuity** (recommended): https://forgejo.ellis.link/continuwuation/continuwuity
- Conduit (original, maintenance mode): https://gitlab.com/famedly/conduit
- conduwuit (archived April 2025): https://codeberg.org/arf/conduwuit

---

## 2. Bridge Options for Chat Apps

### Overview

The mautrix bridge suite is the most actively maintained and feature-rich set of bridges. All mautrix bridges generally support:
- Text messages
- Media (images, files, video, audio)
- Reactions
- Replies
- Message edits
- Message deletions
- Typing indicators
- Read receipts

**Note:** Voice/video bridging is generally not supported by any bridges.

### Discord

#### mautrix-discord (Recommended)
- **Setup:** Moderate - requires Discord bot token
- **Features:** Messages, reactions, replies, threads, embeds, stickers, media
- **Limitations:** No voice/video, some embed formatting differences
- **Status:** Actively maintained
- **Repo:** https://github.com/mautrix/discord

#### matrix-appservice-discord
- **Setup:** Moderate
- **Features:** Basic messaging, webhooks
- **Status:** Less actively maintained
- **Repo:** https://github.com/matrix-org/matrix-appservice-discord

### Telegram

#### mautrix-telegram (Recommended)
- **Setup:** Requires Telegram API credentials
- **Features:** Excellent - messages, media, stickers, reactions, replies, forwards, location
- **Status:** Most mature mautrix bridge
- **Notes:** Supports both bot and user puppeting
- **Repo:** https://github.com/mautrix/telegram

### WhatsApp

#### mautrix-whatsapp (Recommended)
- **Setup:** QR code linking (like WhatsApp Web)
- **Features:** Messages, media, reactions, replies, location, contacts
- **Limitations:** Uses WhatsApp Web protocol, may break if WhatsApp changes API
- **Status:** Actively maintained
- **Repo:** https://github.com/mautrix/whatsapp

### Signal

#### mautrix-signal (Recommended)
- **Setup:** Complex - requires signald daemon
- **Features:** Messages, media, reactions, replies
- **Limitations:** Requires separate signald process, phone number needed
- **Status:** Actively maintained
- **Repo:** https://github.com/mautrix/signal

**signald:** https://gitlab.com/signald/signald

### Slack

#### mautrix-slack (Recommended)
- **Setup:** Requires Slack app configuration with OAuth
- **Features:** Messages, threads, reactions, files
- **Status:** Actively maintained
- **Repo:** https://github.com/mautrix/slack

#### matrix-appservice-slack
- **Setup:** Webhook-based or RTM
- **Features:** Basic messaging
- **Status:** Less feature-rich than mautrix
- **Repo:** https://github.com/matrix-org/matrix-appservice-slack

### iMessage

#### mautrix-imessage
- **Setup:** Complex - requires macOS host or jailbroken iOS device
- **Features:** Messages, media, reactions, replies, tapbacks
- **Limitations:** Platform requirements make this challenging
- **Notes:** Beeper (company) has commercial solutions
- **Repo:** https://github.com/mautrix/imessage

### IRC

#### Heisenbridge (Recommended)
- **Setup:** Relatively simple
- **Features:** Modern bouncer-style IRC bridge
- **Status:** Actively maintained, modern replacement for older bridges
- **Repo:** https://github.com/hifi/heisenbridge

#### matrix-appservice-irc
- **Setup:** More complex
- **Features:** Full-featured but older architecture
- **Repo:** https://github.com/matrix-org/matrix-appservice-irc

### Other Notable Bridges

| Platform | Bridge | Notes |
|----------|--------|-------|
| Facebook Messenger | mautrix-facebook | Uses Facebook's unofficial API |
| Instagram | mautrix-instagram | Direct messages |
| Twitter/X | mautrix-twitter | DMs only |
| Google Chat | mautrix-googlechat | Requires Google account |
| LinkedIn | mautrix-linkedin | Community maintained |
| XMPP | mautrix-xmpp | Jabber/XMPP federation |

---

## 3. Matrix Federation

### How Federation Works

Matrix federation allows users on different homeservers to communicate seamlessly. Key concepts:

1. **Server-to-Server (S2S) API:** Homeservers communicate via HTTPS
2. **Room State:** Rooms are replicated across all participating servers
3. **Event DAG:** Messages form a directed acyclic graph for consistency
4. **Signing Keys:** Servers sign events cryptographically

### Federation Requirements

#### Ports and Protocols
- **Port 443:** Preferred (via .well-known delegation)
- **Port 8448:** Default Matrix federation port
- **Protocol:** HTTPS with valid TLS certificate

#### DNS Configuration

**Option 1: .well-known (Recommended)**

Create `/.well-known/matrix/server` at your domain root:
```json
{
  "m.server": "matrix.yourdomain.com:443"
}
```

**Option 2: SRV Record**
```
_matrix._tcp.yourdomain.com. 3600 IN SRV 10 5 443 matrix.yourdomain.com.
```

#### Client Discovery

Create `/.well-known/matrix/client`:
```json
{
  "m.homeserver": {
    "base_url": "https://matrix.yourdomain.com"
  }
}
```

### Testing Federation

Use the official federation tester:
- https://federationtester.matrix.org

Enter your domain to verify:
- DNS resolution
- TLS certificate validity
- Server reachability
- Signing key availability

### Private Federation

You can run Matrix without federation for internal use:
- Don't expose federation port
- Set `allow_public_rooms_over_federation: false`
- Disable room directory federation

---

## 4. Best Practices for Self-Hosting

### Deployment Methods

#### Docker Compose (Recommended for most users)
```yaml
version: '3'
services:
  synapse:
    image: matrixdotorg/synapse:latest
    restart: unless-stopped
    volumes:
      - ./data:/data
    environment:
      - SYNAPSE_CONFIG_PATH=/data/homeserver.yaml
    ports:
      - "8008:8008"
    depends_on:
      - db

  db:
    image: postgres:15
    restart: unless-stopped
    volumes:
      - ./postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=synapse
      - POSTGRES_PASSWORD=changeme
      - POSTGRES_DB=synapse
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
```

#### Ansible Playbook (Comprehensive)
For a complete setup including bridges, use the community playbook:
https://github.com/spantaleev/matrix-docker-ansible-deploy

This handles:
- Synapse (recommended) or Dendrite
- All popular bridges
- Reverse proxy
- SSL certificates
- PostgreSQL
- Admin tools

> **Note:** Synapse is the most reliable choice for this playbook due to best documentation, bridge compatibility, and long-term Matrix.org support.

### Database Configuration

**SQLite:** Only for testing/development
**PostgreSQL:** Required for production Synapse

PostgreSQL optimizations:
```sql
-- Recommended settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
work_mem = 16MB
```

### Reverse Proxy Configuration

#### Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name matrix.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location ~ ^(/_matrix|/_synapse/client) {
        proxy_pass http://localhost:8008;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        client_max_body_size 50M;
    }
}

# Federation (if using port 8448)
server {
    listen 8448 ssl http2;
    server_name matrix.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:8008;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}
```

#### Caddy (Simpler)
```caddy
matrix.yourdomain.com {
    reverse_proxy /_matrix/* localhost:8008
    reverse_proxy /_synapse/* localhost:8008
}
```

### SSL/TLS Setup

Use Let's Encrypt with auto-renewal:
```bash
certbot certonly --nginx -d matrix.yourdomain.com
```

Or with Caddy (automatic).

### Backup Strategy

**Critical to back up:**
1. PostgreSQL database (daily dumps)
2. Media store (`/data/media_store`)
3. Signing keys (`/data/*.signing.key`) - **CRITICAL: Cannot be regenerated!**
4. Configuration files

```bash
# PostgreSQL backup
pg_dump -U synapse synapse > synapse_backup_$(date +%Y%m%d).sql

# Full data backup
tar -czf matrix_backup_$(date +%Y%m%d).tar.gz /path/to/data
```

### Monitoring

Enable Prometheus metrics in Synapse:
```yaml
enable_metrics: true
metrics_port: 9000
```

Grafana dashboard: ID 10046

Key metrics to monitor:
- `synapse_federation_send_queue_length`
- `synapse_storage_events`
- `synapse_http_server_requests_total`
- Database connection pool usage

### Security Hardening

1. **Disable open registration** (or use CAPTCHA/email verification)
```yaml
enable_registration: false
# Or with restrictions:
enable_registration: true
enable_registration_captcha: true
```

2. **Enable rate limiting**
```yaml
rc_message:
  per_second: 0.2
  burst_count: 10
rc_registration:
  per_second: 0.17
  burst_count: 3
```

3. **Restrict URL previews** (SSRF prevention)
```yaml
url_preview_enabled: true
url_preview_ip_range_blacklist:
  - '127.0.0.0/8'
  - '10.0.0.0/8'
  - '172.16.0.0/12'
  - '192.168.0.0/16'
```

4. **Use strong secrets** - Generate with:
```bash
pwgen -s 64 1
```

---

## 5. Ecosystem Tools

### Admin Tools

#### Synapse Admin
Web UI for Synapse administration.
- User management
- Room management
- Server statistics
- Media management

**Repo:** https://github.com/Awesome-Technologies/synapse-admin

### Client Options

| Client | Platform | Notes |
|--------|----------|-------|
| Element | Web, Desktop, iOS, Android | Official client, most features |
| FluffyChat | All platforms | Beautiful UI, Flutter-based |
| Cinny | Web | Discord-like interface |
| Nheko | Desktop | Native Qt client |
| SchildiChat | All | Element fork with extra features |
| Hydrogen | Web | Lightweight, fast |

### Media Repository

- **Built-in:** Works for most cases
- **matrix-media-repo:** For S3/object storage support
  - https://github.com/turt2live/matrix-media-repo

### Identity Server

Usually not needed for self-hosting. If required:
- **ma1sd:** https://github.com/ma1uta/ma1sd

---

## Key Resources

### Official Documentation
- Matrix Spec: https://spec.matrix.org/
- Synapse Docs: https://matrix-org.github.io/synapse/latest/
- Dendrite Docs: https://matrix-org.github.io/dendrite/ (may be outdated)
- Conduit Docs: https://docs.conduit.rs/
- Continuwuity Docs: https://forgejo.ellis.link/continuwuation/continuwuity

### Community Resources
- Ansible Playbook: https://github.com/spantaleev/matrix-docker-ansible-deploy
- Matrix.org Blog: https://matrix.org/blog/
- Reddit: r/selfhosted, r/Matrix

### Support Rooms
- `#synapse:matrix.org` - Synapse support
- `#matrix:matrix.org` - General Matrix discussion
- `#matrix-bridges:matrix.org` - Bridge support

---

## Getting Started Checklist

1. [ ] Choose a server (Synapse recommended for beginners)
2. [ ] Set up PostgreSQL database
3. [ ] Configure reverse proxy with SSL
4. [ ] Set up DNS and .well-known files
5. [ ] Test federation at federationtester.matrix.org
6. [ ] Install Element or preferred client
7. [ ] Set up bridges as needed
8. [ ] Configure backups
9. [ ] Set up monitoring
10. [ ] Harden security settings

---

## Cross-Platform Double Puppeting Research (2026-02-04)

### 1. Executive Summary

**Can true cross-bridge puppeting be done?** YES -- for users who log into both bridges with double puppeting enabled. We confirmed this on 2026-02-04: sending from Discord appears as your real Telegram account, and vice versa. For users who are only on one platform, ghost puppet relay (via Discord webhooks) provides good attribution with name and avatar. No custom development was needed.

**The fundamental problem:** Double puppeting is a relationship between *one bridge* and *one user's Matrix account*. It allows the bridge to send messages as the user's real Matrix identity instead of a ghost user. But this only works *within that single bridge's scope*. When a second bridge (e.g., mautrix-telegram) sees a message in a Matrix room, it sees the sender's Matrix user ID -- whether that is a real user or a ghost from another bridge. It has no mechanism to look up "which Telegram account corresponds to this Discord ghost?" and send the message as that Telegram account.

**What we proved works (2026-02-04 testing):**

1. **Full cross-platform puppeting for logged-in users** -- User logged into both mautrix-discord and mautrix-telegram with double puppeting. Sent from Discord -> appeared as their real Telegram account. Sent from Telegram -> appeared as their real Discord account. Sent from Element -> appeared as them on both platforms. **No custom code needed.**
2. **Ghost puppet relay via Discord webhooks** -- A Telegram-only user (Angie) sent a message. It appeared in Discord via webhook with her name (and avatar if set). She didn't need a Discord account. Enabled with `!discord set-relay --create`.
3. **Bridging a room to both platforms** -- A single Matrix room was bridged to both a Discord channel and a Telegram group. Required: inviting `@telegrambot:local` to a Discord portal room and running `!tg bridge -<chat_id>`.

**Remaining limitations:**
- Ghost puppet relay to Telegram requires a relay bot (BotFather token) -- not yet configured
- Relay messages show a "BOT" tag on Discord and come from the relay bot on Telegram
- Custom application service or bridge fork needed for true puppeting of ALL users without individual login

---

### 2. How Double Puppeting Actually Works

Double puppeting is the mechanism by which a bridge sends messages to the Matrix room as the user's *real* Matrix account instead of creating a separate ghost/puppet user.

#### The Problem Double Puppeting Solves

When a user sends a message from a native app (e.g., Telegram), the bridge needs to represent that message on the Matrix side. Without double puppeting, the bridge creates a ghost user like `@telegram_12345:example.com` to send the message. This creates confusion: the user sees "their own" messages appearing as a different user, gets duplicate unread notifications, and the room fills with ghost users.

With double puppeting enabled, the bridge instead sends the message as `@nick:example.com` (the user's real Matrix account). This makes the conversation look natural on the Matrix side.

#### Technical Implementation (Appservice Method)

The recommended approach uses a secondary appservice registration file (`doublepuppet.yaml`):

```yaml
# doublepuppet.yaml
id: doublepuppet
url:   # intentionally null -- homeserver should not push events here
as_token: <random_secret_token>
hs_token: <random_string>  # never used since url is null
sender_localpart: _doublepuppet
rate_limited: false

namespaces:
  users:
    - regex: '@.*:your\.domain'
      exclusive: false   # MUST be false -- otherwise blocks all users
```

Key points:
- The regex `@.*:your\.domain` matches **all users** on the homeserver, allowing the bridge to act as any local user.
- `exclusive: false` is critical -- setting it to `true` would prevent normal users from functioning.
- The `url` is null because this appservice does not need to receive events; it only needs the `as_token` to impersonate users.
- The bridge is configured with `double_puppet -> secrets -> as_token:<token>`, which lets it use the appservice API to send messages as any user by passing the `user_id` query parameter.
- This method does not create device sessions, avoids rate limiting, and enables timestamp massaging (backfilling with correct timestamps).

#### What Double Puppeting Does NOT Do

- It does **not** create any cross-bridge identity mapping.
- It does **not** allow Bridge A's ghost users to be recognized by Bridge B.
- It only works for the direction: remote platform -> Matrix (making the message appear as the real Matrix user instead of a ghost).
- The outbound direction (Matrix -> remote platform) is handled by the bridge's login/puppeting of the remote account.

---

### 3. The Cross-Bridge Identity Problem

#### The Message Flow

Consider a Matrix room bridged to both a Discord channel (via mautrix-discord) and a Telegram group (via mautrix-telegram). When a Discord user sends a message:

```
Discord User "Alice" sends "Hello!"
   |
   v
mautrix-discord bridge picks up the message
   |
   v
Bridge posts to Matrix room as ghost user @discord_alice:example.com
(or as @nick:example.com if Alice has double puppeting enabled AND
 Alice is the bridge-logged-in user)
   |
   v
mautrix-telegram bridge sees the Matrix event
   |
   v
Bridge checks: "Is this sender logged into MY bridge?"
   - If @nick:example.com (real user with telegram login): YES -> sends as Nick's Telegram account
   - If @discord_alice:example.com (Discord ghost): NO -> relay via bot, or drop
```

#### Why It Fails

The critical failure point: when Alice sends from Discord and has double puppeting enabled on the Discord bridge, her message appears in Matrix as `@nick:example.com`. The Telegram bridge sees this as Nick's real Matrix user and -- if Nick has also logged into the Telegram bridge -- sends it as Nick's Telegram account. **This actually works!**

But here is the catch: double puppeting on the Discord bridge only works if Nick has logged his Discord account into the bridge. When *other* Discord users (who have not logged into the bridge) send messages, they appear as ghost users like `@discord_bob:example.com`. The Telegram bridge has no idea who `@discord_bob:example.com` is on Telegram, so it either:

1. **Drops the message** (if no relay is configured)
2. **Relays via bot** with the format `"Bob (Discord): Hello!"` -- sent from the relay bot account, not Bob's Telegram account

This is the fundamental limitation: **there is no identity mapping database that links Discord User Bob to Telegram User Bob across bridges.**

#### The Single-User Sweet Spot

For a single user who has:
- Logged into mautrix-discord with their Discord account
- Logged into mautrix-telegram with their Telegram account
- Enabled double puppeting on both bridges

Sending from Matrix (Element) works perfectly on both platforms. The message goes out as the user on both Discord and Telegram.

However, sending from Discord means the message appears as the real Matrix user (via double puppeting), and the Telegram bridge *does* recognize this real Matrix user and sends as their Telegram account. **So for the single bridge-logged-in user, cross-bridge identity actually works!**

The problem is only for *other* users in the room who appear as ghost/puppet users from one bridge and are unknown to the other bridge.

---

### 4. Possible Solutions

#### Solution 1: Users Log Into Both Bridges (Best for Small Groups)

**How it works:** Every user who participates logs their accounts into both mautrix-discord and mautrix-telegram on the same homeserver, with double puppeting enabled on both.

**Pros:**
- True identity on all platforms
- Works with existing tooling, no custom development
- Full feature support (reactions, edits, replies)

**Cons:**
- Requires every user to have a Matrix account on your homeserver
- Every user must complete the login process for both bridges
- Does not scale to large communities
- Users need to manage bridge sessions

**Feasibility:** High for a small, dedicated group (2-10 people). Impractical for communities.

#### Solution 2: Relay Mode with Webhooks (Best UX Without Full Puppeting)

**How it works:** Configure relay mode on both bridges. On the Discord side, use webhooks to display sender name and avatar. On the Telegram side, use the relay bot with message format templates.

**Discord side setup:**
```
!discord set-relay --create matrix-bridge
```
The bridge creates a Discord webhook. Messages from non-logged-in Matrix users (including Telegram ghosts) are sent via the webhook with the sender's display name and avatar. This looks quite natural on Discord -- each message appears with the correct name/avatar, though it shows a "BOT" tag.

**Telegram side setup:**
The Telegram relay bot sends messages with configurable format templates:
```
message_formats:
  m.text: '$sender_displayname: $message'
  m.notice: '$sender_displayname: $message'
  m.emote: '* $sender_displayname $message'
```

On Telegram, messages appear as: `Alice (Discord): Hello!` -- all sent from the relay bot account.

**Pros:**
- Works for any number of users without individual login
- Discord webhooks provide decent visual attribution
- Configurable message format templates
- Can be enabled per-room

**Cons:**
- Messages come from a bot, not the real user account
- Telegram side shows all messages from the same bot
- No reactions, replies, or read receipts for relayed users
- Not "true" puppeting -- recipients can tell it is a bridge

**Feasibility:** High. This is the most practical solution for communities today.

#### Solution 3: Matterbridge (Direct Discord-Telegram Bridge)

**How it works:** Matterbridge is a standalone Go application that directly bridges 30+ chat platforms, including Discord and Telegram, without using Matrix as an intermediary.

**Configuration example:**
```toml
[telegram]
  [telegram.mytelegram]
    Token = "your-telegram-bot-token"
    RemoteNickFormat = "[{PROTOCOL}] <{NICK}> "

[discord]
  [discord.mydiscord]
    Token = "your-discord-bot-token"
    Server = "your-server-id"
    RemoteNickFormat = "[{PROTOCOL}] <{NICK}> "
    # UseLocalAvatar guesses Discord avatar from username match
    UseLocalAvatar = ["telegram.mytelegram"]

[[gateway]]
  name = "my-gateway"
  enable = true
  [[gateway.inout]]
    account = "telegram.mytelegram"
    channel = "-1001234567890"
  [[gateway.inout]]
    account = "discord.mydiscord"
    channel = "ID:123456789012345678"
```

**Key features:**
- `RemoteNickFormat` controls how relayed sender names appear
- `ExtractNicks` provides interoperability with other bridge software
- `UseLocalAvatar` can match usernames to local Discord users and use their avatars
- Supports media, files, threads (experimental), and reactions

**Pros:**
- Simpler architecture (no Matrix needed for Discord-Telegram specifically)
- Better sender attribution than double-bridging through Matrix
- Single application handles the relay
- Supports 30+ platforms simultaneously
- Active community fork at github.com/matterbridge-org/matterbridge

**Cons:**
- Still uses a bot -- not true user puppeting
- Cannot send as the user's actual account
- No Matrix integration (parallel system)
- Requires its own hosting and configuration
- Less feature-rich than mautrix bridges for individual platform support

**Feasibility:** High. Good alternative if Matrix is not required as the central hub.

#### Solution 4: Custom Application Service (Most Promising for True Solution)

**How it works:** Build a custom Matrix application service that:
1. Maintains a mapping database: `{discord_ghost_id} -> {matrix_real_user} -> {telegram_account}`
2. Listens for messages from bridge ghost users in designated rooms
3. When a ghost user (e.g., `@discord_bob:example.com`) sends a message, looks up the corresponding real Matrix user
4. Re-sends the message as the real Matrix user (using the double puppet appservice token)
5. The other bridge then recognizes the real Matrix user and sends as their account on the other platform

**Architecture:**
```
Discord User Bob sends "Hello"
   |
   v
mautrix-discord posts as @discord_bob:example.com
   |
   v
Custom Appservice intercepts the event
   |
   v
Looks up mapping: discord_bob -> @bob:example.com
   |
   v
Redacts/hides the ghost message (optional)
   |
   v
Re-sends "Hello" as @bob:example.com (via double puppet as_token)
   |
   v
mautrix-telegram sees message from @bob:example.com
   |
   v
Bob is logged into Telegram bridge -> sends as Bob's Telegram account
```

**Critical technical constraints:**
- Appservices **cannot** intercept or suppress events. They can only observe and inject new events. So the ghost user's message would still appear briefly before being redacted.
- The custom appservice would need to register a non-exclusive namespace covering all users (like the double puppet registration).
- Redacting the ghost's original message requires the appservice to have moderator power level in the room, or the ghost user to redact its own message.
- Timing: there would be a brief window where both the ghost message and the re-sent message exist, potentially causing the other bridge to relay both.
- The identity mapping database would need to be maintained manually or through a registration/pairing process.

**A potentially cleaner approach:**
Instead of intercepting after-the-fact, modify the mautrix bridge source code to add a pre-send hook that checks a cross-bridge identity map before posting a message. If the incoming remote user has a known Matrix account, post as that account directly (using the double puppet token) instead of creating a ghost user. This would require forking the mautrix bridge code.

**Pros:**
- Could achieve true cross-platform identity
- Works within the existing Matrix ecosystem
- Leverages existing double puppeting infrastructure

**Cons:**
- Requires significant custom development
- Race conditions between ghost message and re-sent message
- Complex identity mapping management
- Must handle edge cases (edits, reactions, deletions, media)
- Forking bridge code means maintenance burden for updates

**Feasibility:** Medium. The concept is sound, but the implementation is non-trivial. The cleanest approach would be to fork the mautrix bridge code rather than building a separate intercepting appservice.

#### Solution 5: Hybrid Approach (Matterbridge + Matrix)

**How it works:** Use Matrix with mautrix bridges for primary bridging (with double puppeting for the main user), and run Matterbridge alongside for community relay between Discord and Telegram.

**Pros:**
- Main user gets full puppeting via Matrix
- Community messages get decent attribution via Matterbridge
- Separation of concerns

**Cons:**
- Duplicate messages if both systems bridge the same rooms
- Complex configuration to avoid conflicts
- Two systems to maintain

**Feasibility:** Medium. Requires careful configuration to avoid message duplication.

---

### 5. Beeper's Approach

Beeper (acquired by Automattic in 2024 for $125M) is the most prominent commercial implementation of Matrix-based multi-platform bridging. Understanding their approach is informative.

#### How Beeper Works

- Every Beeper account is a Matrix account on the Beeper homeserver.
- Each connected platform (WhatsApp, Telegram, Discord, etc.) runs its own bridge instance.
- Bridges create puppet users in the namespace `@<name>_.+:beeper.local` for each contact.
- The bridge bot for each platform is `@<name>bot:beeper.local`.

#### Cross-Bridge Identity in Beeper

**Beeper does NOT solve the cross-bridge identity problem.** The same real-world person appearing on multiple networks (e.g., WhatsApp and Telegram) shows up as **separate contacts** within Beeper unless manually merged by the user. Each bridge creates its own puppet users, and there is no automatic identity correlation across bridges.

This is a critical finding: even the most well-funded Matrix bridge implementation (Beeper) has not solved this problem. Their approach is a unified *inbox* (all conversations in one app), not a unified *identity* (same person recognized across platforms).

#### Beeper's Architecture Evolution (2024-2025)

Beeper has evolved significantly:
- **Cloud bridges (original):** Bridges run on Beeper's servers, connecting to each platform via stored credentials. End-to-bridge encryption (not true E2EE).
- **On-device bridges (2025):** Bridges run locally on the user's device, connecting directly to each platform. True E2EE preserved for platforms that support it (Signal, WhatsApp).
- All bridges are open source (mautrix-based).
- Self-hosting is supported via the `beeper/bridge-manager` tool.

#### What We Can Learn from Beeper

1. They accepted the "separate contacts per platform" limitation and focused on UX to make it manageable.
2. Their unified inbox approach prioritizes convenience over identity unification.
3. The move to on-device bridges suggests that even they found the cloud-hosted bridge model had privacy/reliability issues.
4. Their scale and resources confirm that cross-bridge identity is genuinely hard, not just an oversight.

---

### 6. Relay Bot Configuration

Since relay mode is the most practical workaround for community bridging, here is detailed setup guidance.

#### mautrix-telegram Relay Bot Setup

1. **Create a Telegram bot** via @BotFather
2. **Disable privacy mode** using BotFather's `/setprivacy` command (required to read group messages)
3. **Configure the bridge:**
   ```yaml
   telegram:
     bot_token: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"

   bridge:
     relaybot:
       authless_portals: true  # Allow creating portals from Telegram
   ```
4. **Restart the bridge** and verify with `!tg ping-bot`
5. **Invite the relay bot** to Telegram groups
6. **Bridge rooms** using `!tg bridge <chat_id>` or `/portal` from Telegram

**Message format configuration (bridge-wide):**
```yaml
bridge:
  relaybot:
    message_formats:
      m.text: '$sender_displayname: $message'
      m.notice: '$sender_displayname: $message'
      m.emote: '* $sender_displayname $message'
      m.file: '$sender_displayname sent a file'
      m.image: '$sender_displayname sent an image'
      m.audio: '$sender_displayname sent an audio file'
      m.video: '$sender_displayname sent a video'
      m.location: '$sender_displayname sent a location'
```

**Per-room configuration:**
```
!tg config set message_formats {"m.text": "$sender_displayname: $message"}
```

**Available template variables:**
- `$sender_displayname` -- Display name of the Matrix sender
- `$sender_username` -- Username (localpart) of the Matrix sender
- `$sender_mxid` -- Full Matrix ID of the sender
- `$message` -- The message content
- `$distinguisher` -- A random string from `relay_user_distinguishers` array

#### mautrix-discord Relay Setup (with Webhooks)

1. **Log into Discord** via the bridge (using a bot token or user account)
2. **Bridge rooms** using `!discord bridge` or guild bridging
3. **Set up relay with webhook:**
   ```
   !discord set-relay --create matrix-bridge
   ```
4. **Configure public address** for avatar bridging:
   ```yaml
   bridge:
     public_address: https://your-bridge.example.com
   ```

**How webhook relay looks on Discord:**
- Each relayed message appears with the sender's Matrix display name
- The sender's Matrix avatar is displayed (if `public_address` is configured)
- A small "BOT" badge appears next to the webhook name
- The webhook name changes per message to match the sender

**Limitations of relay mode:**
- Reactions from relayed users are not bridged
- No read receipts for relayed users
- Reply threading may not work correctly for relayed messages
- Media bridging may have reduced quality or format support

#### Relay Bot Telegram Commands

Set these via BotFather `/setcommands`:
```
invite - Invite a Matrix user to the portal room
portal - Create the portal if it does not exist and get join info
id - Get the prefixed ID of the chat
```

---

### 7. Custom Application Service Approach

#### Feasibility Assessment

Building a custom Matrix appservice to solve cross-bridge identity is the most promising path to a true solution. Here is a detailed technical analysis.

#### Architecture Options

**Option A: Intercepting Appservice (Post-hoc)**

An appservice that watches for messages from bridge ghost users and re-sends them as real users.

```
Registration file:
- Namespace: @.*:your\.domain (non-exclusive)
- Receives all room events

Logic:
1. Event arrives from @discord_bob:example.com in bridged room
2. Look up identity map: discord_bob -> @bob:example.com
3. Use double-puppet as_token to send same message as @bob:example.com
4. Redact original ghost message (need power level or ghost cooperation)
5. Telegram bridge sees message from @bob and sends as Bob's Telegram
```

**Problems with Option A:**
- Cannot suppress the original ghost message (appservices are passive observers)
- Race condition: Telegram bridge may process the ghost message before the appservice can redact it
- Duplicate messages in the brief window
- Redaction of the ghost message may also trigger bridge behavior (deletion sync)

**Option B: Modified Bridge (Pre-send Hook)**

Fork the mautrix bridge code to add identity-aware message sending.

```
Modified mautrix-discord flow:
1. Discord message from Bob arrives at the bridge
2. Bridge checks identity map: Bob's Discord ID -> @bob:example.com
3. Instead of sending as @discord_bob:example.com ghost,
   send directly as @bob:example.com using double-puppet as_token
4. Message appears in Matrix from @bob:example.com
5. Telegram bridge recognizes @bob and sends as Bob's Telegram
```

**This is the cleanest approach** but requires:
- Forking mautrix-discord (Go) and/or mautrix-telegram (Python/Go)
- Maintaining the fork against upstream updates
- Building and managing the identity mapping database
- Handling edge cases (user not mapped, user offline, etc.)

**Option C: Proxy Appservice with Event Suppression**

Register the proxy appservice with an exclusive namespace that covers the ghost user namespaces, effectively intercepting events before other bridges see them.

```
Registration:
- Namespace: @discord_.*:your\.domain (exclusive)
- This appservice "owns" the Discord ghost users
- When a Discord ghost sends a message, the proxy intercepts it
- Proxy re-sends as the mapped real user
- Because the namespace is exclusive, the proxy controls what gets emitted
```

**Problems with Option C:**
- Would conflict with the Discord bridge's own exclusive namespace registration
- Cannot have two appservices with overlapping exclusive namespaces
- Would break the Discord bridge's ability to create and manage ghost users

#### The Identity Mapping Challenge

Any custom solution needs a database mapping users across platforms:

```
identity_map:
  - matrix_user: @nick:example.com
    discord_id: "123456789"
    discord_ghost: @discord_nick:example.com
    telegram_id: "987654321"
    telegram_ghost: @telegram_987654321:example.com
  - matrix_user: @alice:example.com
    discord_id: "234567890"
    discord_ghost: @discord_alice:example.com
    telegram_id: "876543210"
    telegram_ghost: @telegram_876543210:example.com
```

This mapping could be populated through:
- Manual admin configuration
- A bot command where users self-identify (`!map discord @discord_me telegram @telegram_me`)
- Parsing bridge database tables (both mautrix-discord and mautrix-telegram store user mappings)

#### Recommended Implementation Path

If pursuing a custom solution, **Option B (Modified Bridge)** is the most viable:

1. **Fork mautrix-discord** (written in Go)
2. **Add a configuration section** for cross-bridge identity mapping:
   ```yaml
   cross_bridge:
     enabled: true
     identity_map_file: /data/identity-map.yaml
     double_puppet_secrets:
       as_token: <token from doublepuppet.yaml>
   ```
3. **In the message handling code**, before creating a ghost user message, check if the sender has a mapped real Matrix user
4. **If mapped**, use the double puppet token to send as the real user
5. **If not mapped**, fall back to normal ghost user behavior
6. **Build a simple admin interface** (Matrix bot commands) for managing the identity map

#### Effort Estimate

- Forking and modifying mautrix-discord: 2-4 weeks for a developer familiar with Go and Matrix
- Identity mapping database and management: 1-2 weeks
- Testing and edge cases: 1-2 weeks
- Ongoing maintenance against upstream: Varies (depends on upstream change velocity)

---

### 8. Recommendations

Ranked by feasibility and practical value:

#### Tier 1: Immediate (No Custom Development)

**1. Use Element/Matrix as Primary Client**
- Send all messages from Element with double puppeting enabled on both bridges
- Messages appear as you on both Discord and Telegram
- Best experience for the primary user
- **Limitation:** Only works for users who have logged into both bridges

**2. Enable Relay Mode with Webhooks**
- Configure mautrix-discord with webhook relay for decent visual attribution
- Configure mautrix-telegram relay bot with display name templates
- Messages from other platforms show sender name but come from a bot
- **Best for:** Community rooms where not everyone will set up puppeting

**3. Configure Discord Webhook Avatars**
- Set `public_address` in the Discord bridge config
- Relayed messages show the sender's Matrix avatar on Discord
- Improves the visual experience significantly

#### Tier 2: Short-term (Moderate Effort)

**4. Deploy Matterbridge Alongside Matrix**
- For rooms where Discord-Telegram relay quality matters most
- Better sender attribution than double-bridging through Matrix
- **Caveat:** Must avoid bridging the same rooms through both systems

**5. Onboard Key Users to Both Bridges**
- For a small group (2-10 people), have everyone:
  - Create a Matrix account on your homeserver
  - Log into both mautrix-discord and mautrix-telegram
  - Enable double puppeting on both
- Their messages will appear as themselves on all platforms
- **This actually achieves the "superbridge" goal** for the logged-in users

#### Tier 3: Long-term (Significant Development)

**6. Fork mautrix-discord with Cross-Bridge Identity Mapping**
- Modify the bridge to check an identity map before creating ghost messages
- Use double puppet tokens to send as mapped real users
- Most promising path to a true universal solution
- **Effort:** 4-8 weeks of development

**7. Build a Dedicated "Superbridge" Appservice**
- A purpose-built appservice that manages cross-bridge identity
- Coordinates between multiple mautrix bridges
- Provides user self-service for identity linking
- **Effort:** 2-3 months of development

#### Not Recommended

- **Sharing double puppet tokens between bridges** -- This is not how the system works. The double puppet token allows a bridge to act as any user, but it does not help Bridge A recognize Bridge B's ghost users.
- **Modifying the Matrix spec** -- While MSC3647 (Bring Your Own Bridge) touches on related concepts, a cross-bridge identity spec change would take years to design, implement, and adopt.
- **Using the Matrix Identity Service** -- The IS maps 3PIDs (email, phone) to Matrix IDs, not cross-platform chat identities. It could theoretically be extended, but this is not its purpose.

---

### 9. Sources

#### Official Documentation
- [mautrix Double Puppeting Documentation](https://docs.mau.fi/bridges/general/double-puppeting.html)
- [mautrix Relay Mode Documentation](https://docs.mau.fi/bridges/general/relay-mode.html)
- [mautrix Discord Relay (Webhooks)](https://docs.mau.fi/bridges/go/discord/relay.html)
- [mautrix Telegram Relay Bot](https://docs.mau.fi/bridges/python/telegram/relay-bot.html)
- [mautrix Bridge Registration](https://docs.mau.fi/bridges/general/registering-appservices.html)
- [Matrix Application Service API Specification](https://spec.matrix.org/latest/application-service-api/)
- [Matrix Types of Bridging](https://matrix.org/docs/older/types-of-bridging/)
- [Matrix Application Services Overview](https://matrix.org/docs/older/application-services/)

#### Bridge Repositories
- [mautrix-discord](https://github.com/mautrix/discord)
- [mautrix-telegram](https://github.com/mautrix/telegram)
- [matrix-appservice-bridge (infrastructure library)](https://github.com/matrix-org/matrix-appservice-bridge)
- [matrix-puppet-bridge](https://github.com/matrix-hacks/matrix-puppet-bridge)
- [mx-puppet-bridge](https://github.com/Sorunome/mx-puppet-bridge)

#### Alternative Bridging Tools
- [Matterbridge (42wim)](https://github.com/42wim/matterbridge)
- [Matterbridge (community fork)](https://github.com/matterbridge-org/matterbridge)
- [TediCross (Discord-Telegram direct bridge)](https://github.com/TediCross/TediCross)
- [Matterbridge Settings Wiki](https://github.com/42wim/matterbridge/wiki/Settings)

#### Beeper / Automattic
- [Beeper Developer Docs - Bridges](https://developers.beeper.com/bridges)
- [Beeper Self-Hosting Documentation](https://developers.beeper.com/bridges/self-hosting)
- [How Beeper Android Works (Blog)](https://blog.beeper.com/2024/04/09/how-beeper-android-works/)
- [The New Beeper (July 2025 Relaunch)](https://blog.beeper.com/2025/07/16/the-new-beeper/)
- [Beeper Bridge Manager](https://github.com/beeper/bridge-manager)

#### Matrix Spec Proposals
- [MSC3647: Bring Your Own Bridge](https://github.com/matrix-org/matrix-spec-proposals/pull/3647)
- [Matrix Spec Change Proposals](https://spec.matrix.org/proposals/)
- [Proposal #220: Public/Private Keypair Identity](https://github.com/matrix-org/matrix-spec/issues/220)

#### Community Resources
- [matrix-docker-ansible-deploy](https://github.com/spantaleev/matrix-docker-ansible-deploy)
- [Matterbridge Deep Dive (Blog)](https://www.blog.brightcoding.dev/2025/09/02/bridging-messages-across-chat-apps-a-deep-dive-into-matterbridge/)
- [Wikimedia Bridgebot (Matterbridge deployment)](https://wikitech.wikimedia.org/wiki/Tool:Bridgebot)
- [Self-hosted Matrix + Bridges Guide (ssine.ink)](https://ssine.ink/en/posts/matrix-bot-and-bridges/)

---

## Superbridge Test Results (2026-02-04)

### Setup

> **Note:** These tests were performed on a local development environment (Lima VM on macOS).
> At the time of writing, production ran on a GCE VPS at `35-201-14-61.sslip.io`; that host
> has since been retired. Production now runs Continuwuity on an OCI instance
> (`149.118.69.221`, server name `imagineering.cc`) — see `CLAUDE.md` for current host facts.

- **Matrix homeserver**: Synapse via matrix-docker-ansible-deploy (local dev: Lima VM on macOS; production at the time: GCE VPS — since migrated to Continuwuity on OCI)
- **Discord bridge**: mautrix-discord v0.7.2 with double puppeting
- **Telegram bridge**: mautrix-telegram v0.15.3 with double puppeting
- **Test room**: Discord `#general` (enspyrco server) bridged to Telegram "Superbridge test" group

### Configuration Steps

1. Bridged Discord server "enspyrco" via `@discordbot:local` DM (`servers` -> `bridge enspyrco`)
2. Created Telegram group "Superbridge test" and synced via `@telegrambot:local` (`sync chats`)
3. Found Telegram chat ID from database: `SELECT tgid, title FROM portal;` -> `5229100313`
4. Invited `@telegrambot:local` to the Discord `#general` portal room (it was already present)
5. Ran `!tg bridge -5229100313` in the Discord portal room
6. Hit "permission denied" -- used Synapse admin API `make_room_admin` to promote user
7. Telegram group was already bridged to its own portal -- used `!tg unbridge-and-continue`
8. Enabled Discord webhook relay: `!discord set-relay --create`

### Key Issues Encountered

| Problem | Cause | Fix |
|---------|-------|-----|
| Telegram bridge kicked Discord bot from portal room | No relay bot configured; Telegram bridge removes non-Telegram users | Bridge from Discord portal room instead -- invite Telegram bot there |
| `!tg bridge 5229100313` rejected | Chat ID needed `-` prefix for regular groups | Use `!tg bridge -5229100313` |
| "You do not have permissions to bridge this room" | Discord bot was room admin, user had power level 0 | `POST /_synapse/admin/v1/rooms/<room_id>/make_room_admin` |
| "That Telegram chat already has a portal" | Telegram group was bridged to its own portal room | `!tg unbridge-and-continue` |
| Angie's Telegram message didn't appear in Discord | No Discord relay webhook configured | `!discord set-relay --create` |

### Test Results

| Scenario | Result | How It Appears |
|----------|--------|----------------|
| Logged-in user sends from Discord | Message appears in Telegram as their real Telegram account | Indistinguishable from native Telegram message |
| Logged-in user sends from Telegram | Message appears in Discord as their real Discord account | Indistinguishable from native Discord message |
| Logged-in user sends from Element | Message appears on both platforms as their real accounts | Full double puppeting both directions |
| Telegram-only user sends from Telegram | Message appears in Discord via webhook with name | Shows name, avatar (if set), "BOT" tag |
| Discord-only user sends from Discord | Pending test -- awaiting friend's message | Expected: ghost puppet in Telegram (needs relay bot) |

### Conclusion

**The superbridge works for the primary use case.** A user logged into both bridges gets true cross-platform identity with zero custom development. For single-platform users, Discord webhook relay provides reasonable attribution. Telegram-side relay for Discord-only users still needs a relay bot (BotFather token) to be configured.
