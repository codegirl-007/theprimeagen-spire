# Cloudflare Co-op Multiplayer Tutorial

This guide explains how to turn this single-player browser game into a 2-player co-op game on Cloudflare.

It is written for this codebase specifically.

## Goal

Build a version where:

- the frontend is hosted on Cloudflare Pages
- two players can join the same room
- the room has authoritative game state
- both players see the same map, battle, rewards, and progression
- reconnects work
- cheating and desync are reduced by moving authority off the client

## What exists today

The current game is a static browser app:

- `index.html` loads `src/main.js`
- `src/app/bootstrap.js` creates a game root and registers states
- `src/app/createGameRoot.js` stores all game state in a single mutable `root`
- `src/engine/battle.js` runs battle logic entirely in the browser
- `src/app/persistence.js` saves to `localStorage`

That means the browser currently owns:

- player state
- map progression
- battle simulation
- RNG
- screen transitions
- save/load

For multiplayer, that must change.

## Recommended Cloudflare architecture

Use these pieces:

### 1. Cloudflare Pages

Use Pages to host the current frontend assets:

- `index.html`
- `style.css`
- `styles/*`
- `src/*`
- `assets/*`

This repo is already a good fit for Pages because it is static.

### 2. Cloudflare Worker

Use a Worker for HTTP APIs such as:

- create room
- join room
- create guest session
- fetch room bootstrap data

The Worker should not be the main authoritative game loop.

### 2a. Worker setup for beginners

If you are new to Cloudflare infra, think of a Worker as a small serverless JavaScript app that runs on Cloudflare's edge.

For this project, the Worker will sit in front of your Durable Objects and handle things like:

- creating rooms
- joining rooms
- creating guest identities
- handing back websocket connection info

### 2b. Prerequisites

You will need:

- a Cloudflare account
- Node.js installed locally
- npm available locally

Then install Wrangler, which is Cloudflare's CLI:

```bash
npm install -D wrangler
```

You can also use `npx wrangler ...` without installing it globally.

Next, log into Cloudflare from your terminal:

```bash
npx wrangler login
```

That will open a browser and connect the CLI to your Cloudflare account.

### 2c. How to organize the repo

You have two reasonable options.

#### Option 1: Keep the Worker inside this repo

Example structure:

```text
src/
  worker/
    index.js
    rooms/
      RoomDurableObject.js
```

Pros:

- one repo
- easy to share game logic between client and worker

Cons:

- you need to be careful about browser-only imports leaking into the worker

#### Option 2: Put the Worker in a sibling folder

Example:

```text
theprimeagen-spire/
  index.html
  src/
  assets/
  cloudflare-worker/
    src/
      index.js
      RoomDurableObject.js
    wrangler.toml
```

Pros:

- cleaner separation at the start
- easier to learn because the Worker is isolated

Cons:

- shared game logic will need a clearer import boundary later

If you are new to this, Option 2 is often easier to reason about first.

### 2d. Create a basic Worker project

From your repo root, create a Worker project:

```bash
npx wrangler init cloudflare-worker
```

Wrangler will ask a few questions.

For a simple setup, choose:

- create a Worker project
- JavaScript or TypeScript
- no framework

If you choose TypeScript, that is fine too. This tutorial uses JavaScript examples to match the current repo.

After that, you will have a new folder with something like:

```text
cloudflare-worker/
  src/
    index.js
  package.json
  wrangler.toml
```

### 2e. Minimal Worker code

Your first Worker can be extremely small.

Example `cloudflare-worker/src/index.js`:

```js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, service: "birthday-spire-worker" });
    }

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      return Response.json({ ok: true, message: "create room endpoint placeholder" });
    }

    return new Response("Not found", { status: 404 });
  }
};
```

That is enough to learn the basic request flow before adding Durable Objects.

### 2f. Minimal Wrangler config

Your `wrangler.toml` tells Cloudflare how to run and deploy the Worker.

Example:

```toml
name = "birthday-spire-worker"
main = "src/index.js"
compatibility_date = "2026-03-07"
workers_dev = true
```

