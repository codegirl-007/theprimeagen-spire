import { GameState } from "../../../shared/state/GameState.js";
import { renderEvent } from "./eventRender.js";

export class EventState extends GameState {
  constructor() {
    super("EVENT");
  }

  async enter(gameRoot, previousState = null) {
    gameRoot.scheduleSave();
    await gameRoot.render();
  }

  async exit(gameRoot, nextState = null) {
    gameRoot.currentEvent = null;
  }

  async render(gameRoot) {
    renderEvent(gameRoot);
  }

  getSaveData(gameRoot) {
    return {
      ...super.getSaveData(gameRoot),
      nodeId: gameRoot.nodeId,
      currentEvent: gameRoot.currentEvent,
    };
  }

  restoreFromSave(gameRoot, saveData) {
    if (saveData.currentEvent) gameRoot.currentEvent = saveData.currentEvent;
  }
}
