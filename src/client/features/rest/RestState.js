import { GameState } from "../../../shared/state/GameState.js";
import { renderRest } from "../../ui/render.js";

export class RestState extends GameState {
  constructor() {
    super("REST");
  }

  async enter(gameRoot, previousState = null) {
    gameRoot.scheduleSave();
    await gameRoot.render();
  }

  async render(gameRoot) {
    await renderRest(gameRoot);
  }

  getSaveData(gameRoot) {
    return {
      ...super.getSaveData(gameRoot),
      nodeId: gameRoot.nodeId,
    };
  }
}