What these mean:

- `name`: Worker name in Cloudflare
- `main`: entry file
- `compatibility_date`: locks runtime behavior to a known date
- `workers_dev = true`: gives you a `*.workers.dev` URL for quick testing

### 2g. Run the Worker locally

From the Worker folder:

```bash
npx wrangler dev
```

Wrangler will start a local development server.

You can then test it with:

```bash
curl http://127.0.0.1:8787/api/health
```

You should get JSON back.

This is the fastest way to learn the loop:

- edit file
- run `wrangler dev`
- hit endpoint
- inspect response

### 2h. Deploy the first Worker

When local dev works, deploy it:

```bash
npx wrangler deploy
```

Wrangler will print the deployed URL, usually something like:

```text
https://birthday-spire-worker.<your-subdomain>.workers.dev
```

Now your frontend can call that URL.

### 2i. Add your first real route

For this project, a good first real route is room creation.

Example shape:

```js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      const roomId = crypto.randomUUID();
      const playerId = crypto.randomUUID();

      return Response.json({
        roomId,
        playerId,
        message: "Room creation not wired to Durable Objects yet"
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
```

This still is not multiplayer yet, but it gives you a real API contract to build around.

### 2j. Add a Durable Object binding

Once the plain Worker works, add a Durable Object binding in `wrangler.toml`.

Example:

```toml
name = "birthday-spire-worker"
main = "src/index.js"
compatibility_date = "2026-03-07"

[[durable_objects.bindings]]
name = "ROOMS"
class_name = "RoomDurableObject"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["RoomDurableObject"]
```

This tells Cloudflare:

- create a Durable Object namespace named `ROOMS`
- the class implementation is `RoomDurableObject`
- create the storage migration for that class

### 2k. Minimal Durable Object class

Example `cloudflare-worker/src/RoomDurableObject.js`:

```js
export class RoomDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/init" && request.method === "POST") {
      const room = {
        roomId: this.state.id.toString(),
        version: 1,
        players: {},
        phase: "LOBBY"
      };

      await this.state.storage.put("room", room);
      return Response.json(room);
    }

    if (url.pathname === "/state") {
      const room = await this.state.storage.get("room");
      return Response.json(room || { error: "room not initialized" });
    }

    return new Response("Not found", { status: 404 });
  }
}
```

Then update `cloudflare-worker/src/index.js`:

```js
import { RoomDurableObject } from "./RoomDurableObject.js";

export { RoomDurableObject };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      const roomId = crypto.randomUUID();
      const doId = env.ROOMS.idFromName(roomId);
      const stub = env.ROOMS.get(doId);

      await stub.fetch("https://room/init", { method: "POST" });

      return Response.json({ roomId });
    }

    return new Response("Not found", { status: 404 });
  }
};
```

Important idea:

- the Worker receives the public API request
- the Worker looks up the room Durable Object
- the Worker forwards setup or command requests to that room
- the room Durable Object owns the room state

### 2l. Local development with Durable Objects

Run local dev the same way:

```bash
npx wrangler dev
```

Wrangler emulates Durable Objects locally.

Now test room creation:

```bash
curl -X POST http://127.0.0.1:8787/api/rooms
```

Then you can add a debug route like `/state` for local inspection while learning.

### 2m. How the frontend talks to the Worker

Your static frontend on Pages should call the Worker API with `fetch()`.

Example:

```js
const response = await fetch("https://your-worker.workers.dev/api/rooms", {
  method: "POST"
});

const data = await response.json();
```

Later, once Pages and Worker are both on Cloudflare, you can put them behind the same domain so the frontend calls relative URLs like:

```js
fetch("/api/rooms", { method: "POST" })
```

That is a nicer final setup, but it is not required on day one.

### 2n. Common beginner mistakes

Watch out for these:

- putting all game state in the plain Worker instead of a Durable Object
- forgetting to export the Durable Object class from `src/index.js`
- forgetting the `[[migrations]]` block in `wrangler.toml`
- trying to use browser-only APIs inside the Worker
- mixing client render logic into server code too early
- trying to build WebSockets before basic HTTP room creation works

