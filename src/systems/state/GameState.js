export class GameState {
    constructor(name) {
        this.name = name;
    }

    async enter(gameRoot, previousState = null) {}

    async exit(gameRoot, nextState = null) {}

    async render(gameRoot) {
        throw new Error(`render() not implemented for state: ${this.name}`);
    }

    getSaveData(gameRoot) {
        return {
            stateName: this.name
        };
    }

    restoreFromSave(gameRoot, saveData) {}
}
