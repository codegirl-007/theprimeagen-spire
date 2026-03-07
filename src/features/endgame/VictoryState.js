import { GameState } from "../../systems/state/GameState.js";
import { renderWin } from "./endgameRender.js";

export class VictoryState extends GameState {
    constructor() {
        super("VICTORY");
    }

    async enter(gameRoot, previousState = null) {
        await gameRoot.render();
    }

    async render(gameRoot) {
        await renderWin(gameRoot);
    }

    getSaveData(gameRoot) {
        return {
            ...super.getSaveData(gameRoot),
            nodeId: gameRoot.nodeId
        };
    }
}