Good learning path:

1. health endpoint
2. create room endpoint
3. Durable Object room init endpoint
4. room state fetch endpoint
5. join room endpoint
6. websocket connect

### 2o. Local-only development workflow

Yes, you can build almost all of this locally before touching a real Cloudflare deployment.

For most early multiplayer work, local development is the right way to go.

You can test:

- Worker routes
- Durable Object room state
- websocket connections
- room creation and join flow
- command handling
- snapshot broadcasting
- reconnect logic

### 2p. What tools you use locally

For a local setup, you usually run two things:

1. a static server for the frontend
2. `wrangler dev` for the Worker and Durable Objects

The frontend can be served by any simple static server.

Examples:

```bash
python3 -m http.server 8080
```

or:

```bash
npx serve .
```

Then run the Worker locally from the Worker folder:

```bash
npx wrangler dev
```

That usually starts the Worker on:

```text
http://127.0.0.1:8787
```

### 2q. Example local dev loop

A very common local loop would be:

Terminal 1:

```bash
python3 -m http.server 8080
```

Terminal 2:

```bash
cd cloudflare-worker
npx wrangler dev
```

Then open the app in your browser at:

```text
http://127.0.0.1:8080
```

And have the frontend call the local Worker at:

```text
http://127.0.0.1:8787
```

### 2r. How the frontend points to local APIs

At first, hardcoding a local API base is fine.

Example:

```js
const API_BASE = "http://127.0.0.1:8787";

const response = await fetch(`${API_BASE}/api/rooms`, {
  method: "POST"
});
```

Later, you can make this configurable with:

- a small config file
- a query param
- a global `window.APP_CONFIG`
- environment-specific build wiring if you eventually add a bundler

For now, do the simplest thing that helps you test room creation locally.

### 2s. Local Durable Objects

`wrangler dev` can emulate Durable Objects on your machine.

That means you can test code like this locally:

```js
const doId = env.ROOMS.idFromName(roomId);
const stub = env.ROOMS.get(doId);
await stub.fetch("https://room/init", { method: "POST" });
```

You do not need to deploy to Cloudflare just to see whether room creation, room storage, or command flow works.

This is one of the nicest parts of the Worker development model.

### 2t. Local WebSocket testing

You can also test WebSockets locally through `wrangler dev`.

That means you can build the room flow in stages:

1. local HTTP create-room works
2. local HTTP join-room works
3. local room snapshot fetch works
4. local WebSocket connect works
5. local command broadcast works

That is enough to build most of your multiplayer foundation before the first real deploy.

### 2u. What local dev does not perfectly simulate

Local dev is excellent, but it is not identical to production Cloudflare.

You should still do real Cloudflare testing later for:

- actual edge latency
- your production domain setup
- cookies/auth behavior under the real domain
- deployment-time reconnect behavior
- production config mistakes
- actual usage limits and billing behavior

But those are later-stage concerns. Early implementation should be local-first.

### 2v. Best local-first build order

If you are new, I recommend this exact order:

1. local Worker health route
2. local create-room route
3. local Durable Object room init
4. local room state fetch
5. local join-room route
6. local frontend button that calls create-room
7. local WebSocket room connect
8. local one-command test like `end_turn`

If all of that works locally, you will be in a strong place before touching production.

### 2w. Nice beginner workflow tip

Do not start by wiring the whole game.

Make a tiny local test page first that can:

- create a room
- join a room
- fetch room state
- open a socket
- send one test command

Once that works, plug the real game UI into the same backend.

That separates Cloudflare-learning problems from game-refactor problems.

### 3. Durable Objects

Yes: this tutorial does cover Durable Objects, but since you are new to Cloudflare, here is the simple mental model.

### 3a. What a Durable Object is

A Durable Object is like a tiny stateful server that Cloudflare manages for you.

Normal Workers are great for stateless request handling.

