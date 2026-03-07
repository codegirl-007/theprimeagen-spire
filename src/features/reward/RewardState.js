import { GameState } from "../../systems/state/GameState.js";
import { renderReward } from "../../ui/render.js";

export class RewardState extends GameState {
    constructor() {
        super("REWARD");
    }

    async enter(gameRoot, previousState = null) {
        gameRoot.save();
        await gameRoot.render();
    }

    async exit(gameRoot, nextState = null) {
        if (nextState?.name !== "REWARD") {
            gameRoot.currentRewardChoices = null;
        }
    }

    async render(gameRoot) {
        await renderReward(gameRoot, gameRoot.currentRewardChoices || []);
    }

    getSaveData(gameRoot) {
        return {
            ...super.getSaveData(gameRoot),
            nodeId: gameRoot.nodeId,
            currentRewardChoices: gameRoot.currentRewardChoices
        };
    }

    restoreFromSave(gameRoot, saveData) {
        if (saveData.currentRewardChoices) {
            gameRoot.currentRewardChoices = saveData.currentRewardChoices;
        }
    }
}
