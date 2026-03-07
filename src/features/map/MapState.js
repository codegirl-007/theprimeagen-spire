import { GameState } from "../../systems/state/GameState.js";
import { renderMap } from "../../ui/render.js";

export class MapState extends GameState {
    constructor() {
        super("MAP");
    }

    async enter(gameRoot, previousState = null) {
        gameRoot.enemy = null;
        gameRoot._battleInProgress = false;
        gameRoot.save();
        await gameRoot.render();
    }

    async render(gameRoot) {
        await renderMap(gameRoot);
    }

    getSaveData(gameRoot) {
        return {
            ...super.getSaveData(gameRoot),
            nodeId: gameRoot.nodeId,
            currentAct: gameRoot.currentAct,
            completedNodes: gameRoot.completedNodes
        };
    }

    restoreFromSave(gameRoot, saveData) {
        if (saveData.nodeId) gameRoot.nodeId = saveData.nodeId;
        if (saveData.currentAct) gameRoot.currentAct = saveData.currentAct;
        if (saveData.completedNodes) gameRoot.completedNodes = saveData.completedNodes;
    }
}
