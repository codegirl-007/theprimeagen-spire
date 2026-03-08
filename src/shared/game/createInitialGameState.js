import { MAPS } from "../data/maps.js";
import { makePlayer } from "../engine/core.js";

export function createInitialGameState() {
  return {
    logs: [],
    map: MAPS.act1,
    nodeId: "n1",
    currentAct: "act1",
    player: makePlayer(),
    relicStates: [],
    completedNodes: [],
    enemy: null,
    currentEvent: null,
    currentShopCards: null,
    currentShopRelic: null,
    currentRewardChoices: null,
    pendingCodeReview: null,
    _battleContext: null,
    _battleInProgress: false,
    selectedCardIndex: null,
  };
}
