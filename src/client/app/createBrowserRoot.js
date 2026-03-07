import { CommandInvoker } from "../commands/CommandInvoker.js";
import {
  renderBattle,
  showDamageNumber,
  updateCardSelection,
} from "../features/battle/battleRender.js";
import { renderMap } from "../features/map/mapRender.js";
import { renderUpgrade } from "../features/rest/restRender.js";
import { renderCodeReviewSelection } from "../features/endgame/codeReviewRender.js";
import { attachPersistence } from "./localPersistence.js";
import { attachRewardFlow } from "../../shared/game/rewardFlow.js";
import { createInitialGameState } from "../../shared/game/createInitialGameState.js";
import { attachGameActions } from "../../shared/game/gameActions.js";

export function createBrowserRoot(app) {
  const root = {
    app,
    ...createInitialGameState(),
    inputManager: null,
    commandInvoker: new CommandInvoker(),
    stateMachine: null,
    ui: {
      renderMap,
      renderUpgrade,
      updateCardSelection,
      renderCodeReviewSelection,
    },

    async render() {
      if (this.stateMachine) {
        await this.stateMachine.render();
        return;
      }
      await renderBattle(this);
    },

    showDamageNumber,
  };

  attachGameActions(root);
  attachPersistence(root);
  attachRewardFlow(root);

  return root;
}
