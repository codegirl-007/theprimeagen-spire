import { Command } from './Command.js';

/**
 * Command for moving to a node on the map
 * Wraps the existing root.go() method
 */
export class MapMoveCommand extends Command {
    constructor(gameRoot, nodeId) {
        super();
        this.gameRoot = gameRoot;
        this.nodeId = nodeId;
    }

    execute() {
        try {
            // Use existing root.go method
            this.gameRoot.go(this.nodeId);
            return true;
        } catch (error) {
            console.error("MapMoveCommand execution failed:", error);
            return false;
        }
    }

    getDescription() {
        return `Move to Node: ${this.nodeId}`;
    }
}