import { GameState } from "../../systems/state/GameState.js";
import { renderBattle } from "../../ui/render.js";
import { createBattle } from "../../engine/battle.js";

export class BattleState extends GameState {
  constructor() {
    super("BATTLE");
  }

  async enter(gameRoot, previousState = null) {
    gameRoot._battleInProgress = true;

    if (!gameRoot.enemy) {
      const node = gameRoot.map.nodes.find(
        (entry) => entry.id === gameRoot.nodeId,
      );
      if (node && node.enemy) {
        createBattle(gameRoot, node.enemy);
      }
    }
  }

  async exit(gameRoot, nextState = null) {
    gameRoot._battleInProgress = false;
    gameRoot.battleUi = null;
    gameRoot._battleContext = null;
  }

  async render(gameRoot) {
    await renderBattle(gameRoot);
  }

  getSaveData(gameRoot) {
    return {
      ...super.getSaveData(gameRoot),
      nodeId: gameRoot.nodeId,
      battleInProgress: gameRoot._battleInProgress,
      enemy: gameRoot.enemy,
      flags: gameRoot.flags,
      lastCard: gameRoot.lastCard,
    };
  }

  restoreFromSave(gameRoot, saveData) {
    if (saveData.battleInProgress !== undefined) {
      gameRoot._battleInProgress = saveData.battleInProgress;
    }
    if (saveData.enemy) gameRoot.enemy = saveData.enemy;
    if (saveData.flags) gameRoot.flags = saveData.flags;
    if (saveData.lastCard) gameRoot.lastCard = saveData.lastCard;
  }
}
