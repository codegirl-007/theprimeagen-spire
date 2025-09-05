/**
 * Base Command class following the Command Pattern
 * All game actions should extend this class
 */
export class Command {
    constructor() {
        this.executed = false;
        this.timestamp = Date.now();
    }

    /**
     * Execute the command
     * @returns {boolean} true if successful, false otherwise
     */
    execute() {
        throw new Error("Command.execute() must be implemented by subclass");
    }

    /**
     * Get a description of this command for logging/debugging
     * @returns {string}
     */
    getDescription() {
        return this.constructor.name;
    }
}