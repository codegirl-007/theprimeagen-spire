import { GameState } from "../../systems/state/GameState.js";
import { renderRelicSelection } from "./relicSelectionRender.js";

export class RelicSelectionState extends GameState {
  constructor() {
    super("RELIC_SELECTION");
  }

  async enter(gameRoot, previousState = null) {
    await gameRoot.render();
  }

  async render(gameRoot) {
    renderRelicSelection(gameRoot);
  }

  getSaveData(gameRoot) {
    return {
      ...super.getSaveData(gameRoot),
    };
  }
}
