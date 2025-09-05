import { Command } from './Command.js';

/**
 * Command for playing a card in battle
 * Wraps the existing root.play() method
 */
export class PlayCardCommand extends Command {
    constructor(gameRoot, cardIndex) {
        super();
        this.gameRoot = gameRoot;
        this.cardIndex = cardIndex;
    }

    execute() {
        try {
            // Use existing root.play method (which now creates proper battle context)
            this.gameRoot.play(this.cardIndex);
            return true;
        } catch (error) {
            console.error("PlayCardCommand execution failed:", error);
            return false;
        }
    }

    getDescription() {
        const card = this.gameRoot.player.hand[this.cardIndex];
        const cardName = card?.name || 'Unknown Card';
        return `Play Card: ${cardName}`;
    }
}