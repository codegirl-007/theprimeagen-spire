import { GameState } from "../../systems/state/GameState.js";
import { renderLose } from "./defeatRender.js";

export class DefeatState extends GameState {
  constructor() {
    super("DEFEAT");
  }

  async enter(gameRoot, previousState = null) {
    await gameRoot.render();
  }

  async render(gameRoot) {
    await renderLose(gameRoot);
  }

  getSaveData(gameRoot) {
    return {
      ...super.getSaveData(gameRoot),
      nodeId: gameRoot.nodeId,
    };
  }
}