Durable Objects are for when you need one place to own shared mutable state.

For your game, one room should map to one Durable Object.

That means the room Durable Object becomes the single authority for:

- who is in the room
- whose turn it is
- what cards are in each player's hand
- what the current enemy state is
- what reward choices exist
- what version of the room state clients should be on

### 3b. Why Durable Objects are a good fit here

The key problem in multiplayer is avoiding conflicts and desyncs.

Example:

- player 1 clicks `play card`
- player 2 clicks `end turn`
- both actions arrive close together

If you let many different systems update the room independently, state gets messy fast.

Durable Objects help because each room is handled in one place, in order.

That makes them a strong fit for:

- turn-based games
- lobbies
- chat rooms
- collaborative sessions
- shared counters or workflow state

### 3c. Beginner mental model

Use this model:

- Pages serves the website
- Worker handles public API requests
- Durable Object owns one room

So when a player creates a room:

1. frontend calls Worker
2. Worker picks or creates a room Durable Object
3. Worker asks that room to initialize state
4. room stores state in Durable Object storage
5. Worker returns room info to the frontend

When a player plays a card:

1. frontend sends a command to the room
2. room validates it
3. room updates authoritative state
4. room broadcasts the updated state to both players

### 3d. Durable Object identity

Each Durable Object instance has an id.

You usually create or look one up with code like this:

```js
const doId = env.ROOMS.idFromName(roomId);
const stub = env.ROOMS.get(doId);
```

What this means:

- `ROOMS` is your Durable Object namespace binding
- `idFromName(roomId)` gives a stable object id for that room name
- `get(doId)` gives you a stub you can call

The important part is that using the same room name gives you the same room object.

That is how both players end up talking to the same room authority.

### 3e. Durable Object storage

Each Durable Object has its own storage.

For beginners, think of it as private storage attached to that room.

Example:

```js
await this.state.storage.put("room", roomState);
const roomState = await this.state.storage.get("room");
```

For your game, that storage can hold:

- room snapshot
- room version
- player list
- ready states
- recent action log
- reconnect metadata

This is much better than `localStorage` for multiplayer because it is shared authority, not browser-local authority.

### 3f. Durable Object request flow

At first, you can treat a Durable Object like a mini HTTP server.

Example flow:

```js
const doId = env.ROOMS.idFromName(roomId);
const stub = env.ROOMS.get(doId);
const response = await stub.fetch("https://room/init", { method: "POST" });
```

That call goes into the Durable Object's `fetch()` method.

So inside the Durable Object you can route paths like:

- `/init`
- `/join`
- `/state`
- `/command`

This is a very approachable way to start before adding WebSockets.

### 3g. Why not keep everything in the Worker?

Because a plain Worker is not the right place for long-lived room authority.

Workers are stateless by default.

If you try to keep room state in plain Worker memory, you will run into problems with:

- multiple requests
- different instances
- restarts
- scaling
- ordering

Durable Objects exist specifically to solve this kind of shared-state problem.

### 3h. How WebSockets fit in

Once your room Durable Object works over HTTP, the next step is real-time updates.

That is where WebSockets come in.

The Durable Object becomes the room's live communication hub:

- each player connects to the room socket
- the room receives commands
- the room updates state
- the room broadcasts changes

For a co-op game, this is much cleaner than polling every second.

### 3i. Hibernation in simple terms

Cloudflare Durable Objects can hibernate WebSocket connections.

Simple idea:

- if the room is idle, Cloudflare can put it to sleep
- when a message arrives, Cloudflare wakes it back up
- you reload state from Durable Object storage

Why this matters:

- lower cost
- better fit for rooms that are connected but not constantly active

As a beginner, you do not need to implement hibernation-specific optimizations on day one.

Just know that you should persist enough state so a sleeping room can wake back up safely.

### 3j. Minimal lifecycle for one room

Here is the basic room lifecycle you should aim for.

#### Create room

- Worker chooses room id
- Worker gets Durable Object stub
- Worker tells room to initialize
- room stores initial snapshot

