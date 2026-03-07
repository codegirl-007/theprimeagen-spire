export class GameStateMachine {
  constructor(gameRoot) {
    this.gameRoot = gameRoot;
    this.currentState = null;
    this.states = new Map();
    this.stateHistory = [];
  }

  registerState(name, state) {
    this.states.set(name, state);
  }

  getCurrentState() {
    return this.currentState;
  }

  getCurrentStateName() {
    return this.currentState?.name || null;
  }

  async setState(stateName, transitionData = {}) {
    const newState = this.states.get(stateName);
    if (!newState) {
      console.error(`State '${stateName}' not found`);
      return false;
    }

    const previousState = this.currentState;
    if (previousState) {
      await previousState.exit(this.gameRoot, newState);
    }

    this.currentState = newState;
    this.stateHistory.push({
      from: previousState?.name || "none",
      to: stateName,
      timestamp: Date.now(),
      data: transitionData,
    });

    if (this.stateHistory.length > 50) {
      this.stateHistory.shift();
    }

    await newState.enter(this.gameRoot, previousState);
    return true;
  }

  async render() {
    if (this.currentState) {
      await this.currentState.render(this.gameRoot);
    }
  }

  getSaveData() {
    const data = {
      currentStateName: this.getCurrentStateName(),
      stateHistory: this.stateHistory.slice(-10),
    };

    if (this.currentState) {
      data.stateData = this.currentState.getSaveData(this.gameRoot);
    }

    return data;
  }

  async restoreFromSave(saveData) {
    if (!saveData.currentStateName) {
      console.warn("No state name in save data");
      return false;
    }

    const success = await this.setState(saveData.currentStateName);
    if (success && this.currentState && saveData.stateData) {
      this.currentState.restoreFromSave(this.gameRoot, saveData.stateData);
    }

    if (saveData.stateHistory) {
      this.stateHistory = saveData.stateHistory;
    }

    return success;
  }

  getHistory() {
    return this.stateHistory.slice();
  }
}
