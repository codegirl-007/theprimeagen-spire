import test from "node:test";
import assert from "node:assert/strict";

import {
  attachRelics,
  grantRelic,
  normalizeRelicStates,
  makeBattleContext,
  playCard,
  startPlayerTurn,
  enemyTurn,
} from "../src/shared/engine/battle.js";
import { CARDS } from "../src/shared/data/cards.js";
import { cloneCard } from "../src/shared/engine/core.js";
import { createTestRoot } from "../src/shared/game/createTestRoot.js";
import { attachPersistence } from "../src/client/app/localPersistence.js";

test("attachRelics stores plain relic data and grantRelic does not rerun old onRunStart hooks", () => {
  const root = createTestRoot();

  attachRelics(root, ["vim_motions"]);

  assert.deepEqual(root.relicStates, [
    {
      id: "vim_motions",
      state: {},
    },
  ]);
  assert.equal(root.player.maxHp, 80);
  assert.equal(root.player.hp, 80);

  grantRelic(root, "kinesis");

  assert.equal(root.relicStates.length, 2);
  assert.equal(root.player.maxHp, 80);
  assert.equal(root.player.hp, 80);
  assert.deepEqual(root.relicStates[1], {
    id: "kinesis",
    state: {},
  });
});

test("normalizeRelicStates strips stale hook data and preserves saved state", () => {
  const normalized = normalizeRelicStates([
    {
      id: "haskell",
      hooks: { onTurnStart() {} },
      state: { used: true },
    },
    {
      id: "missing_relic",
      state: { used: true },
    },
  ]);

  assert.deepEqual(normalized, [
    {
      id: "haskell",
      state: { used: true },
    },
  ]);
});

test("normalizeRelicStates merges default relic state when saved state is missing", () => {
  const normalized = normalizeRelicStates([{ id: "haskell" }]);

  assert.deepEqual(normalized, [
    {
      id: "haskell",
      state: { used: false },
    },
  ]);
});

test("grantRelic preserves existing relic state while adding a new relic", () => {
  const root = createTestRoot();
  root.relicStates = normalizeRelicStates([{ id: "haskell", state: { used: true } }]);

  grantRelic(root, "kinesis");

  assert.deepEqual(root.relicStates, [
    {
      id: "haskell",
      state: { used: true },
    },
    {
      id: "kinesis",
      state: {},
    },
  ]);
});

test("runtime relic hooks still work from normalized relic state", () => {
  const root = createTestRoot();
  root.relicStates = normalizeRelicStates([{ id: "haskell", state: { used: false } }]);
  root.player.hand = [cloneCard(CARDS.strike), cloneCard(CARDS.strike)];
  root.player.energy = 3;

  const ctx = makeBattleContext(root);

  playCard(ctx, 0);
  assert.equal(root.enemy.hp, 88);
  assert.equal(root.relicStates[0].state.used, true);

  playCard(ctx, 0);
  assert.equal(root.enemy.hp, 82);

  startPlayerTurn(root);
  assert.equal(root.relicStates[0].state.used, false);
});

test("vs_code damage reduction still applies from normalized relic state", () => {
  const root = createTestRoot();
  root.relicStates = normalizeRelicStates([{ id: "vs_code", state: {} }]);
  root.enemy.intent = { type: "attack", value: 10 };

  enemyTurn(root);

  assert.equal(root.player.hp, 61);
});

test("load normalizes legacy saved relic entries without hooks", () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };

  const root = createTestRoot();
  attachPersistence(root);

  localStorage.setItem(
    "birthday-spire-save",
    JSON.stringify({
      player: {
        ...root.player,
        deck: ["strike", "defend"],
        hand: [],
        draw: [],
        discard: [],
      },
      nodeId: "n1",
      currentAct: "act1",
      relicStates: [
        {
          id: "haskell",
          hooks: { onTurnStart() {} },
          state: { used: true },
        },
      ],
      completedNodes: [],
      logs: [],
      battleInProgress: false,
      enemy: null,
      flags: {},
      lastCard: null,
      pendingCodeReview: null,
      stateMachine: null,
      timestamp: Date.now(),
    }),
  );

  assert.equal(root.load(), true);
  assert.deepEqual(root.relicStates, [
    {
      id: "haskell",
      state: { used: true },
    },
  ]);

  delete globalThis.localStorage;
});
