import { RewardPickCommand } from "../../commands/RewardPickCommand.js";

export function handleRewardPick(manager, element) {
    const index = parseInt(element.dataset.pick, 10);

    try {
        const command = new RewardPickCommand(manager.root, index);
        manager.root.commandInvoker.execute(command);
    } catch (error) {
        console.error("Error picking reward:", error);
    }
}
