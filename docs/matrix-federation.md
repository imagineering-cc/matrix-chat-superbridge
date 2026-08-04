# Matrix Federation

This document explains how Matrix federation works -- the system that allows different Matrix servers to communicate with each other.

## Table of Contents

- [What is Federation?](#what-is-federation)
- [How Federation Works](#how-federation-works)
- [Federation vs Our Superbridge](#federation-vs-our-superbridge)
- [Federation Architecture](#federation-architecture)
- [Common Federation Scenarios](#common-federation-scenarios)
- [Why We Don't Use Public Federation](#why-we-dont-use-public-federation)

---

## What is Federation?

**Federation** is the ability for independent servers to communicate with each other as peers. It's the same model that email uses:

- Gmail can send to Outlook
- Outlook can send to ProtonMail
- Each provider runs their own server, but they all speak the same protocol

Matrix federation works the same way:

```
┌─────────────────┐         ┌─────────────────┐
│  matrix.org     │◄───────►│  example.com    │
│  (Server A)     │  HTTPS  │  (Server B)     │
│                 │         │                 │
│  @alice:matrix  │         │  @bob:example   │
│     .org        │         │     .com        │
└─────────────────┘         └─────────────────┘
```

When Alice (`@alice:matrix.org`) joins a room with Bob (`@bob:example.com`):
- Both servers have a copy of the room
- Messages sync between servers automatically
- Each server stores messages for its own users

---

## How Federation Works

### Server Discovery

When servers need to communicate, they first need to find each other:

1. **Well-known file**: Servers check `https://example.com/.well-known/matrix/server`
2. **SRV records**: DNS SRV records can point to the actual Matrix server
3. **Direct connection**: If nothing else, try connecting to port 8448

### The Federation API

Matrix servers communicate over HTTPS using the **Server-Server API** (also called the Federation API):

| Endpoint | Purpose |
|----------|---------|
| `/_matrix/federation/v1/send/{txnId}` | Send events (messages) to another server |
| `/_matrix/federation/v1/event/{eventId}` | Request a specific event |
| `/_matrix/federation/v1/state/{roomId}` | Get room state |
| `/_matrix/federation/v1/backfill/{roomId}` | Get historical messages |
| `/_matrix/key/v2/server` | Get server's signing keys |

### Event Signing

Every event in Matrix is **cryptographically signed** by the originating server:

```json
{
  "type": "m.room.message",
  "sender": "@alice:matrix.org",
  "content": {
    "body": "Hello!",
    "msgtype": "m.text"
  },
  "signatures": {
    "matrix.org": {
      "ed25519:auto": "signature_here..."
    }
  }
}
```

This ensures:
- Events can't be forged
- Servers can verify who sent what
- History is tamper-evident

### State Resolution

When servers disagree about room state (e.g., two admins kicked each other simultaneously), Matrix uses **state resolution** algorithms to deterministically pick a winner. This ensures all servers eventually converge to the same state.

---

## Federation vs Our Superbridge

**Important**: Our superbridge does **not** use public federation. Here's the difference:

### Public Federation (What We Don't Do)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  matrix.org  │◄───►│  Our Server  │◄───►│ mozilla.org  │
│              │     │              │     │              │
│  Anyone can  │     │              │     │  Anyone can  │
│  join rooms  │     │              │     │  join rooms  │
└──────────────┘     └──────────────┘     └──────────────┘
```

- Anyone on the internet can discover your server
- Users from other servers can join your rooms
- Your server participates in the global Matrix network

### Our Approach (Single-Server Bridging)

```
┌──────────────┐     ┌──────────────────────────────────┐
│   Discord    │◄───►│         Our Server               │
│              │     │  ┌────────────────────────────┐  │
│              │     │  │  Matrix + Bridges          │  │
│              │     │  │  (all internal)            │  │
└──────────────┘     │  └────────────────────────────┘  │
                     │                                  │◄───► Telegram
┌──────────────┐     │  Users connect directly to      │
│   Element    │◄───►│  our single server              │
│   (client)   │     └──────────────────────────────────┘
└──────────────┘
```

- **No external federation**: Our server doesn't talk to other Matrix servers
- **Bridges are internal**: mautrix bridges run on the same server
- **Controlled access**: Only users we create can participate

### Why This Matters

| Aspect | Public Federation | Our Setup |
|--------|-------------------|-----------|
| **Privacy** | Events shared with external servers | Everything stays on our server |
| **Control** | Anyone can join public rooms | Only our users can access |
| **Complexity** | Must handle federation edge cases | Simpler single-server setup |
| **SSL** | Needs valid public certificates | Works with self-signed certs |
| **DNS** | Needs proper DNS and well-known setup | Just local/IP-based access |

---

## Federation Architecture

For educational purposes, here's how public federation would work:

### Room Distribution

When a room has members from multiple servers, the room is **distributed**:

```
Room: #chat:server-a.com

┌─────────────────────────────────────────────────────────────┐
│                     Distributed Room                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Server A    │    │  Server B    │    │  Server C    │  │
│  │              │    │              │    │              │  │
│  │  @alice:A    │    │  @bob:B      │    │  @carol:C    │  │
│  │  (original)  │    │  (joined)    │    │  (joined)    │  │
│  │              │    │              │    │              │
│  │  Full copy   │    │  Full copy   │    │  Full copy   │  │
│  │  of room     │    │  of room     │    │  of room     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         ▲                   ▲                   ▲           │
│         └───────────────────┼───────────────────┘           │
│                             │                               │
│              All servers sync events in real-time           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Event Flow

When Alice sends a message:

1. Alice's client sends the event to Server A
2. Server A validates and signs the event
3. Server A forwards to Server B and Server C
4. Each server validates the signature
5. Each server stores the event
6. Each server notifies its local clients

```
Alice ──► Server A ──┬──► Server B ──► Bob
                     │
                     └──► Server C ──► Carol
```

### Joining a Federated Room

When Bob (`@bob:server-b.com`) joins a room on Server A:

1. Bob's client requests to join via Server B
2. Server B sends a `make_join` request to Server A
3. Server A returns a join event template
4. Server B signs it and sends `send_join` to Server A
5. Server A accepts and returns current room state
6. Server B now has a copy of the room
7. Future events are sent to Server B

---

## Common Federation Scenarios

### Scenario 1: Sending a Message

```
┌─────────┐   1. Send    ┌──────────┐   3. Forward   ┌──────────┐
│ Client  │─────────────►│ Home     │───────────────►│ Remote   │
│         │              │ Server   │                │ Server   │
└─────────┘              └──────────┘                └──────────┘
                              │                           │
                         2. Store                    4. Store
                         & Sign                      & Deliver
                              │                           │
                              ▼                           ▼
                         Local DB                    Remote DB
```

### Scenario 2: Fetching History

When a user joins an existing room:

```
┌─────────┐   1. Join    ┌──────────┐   2. Backfill  ┌──────────┐
│ New     │─────────────►│ User's   │───────────────►│ Origin   │
│ User    │              │ Server   │                │ Server   │
└─────────┘              └──────────┘                └──────────┘
     ▲                        │                           │
     │                        │◄──────────────────────────┘
     │                        │     3. Historical events
     │                        │
     └────────────────────────┘
           4. Sync to client
```

### Scenario 3: Server Goes Offline

Federation handles servers going offline:

```
Normal:     A ◄──► B ◄──► C    (all synced)

B offline:  A ◄─────────► C    (A and C still communicate)

B returns:  A ◄──► B ◄──► C    (B catches up via backfill)
```

---

## Why We Don't Use Public Federation

Our superbridge intentionally avoids public federation for several reasons:

### 1. Simplicity

- No need to configure proper DNS
- No need for valid SSL certificates
- No complex federation debugging

### 2. Privacy

- Messages never leave our server
- No external servers see our traffic
- Complete control over data

### 3. Purpose

Our goal is bridging platforms, not joining the Matrix network:

```
Traditional Matrix:
User A (Server 1) ◄──Federation──► User B (Server 2)

Our Superbridge:
Discord User ◄──Bridge──► Matrix (Our Server) ◄──Bridge──► Telegram User
```

### 4. Self-Signed Certificates

Federation requires servers to trust each other's certificates. Public federation needs valid CA-signed certificates. Our internal setup works fine with self-signed.

---

## Enabling Federation (If You Wanted To)

If you ever wanted to enable public federation, you would need:

1. **Valid domain name** (not IP-based)
2. **Valid SSL certificate** (Let's Encrypt works)
3. **Proper DNS configuration**:
   ```
   _matrix._tcp.example.com. 3600 IN SRV 10 5 443 matrix.example.com.
   ```
4. **Well-known files** at your base domain:
   ```
   https://example.com/.well-known/matrix/server
   https://example.com/.well-known/matrix/client
   ```
5. **Open port 8448** for federation traffic
6. **Configuration changes** in Synapse

But for our bridging use case, none of this is necessary.

---

## Summary

| Concept | Description |
|---------|-------------|
| **Federation** | Servers communicating as peers over HTTPS |
| **Server-Server API** | The protocol servers use to exchange events |
| **Event signing** | Cryptographic signatures ensure authenticity |
| **State resolution** | Algorithms to handle conflicting state |
| **Our approach** | Single server, no federation, bridges only |

**Key takeaway**: Matrix federation is powerful for building a decentralized network, but our superbridge uses Matrix as an internal hub without participating in public federation. This keeps things simple and private while still enabling cross-platform communication through bridges.
