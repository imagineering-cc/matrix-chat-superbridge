# How the Superbridge Works

This document explains the core concepts behind the Matrix Chat Superbridge: how Matrix works, what mautrix bridges do, and the different types of puppeting.

## Table of Contents

- [Matrix Overview](#matrix-overview)
- [Mautrix Bridges](#mautrix-bridges)
- [Puppeting Explained](#puppeting-explained)
  - [Ghost Puppets](#ghost-puppets)
  - [Double Puppeting](#double-puppeting)
  - [Relay Mode](#relay-mode)
- [How the Superbridge Connects Everything](#how-the-superbridge-connects-everything)

---

## Matrix Overview

**Matrix** is an open protocol for decentralized, real-time communication. Think of it like email but for instant messaging -- anyone can run their own server, and servers can talk to each other.

### Key Concepts

| Term | Definition |
|------|------------|
| **Homeserver** | A Matrix server that stores your account and messages. Ours is Synapse. |
| **User ID** | Your Matrix identity, like `@angie:imagineering.cc` |
| **Room** | A chat space (like a Discord channel or Telegram group). Rooms have IDs like `!abc123:server.com` |
| **Event** | Everything in Matrix is an event: messages, reactions, edits, membership changes |
| **Client** | The app you use to access Matrix (Element, FluffyChat, etc.) |

### Why Matrix for Bridging?

Matrix is designed to be a **universal communication layer**. Its architecture makes it ideal for bridging:

1. **Room-based**: Rooms are first-class citizens, making it easy to map Discord channels or Telegram groups
2. **User identity**: Matrix has strong user identity, allowing bridges to create "puppet" accounts
3. **Event-based**: The event model can represent messages, edits, reactions, and more from any platform
4. **Extensible**: Custom event types can store platform-specific data (like Discord embeds)

---

## Mautrix Bridges

**Mautrix** is a family of Matrix bridges created by Tulir. We use:

- **mautrix-discord** -- bridges Discord servers and DMs to Matrix
- **mautrix-telegram** -- bridges Telegram chats and groups to Matrix

### How a Bridge Works

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Discord   │◄────►│   mautrix-   │◄────►│   Matrix    │
│   Server    │      │   discord    │      │  Homeserver │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     Bridge Database
                     (portal mappings,
                      user logins)
```

The bridge:
1. **Connects to both platforms** (logs into Discord, connects to Matrix as an appservice)
2. **Creates portal rooms** on Matrix that mirror Discord channels
3. **Syncs messages** bidirectionally between the platforms
4. **Creates ghost users** on Matrix to represent Discord users

### Bridge Bot vs Bridge Users

| Entity | What It Is |
|--------|------------|
| **Bridge Bot** | The main bot account (e.g., `@discordbot:server`). Handles commands, creates rooms. |
| **Ghost Users** | Fake Matrix accounts representing external users (e.g., `@discord_123456:server` for a Discord user) |
| **Logged-in Users** | Real users who've authenticated with the bridge to enable puppeting |

---

## Puppeting Explained

**Puppeting** is how bridges make messages appear to come from the right person. There are several types:

### Ghost Puppets

The simplest form. When a Discord user sends a message:

1. The bridge receives the message from Discord
2. It creates (or reuses) a **ghost user** on Matrix with that person's name and avatar
3. The ghost user posts the message to the Matrix room

**Result**: Matrix users see the message "from" that Discord user, but it's actually a fake account controlled by the bridge.

```
Discord User "Alice" ──► Bridge ──► Ghost @discord_alice:server posts in Matrix
```

**Limitations**:
- The ghost isn't a real Matrix account
- On other platforms (via relay), messages appear from a webhook/bot, not the real user

### Double Puppeting

This is the magic that makes bridges seamless. When a user:

1. **Logs into both** their Matrix account AND the bridge (e.g., links their Discord)
2. The bridge gains the ability to **post as them** on Matrix

Now when they send a message from Discord:
- Instead of a ghost posting, **their real Matrix account** posts
- Other bridges see the message coming from their real account
- This enables proper cross-platform identity

```
┌─────────────────────────────────────────────────────────────────┐
│                    WITH DOUBLE PUPPETING                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Discord ──► mautrix-discord ──► Posts as @angie:server        │
│                                         │                       │
│                                         ▼                       │
│                               mautrix-telegram sees @angie      │
│                                         │                       │
│                                         ▼                       │
│                               Posts as Angie's Telegram account │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**How it works technically**:

1. User logs into the bridge with their Matrix credentials (or the server uses appservice double puppeting)
2. The bridge stores their Matrix access token
3. When they send a message from the external platform, the bridge uses their token to post as them

**Requirements**:
- User must be logged into both the bridge AND Matrix
- The homeserver must allow the bridge to act on behalf of users

### Relay Mode

For users who **haven't** logged into all bridges, we use relay mode as a fallback.

**Discord relay (webhooks)**:
- When a Matrix or Telegram user sends a message to a Discord-bridged room
- If they're not logged into Discord, the bridge uses a **webhook** to post
- The message appears with their name/avatar but comes from "Webhook" not their Discord account

```
!discord set-relay --create
```

**Telegram relay**:
- Similar concept but using the Telegram bot to relay messages
- Non-Telegram users' messages appear as: `Angie (Matrix): Hello!`

### Comparison Table

| Scenario | What Happens | Quality |
|----------|--------------|---------|
| User logged into both bridges | Message appears as them on both platforms | Best |
| User logged into one bridge | Ghost puppet on Matrix, webhook/relay on other platform | Good |
| User not logged into any bridge | Can't participate (bridges require login) | N/A |
| Relay mode enabled | Non-authenticated users can still communicate via bot/webhook | Acceptable |

---

## How the Superbridge Connects Everything

The "superbridge" is our configuration that chains bridges together:

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Discord    │◄───►│                 │◄───►│   Telegram   │
│   Channel    │     │   Matrix Room   │     │    Group     │
└──────────────┘     │   (the hub)     │     └──────────────┘
        ▲            │                 │            ▲
        │            └─────────────────┘            │
        │                    ▲                      │
        │                    │                      │
        └────────────────────┼──────────────────────┘
                             │
                        Matrix User
                       (via Element)
```

### Message Flow Examples

**Discord user sends "Hello"**:
1. mautrix-discord receives message
2. If user has double puppeting: posts as their Matrix account
3. If not: ghost puppet posts
4. mautrix-telegram sees the Matrix message
5. If receiver has Telegram double puppet: appears as their TG account
6. If not: appears via relay with their name

**Telegram user sends "Hi"**:
1. mautrix-telegram receives message
2. Posts to Matrix (double puppet or ghost)
3. mautrix-discord sees the Matrix message
4. Posts to Discord (double puppet or webhook relay)

**Matrix user sends "Hey"**:
1. Message goes to Matrix room
2. Both bridges see it
3. mautrix-discord: double puppet → appears as Discord account
4. mautrix-telegram: double puppet → appears as Telegram account

### For Best Experience

Users should:
1. **Log into Element** (Matrix client)
2. **Log into mautrix-discord** via `@discordbot` DM → `login-qr`
3. **Log into mautrix-telegram** via `@telegrambot` DM → `login`

With all three authenticated, messages seamlessly appear as you on every platform.

---

## Summary

| Concept | What It Does |
|---------|--------------|
| **Matrix** | Decentralized messaging protocol that acts as the hub |
| **Synapse** | Our Matrix homeserver implementation |
| **mautrix** | Bridge software connecting external platforms to Matrix |
| **Ghost puppet** | Fake Matrix account representing an external user |
| **Double puppeting** | Bridge posts as your real account (requires login) |
| **Relay mode** | Fallback for non-authenticated users (webhooks/bots) |
| **Superbridge** | Our setup chaining Discord ↔ Matrix ↔ Telegram |
