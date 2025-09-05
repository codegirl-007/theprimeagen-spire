import { Command } from './Command.js';

/**
 * Command for ending the player's turn in battle
 * Wraps the existing root.end() method
 */
export class EndTurnCommand extends Command {
    constructor(gameRoot) {
        super();
        this.gameRoot = gameRoot;
    }

    execute() {
        try {
            // Use existing root.end method (which now creates proper battle context)
            this.gameRoot.end();
            return true;
        } catch (error) {
            console.error("EndTurnCommand execution failed:", error);
            return false;
        }
    }

    getDescription() {
        return "End Turn";
    }
}