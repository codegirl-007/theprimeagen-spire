/**
 * CommandInvoker manages command execution
 * Follows the Command Pattern for centralized action handling
 */
export class CommandInvoker {
    constructor() {
        this.history = [];
        this.maxHistorySize = 50; // Prevent memory bloat
    }

    /**
     * Execute a command and add it to history
     * @param {Command} command - The command to execute
     * @returns {boolean} true if successful
     */
    execute(command) {
        try {
            const success = command.execute();
            
            if (success) {
                // Add command to history for debugging
                this.history.push(command);
                
                // Trim history if it gets too long
                if (this.history.length > this.maxHistorySize) {
                    this.history.shift();
                }
                
                command.executed = true;
                console.log(`Executed: ${command.getDescription()}`);
            }
            
            return success;
        } catch (error) {
            console.error(`Command execution failed: ${command.getDescription()}`, error);
            return false;
        }
    }

    /**
     * Get command history for debugging
     * @returns {Array<string>}
     */
    getHistory() {
        return this.history.map(cmd => cmd.getDescription());
    }

    /**
     * Clear command history
     */
    clear() {
        this.history = [];
    }
}