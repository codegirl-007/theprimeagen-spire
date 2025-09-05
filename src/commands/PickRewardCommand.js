import { Command } from './Command.js';

/**
 * Command for picking a reward card
 * Not undoable as it modifies deck permanently
 */
export class PickRewardCommand extends Command {
    constructor(gameRoot, rewardIndex) {
        super();
        this.gameRoot = gameRoot;
        this.rewardIndex = rewardIndex;
    }

    execute() {
        if (this.gameRoot.screen !== 'reward') {
            console.warn("Cannot pick reward - not on reward screen");
            return false;
        }

        try {
            // Use existing reward selection logic
            this.gameRoot.takeReward(this.rewardIndex);
            return true;
        } catch (error) {
            console.error("PickRewardCommand execution failed:", error);
            return false;
        }
    }

    canUndo() {
        // Reward picks are not undoable as they modify deck
        return false;
    }

    getDescription() {
        const reward = this.gameRoot.rewards?.[this.rewardIndex];
        const cardName = reward?.name || 'Unknown Card';
        return `Pick Reward: ${cardName}`;
    }
}
