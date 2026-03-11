import test from "node:test";
import assert from "node:assert/strict";

import {
  CURRENT_SAVE_VERSION,
  migrateSaveData,
  migrateCheckpointData,
} from "../src/client/app/localPersistence.js";

test("migrateSaveData upgrades legacy saves to current version", () => {
  const migrated = migrateSaveData({
    player: { deck: [], hand: [], draw: [], discard: [], hp: 10, maxHp: 10 },
    nodeId: "n1",
    currentAct: "act1",
    relicStates: [
      { id: "haskell", hooks: { onTurnStart() {} }, state: { used: true } },
    ],
    completedNodes: [],
    logs: [],
    battleInProgress: false,
    enemy: null,
    flags: {},
    lastCard: null,
    stateMachine: null,
    timestamp: 123,
  });

  assert.equal(migrated.version, CURRENT_SAVE_VERSION);
  assert.equal(migrated.pendingCodeReview, null);
  assert.deepEqual(migrated.relicStates, [
    {
      id: "haskell",
      state: { used: true },
    },
  ]);
});

test("migrateSaveData preserves current-version saves", () => {
  const saveData = {
    version: CURRENT_SAVE_VERSION,
    player: { deck: [], hand: [], draw: [], discard: [], hp: 10, maxHp: 10 },
    nodeId: "n1",
    currentAct: "act1",
    relicStates: [{ id: "kinesis", state: {} }],
    completedNodes: [],
    logs: [],
    battleInProgress: false,
    enemy: null,
    flags: {},
    lastCard: null,
    pendingCodeReview: null,
    stateMachine: null,
    timestamp: 123,
  };

  assert.deepEqual(migrateSaveData(saveData), saveData);
});

test("migrateCheckpointData upgrades legacy checkpoints to current version", () => {
  const migrated = migrateCheckpointData({
    player: { deck: [], hand: [], draw: [], discard: [], hp: 10, maxHp: 10 },
    currentAct: "act2",
    relicStates: [{ id: "haskell", hooks: { onTurnStart() {} }, state: { used: false } }],
    timestamp: 456,
  });

  assert.equal(migrated.version, CURRENT_SAVE_VERSION);
  assert.deepEqual(migrated.relicStates, [
    {
      id: "haskell",
      state: { used: false },
    },
  ]);
});
