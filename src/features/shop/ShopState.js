import { GameState } from "../../systems/state/GameState.js";
import { renderShop } from "./shopRender.js";

export class ShopState extends GameState {
    constructor() {
        super("SHOP");
    }

    async enter(gameRoot, previousState = null) {
        gameRoot.save();
        await gameRoot.render();
    }

    async exit(gameRoot, nextState = null) {
        gameRoot.currentShopCards = null;
        gameRoot.currentShopRelic = null;
    }

    async render(gameRoot) {
        renderShop(gameRoot);
    }

    getSaveData(gameRoot) {
        return {
            ...super.getSaveData(gameRoot),
            nodeId: gameRoot.nodeId,
            currentShopCards: gameRoot.currentShopCards,
            currentShopRelic: gameRoot.currentShopRelic
        };
    }

    restoreFromSave(gameRoot, saveData) {
        if (saveData.currentShopCards) gameRoot.currentShopCards = saveData.currentShopCards;
        if (saveData.currentShopRelic) gameRoot.currentShopRelic = saveData.currentShopRelic;
    }
}
