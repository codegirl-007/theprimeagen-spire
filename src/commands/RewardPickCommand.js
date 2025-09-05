import { Command } from './Command.js';

/**
 * Command for picking a reward card
 * Wraps the existing root.takeReward() method
 */
export class RewardPickCommand extends Command {
    constructor(gameRoot, rewardIndex) {
        super();
        this.gameRoot = gameRoot;
        this.rewardIndex = rewardIndex;
    }

    execute() {
        try {
            // Use existing root.takeReward method
            this.gameRoot.takeReward(this.rewardIndex);
            return true;
        } catch (error) {
            console.error("RewardPickCommand execution failed:", error);
            return false;
        }
    }

    getDescription() {
        const reward = this.gameRoot.rewards?.[this.rewardIndex];
        const cardName = reward?.name || 'Unknown Card';
        return `Pick Reward: ${cardName}`;
    }
}