#### Join room

- Worker or room validates join request
- room adds second player
- room saves updated snapshot

#### Play game

- clients send commands to room
- room validates commands
- room mutates authoritative state
- room broadcasts snapshot updates

#### Reconnect

- client reconnects with room id and player token
- room reloads snapshot if needed
- room sends latest state

### 3k. Durable Object example with room commands

Here is a more game-shaped example:

```js
export class RoomDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/init" && request.method === "POST") {
      const room = {
        version: 1,
        phase: "LOBBY",
        players: {},
        logs: []
      };

      await this.state.storage.put("room", room);
      return Response.json(room);
    }

    if (url.pathname === "/join" && request.method === "POST") {
      const body = await request.json();
      const room = await this.state.storage.get("room");

      room.players[body.playerId] = {
        id: body.playerId,
        name: body.name || "Guest"
      };
      room.version += 1;

      await this.state.storage.put("room", room);
      return Response.json(room);
    }

    if (url.pathname === "/state") {
      const room = await this.state.storage.get("room");
      return Response.json(room);
    }

    return new Response("Not found", { status: 404 });
  }
}
```

This is not production-ready, but it is enough to understand the programming model.

### 3l. Best way to learn Durable Objects without getting overwhelmed

Build them in this order:

1. one room object with `/init`
2. add `/state`
3. add `/join`
4. add one command route like `/command/play-card`
5. only then add WebSockets

That sequence keeps the learning curve manageable.

### 3m. What to read in this tutorial for Durable Objects

If you want the Durable Object parts specifically, focus on these sections:

- `2j. Add a Durable Object binding`
- `2k. Minimal Durable Object class`
- `2l. Local development with Durable Objects`
- `3. Durable Objects`
- `6. Add room lifecycle APIs`
- `7. Use snapshots plus version numbers`
- `12. Add room-safe persistence`

If you want, I can also add a dedicated copy-paste starter section with:

- exact Worker files
- exact `wrangler.toml`
- a room create endpoint
- a room join endpoint
- a tiny in-browser test page

Use one Durable Object per co-op room.

Each room object should own:

- room membership
- room code
- authoritative run state
- authoritative RNG seed
- battle sequencing
- action validation
- version numbers for sync
- reconnect snapshots

This is the core of the multiplayer system.

### 4. WebSockets

Connect each player to the room Durable Object over WebSockets.

Why:

- low-latency updates
- room presence
- clean broadcast model
- natural fit for turn-based commands

Use WebSocket Hibernation if possible to control cost.

### 5. D1

Use D1 only for long-lived data like:

- account records
- room directory metadata
- run history
- analytics
- invite records

Do not use D1 as the live source of truth for in-progress rooms.

### 6. KV / R2

Optional only:

- KV for rate limits, short-lived invite lookups, feature flags
- R2 for replay exports or large artifacts

You do not need either for MVP.

## Best MVP co-op model

Start with this ruleset:

- 2 players only
- shared run
- shared map progression
- shared enemy in battle
- each player has their own deck, hand, HP, energy, relics
- only one player acts at a time during battle
- both players must be present to continue after major transitions

This is simpler than simultaneous turns and much easier to validate on the server.

If you try to support both players acting at the same time on day one, the complexity jumps a lot.

## The main refactor idea

The current app mixes three concerns together:

- game simulation
- UI rendering
- browser persistence

To make multiplayer work, split them.

### New model

The server owns simulation.

The client owns:

- rendering
- input capture
- temporary UI state
- reconnect behavior

The client should stop directly mutating the run.

Instead, it sends commands like:

- `play_card`
- `end_turn`
- `move_map`
- `pick_reward`
- `choose_event`
- `buy_shop_card`
- `buy_shop_relic`
- `select_starting_relic`

The room Durable Object validates the command, updates authoritative state, increments a version, then broadcasts the new state.

## Step 1: Make render functions pure

Before networking, fix the UI architecture.

In multiplayer, render functions should display state, not generate it.

### Problems in the current code

