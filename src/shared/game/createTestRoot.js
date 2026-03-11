import { createInitialGameState } from "./createInitialGameState.js";

export function createTestRoot(overrides = {}) {
  return {
    ...createInitialGameState(),
    logs: [],
    enemy: {
      id: "begin",
      name: "Begin",
      hp: 100,
      maxHp: 100,
      block: 0,
      weak: 0,
      vuln: 0,
      turn: 1,
      intent: { type: "attack", value: 0 },
    },
    flags: {},
    lastCard: null,
    log(message) {
      this.logs.push(message);
    },
    render() {},
    onWin() {},
    onLose() {},
    showDamageNumber() {},
    ...overrides,
  };
}
