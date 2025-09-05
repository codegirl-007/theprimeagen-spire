import { Command } from './Command.js';

/**
 * Command for rest site actions (heal, upgrade)
 * Wraps the existing rest action logic
 */
export class RestActionCommand extends Command {
    constructor(gameRoot, action) {
        super();
        this.gameRoot = gameRoot;
        this.action = action; // 'heal' or 'upgrade'
    }

    execute() {
        try {
            if (this.action === 'heal') {
                // Heal 20% of max HP (same as current logic)
                const heal = Math.floor(this.gameRoot.player.maxHp * 0.2);
                this.gameRoot.player.hp = Math.min(this.gameRoot.player.maxHp, this.gameRoot.player.hp + heal);
                this.gameRoot.log(`Healed for ${heal} HP.`);
                this.gameRoot.afterNode();
            } else if (this.action === 'upgrade') {
                // Show upgrade selection (same as current logic)
                if (window.gameModules?.render?.renderUpgrade) {
                    window.gameModules.render.renderUpgrade(this.gameRoot);
                }
            } else {
                console.warn(`Unknown rest action: ${this.action}`);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error("RestActionCommand execution failed:", error);
            return false;
        }
    }

    getDescription() {
        return `Rest Action: ${this.action}`;
    }
}