`src/features/event/eventRender.js` does this during render:

- chooses a random event
- stores it on `root.currentEvent`

`src/features/shop/shopRender.js` does this during render:

- generates shop cards
- generates shop relic
- stores them on `root.currentShopCards` and `root.currentShopRelic`

That is fine in a purely local game, but it will cause desync in multiplayer.

### What to change

Move event/shop generation into explicit state transitions.

For example:

- when entering an event node, the server chooses the event once
- when entering a shop node, the server rolls the inventory once
- render functions just display whatever the state already contains

Good rule:

If a function contains `Math.random()` and also renders HTML, it probably needs to be split.

## Step 2: Replace single-player root state with room state

Today the game assumes one player object:

- `root.player`
- `root.enemy`
- `root.nodeId`

For co-op, the authoritative room state should look more like this:

```js
{
  roomId: "abc123",
  version: 42,
  phase: "BATTLE",
  currentAct: "act1",
  nodeId: "n7",
  completedNodes: ["n1", "n2"],
  players: {
    p1: {
      id: "p1",
      name: "Player 1",
      hp: 70,
      maxHp: 70,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      weak: 0,
      vuln: 0,
      gold: 100,
      deck: [],
      draw: [],
      discard: [],
      hand: [],
      relicStates: []
    },
    p2: {
      id: "p2",
      name: "Player 2",
      hp: 70,
      maxHp: 70,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      weak: 0,
      vuln: 0,
      gold: 100,
      deck: [],
      draw: [],
      discard: [],
      hand: [],
      relicStates: []
    }
  },
  battle: {
    enemy: null,
    turnOwner: "p1",
    turnNumber: 1,
    flags: {}
  },
  reward: null,
  event: null,
  shop: null,
  logs: []
}
```

You do not need this exact shape, but you do need a room-centric shape.

## Step 3: Move authority into commands

The repo already has a command layer in `src/commands/*`.

That is useful conceptually, but currently commands just call local methods.

### Today

Example flow:

- click card
- `InputManager` handles click
- `PlayCardCommand.execute()` calls `root.play(index)`
- browser mutates local battle state

### Multiplayer version

New flow:

- click card
- client sends `{ type: "play_card", roomId, playerId, cardIndex }`
- Durable Object validates the request
- Durable Object runs battle logic
- Durable Object broadcasts updated snapshot
- client re-renders from snapshot

That means commands become network messages, not direct local mutations.

## Step 4: Make RNG deterministic and server-owned

This codebase currently uses random behavior in multiple places:

- shuffling cards
- event outcomes
- reward generation
- shop generation
- some enemy text selection

In multiplayer, never let the client own randomness for authoritative gameplay.

### Recommended approach

- store an RNG seed in the room Durable Object
- use a deterministic PRNG on the server
- every random choice comes from that PRNG

Benefits:

- replayable runs
- easier debugging
- easier desync investigation
- clients stay in sync because they no longer decide outcomes

## Step 5: Extract simulation from DOM code

Right now battle logic is fairly reusable, but it is still coupled to the browser `root` shape.

You want a server-safe simulation layer that:

- takes plain JSON state
- returns updated plain JSON state
- does not touch `document`
- does not depend on browser-only objects

### Target structure

Create a shared game module, for example:

- `shared/game/state.js`
- `shared/game/reducer.js`
- `shared/game/commands.js`
- `shared/game/rng.js`

Then move logic out of browser-specific files into those shared modules.

The Worker/Durable Object imports those shared modules.

The client can also import read-only helpers from them if needed.

## Step 6: Add room lifecycle APIs

You need at least these API flows.

### Create room

Client calls Worker:

`POST /api/rooms`

Worker:

- creates guest identity if needed
- allocates room Durable Object
- initializes room state
- returns room id, player id, join code, websocket URL

### Join room

Client calls Worker:

`POST /api/rooms/:roomId/join`

Worker:

- validates invite or room code
- registers the second player
- returns room bootstrap info and websocket URL

### Connect room socket

Client opens socket to room Durable Object.

On connect:

- authenticate player identity
- attach player to room
- send current snapshot
- notify other player of presence

## Step 7: Use snapshots plus version numbers

Every room update should increment a version.

Example:

```json
{
  "type": "room_state",
  "roomId": "abc123",
  "version": 42,
  "state": { }
}
```

Every command from the client should include the last version the client saw:

```json
{
  "type": "play_card",
  "roomId": "abc123",
  "playerId": "p1",
  "baseVersion": 42,
  "cardIndex": 1
}
```

If the client is behind, the room can reject the action and resend the latest snapshot.

This makes reconnect and conflict handling much simpler.

## Step 8: Add reconnect support

Cloudflare deploys and network changes will disconnect sockets.

Plan for this from the start.

### On the server

Persist at least:

- current authoritative room state
- room version
- connected player ids
- recent action log

### On the client

Store locally:

- room id
- player id
- session token

On reconnect:

- reconnect socket
- request latest snapshot
- replace local view state completely

Do not try to reconstruct state from stale local mutations.

## Step 9: Redesign battle for co-op

This is the biggest game-design decision.

### Recommended MVP battle rules

- one shared enemy
- each player has their own hand and energy
- one active player at a time
- active player plays any number of cards, then ends turn
- enemy acts after both players have taken a turn, or after one shared round depending on your design

Two good options:

### Option A: Alternating player turns

Sequence:

- player 1 turn
- player 2 turn
- enemy turn

Pros:

- easy to validate
- easy to render
- easy to communicate

### Option B: Shared player phase

Sequence:

- both players act in any order
- both must click end turn
- enemy turn

Pros:

- feels more cooperative

Cons:

- more race conditions
- more validation complexity
- requires better UI state for readiness

For the first version, choose Option A.

## Step 10: Update the frontend state model

The browser should keep only a view model.

For example:

```js
{
  session: {
    roomId: "abc123",
    playerId: "p1",
    token: "..."
  },
  connection: {
    status: "connected"
  },
  room: {
    version: 42,
    state: { ...authoritative snapshot... }
  },
  ui: {
    selectedCardIndex: null,
    modal: null
  }
}
```

Important:

- `selectedCardIndex` is local UI state
- `currentEvent` should be authoritative room state
- `currentShopCards` should be authoritative room state
- `battle enemy` should be authoritative room state

## Step 11: Change rendering to support two players

The current battle renderer is built around one player and one enemy.

You will need to:

- show both players
- show which player is active
- show each player hand, HP, block, and energy
- disable controls when it is not the local player's turn
- show presence and reconnect indicators

### Minimal battle UI changes

Add these visual concepts:

- `You`
- `Teammate`
- `Current turn: Player 1`
- disabled hand when it is not your turn
- reconnect banner if socket is down

You do not need perfect polish for the first pass.

## Step 12: Add room-safe persistence

Replace `localStorage` game saves with server room persistence.

### Durable Object storage should persist

- room state snapshot
- room version
- players
- last activity time
- ready states
- invite metadata

### Client local storage should persist only session helpers

- room id
- player id
- reconnect token

Do not store authoritative run state in the browser anymore.

## Step 13: Start with a narrow feature slice

Do not migrate the whole game at once.

Build this slice first:

1. create room
2. join room
3. select starting relic
4. move on map
5. enter one battle
6. play cards
7. end turn
8. win or lose

Once that works, add:

- rewards
- rest
- shop
- event nodes
- act transitions
- endgame

This will save a lot of debugging time.

## Step 14: Suggested repo structure

One clean direction is:

```text
src/
  client/
    app/
    ui/
    network/
  shared/
    game/
      commands.js
      reducer.js
      rules/
      rng.js
      schemas.js
  worker/
    index.js
    rooms/
      RoomDurableObject.js
```

You do not have to rename the entire project immediately, but separating `client`, `shared`, and `worker` early will help a lot.

## Step 15: Suggested room message protocol

Keep the protocol small and explicit.

### Client -> room

```json
{ "type": "join_room", "roomId": "abc123", "playerId": "p1", "token": "..." }
{ "type": "play_card", "baseVersion": 12, "cardIndex": 0 }
{ "type": "end_turn", "baseVersion": 13 }
{ "type": "move_map", "baseVersion": 14, "nodeId": "n4" }
{ "type": "pick_reward", "baseVersion": 15, "rewardIndex": 2 }
{ "type": "choose_event", "baseVersion": 16, "choiceIndex": 1 }
```

### Room -> client

```json
{ "type": "snapshot", "version": 12, "state": { } }
{ "type": "patch", "version": 13, "events": [ ] }
{ "type": "error", "code": "OUT_OF_DATE", "message": "Client version is stale" }
{ "type": "presence", "playerId": "p2", "status": "connected" }
```

For MVP, sending full snapshots is acceptable.

You can optimize to patches later.

## Step 16: Cloudflare deployment plan

### Frontend

Deploy the static app to Pages.

### Backend

Deploy a Worker with:

- Durable Object binding for rooms
- optional D1 binding for metadata
- optional KV binding for rate limiting / invite helpers

### Environment bindings you will likely want

- `ROOMS` Durable Object namespace
- `DB` D1 database
- `INVITES` KV namespace

## Step 17: Security basics

Even for a small private project, add these basics:

- room join tokens or invite codes
- validation that a player can only act for their own player id
- validation that it is actually their turn
- server-side validation for gold, card ownership, node transitions, and reward picks
- rate limiting on room creation/join

Never trust the client to decide:

- damage
- card draws
- enemy intent
- reward options
- shop inventory
- map legality

## Step 18: Practical implementation order

Here is the order I would actually build this in.

### Phase 1: Preparation

- deploy current app to Cloudflare Pages
- extract random-generation code out of render functions
- make event/shop state explicit
- define a room snapshot schema

### Phase 2: Shared engine

- extract pure game logic from browser-owned `root`
- create command handlers that accept plain room state
- replace direct browser mutation with reducer-style updates

### Phase 3: Room backend

- create Worker APIs for room create/join
- create room Durable Object
- persist room snapshots in Durable Object storage
- support websocket connect + broadcast

### Phase 4: Multiplayer frontend

- add room connect screen
- add websocket client
- render from authoritative snapshots
- disable actions when not allowed
- add reconnect flow

### Phase 5: Game expansion

- battle complete
- reward complete
- map complete
- rest/shop/event complete
- act transitions complete

## Step 19: What will be hardest in this repo

These are the biggest technical pain points.

### 1. Single-player assumptions everywhere

Many files assume exactly one `root.player`.

### 2. State generation inside render

This must be removed before multiplayer becomes trustworthy.

### 3. Browser-owned persistence

`localStorage` saves are fine for solo play, but not for authoritative co-op.

### 4. UI and simulation are tightly coupled

Battle logic is reusable, but still built around the browser root shape.

### 5. Partial command pattern

The command layer is a helpful start, but it is not yet a networked action protocol.

## Step 20: MVP success checklist

Your MVP is in good shape when all of this is true:

- two players can create/join a room
- both see the same room snapshot
- one player disconnecting does not destroy the room
- reconnect restores the room state cleanly
- all authoritative gameplay decisions happen in the room Durable Object
- no render function mutates authoritative gameplay state
- clients only send intents, not outcomes
- the server rejects invalid or stale actions

## Final recommendation

If you want the fastest path to success, do this:

1. keep the frontend simple and static on Pages
2. use one Durable Object per room
3. use turn-based co-op, not simultaneous-action co-op
4. make the server authoritative for RNG and state transitions
5. refactor event/shop generation before adding networking
6. migrate one narrow feature slice first, not the whole game at once

That path gives you the best chance of shipping a working co-op version without drowning in sync bugs.

## Suggested next step

After this tutorial, the most useful follow-up document would be either:

- a room state schema for the Durable Object
- a concrete API and websocket protocol spec
- a step-by-step refactor plan for extracting shared game logic
