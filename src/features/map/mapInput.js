import { MapMoveCommand } from "../../commands/MapMoveCommand.js";

export function handleMapNodeClick(manager, element) {
  if (!element.dataset.node) return;

  try {
    const command = new MapMoveCommand(manager.root, element.dataset.node);
    manager.root.commandInvoker.execute(command);
  } catch (error) {
    console.error("Error moving on map:", error);
  }
}
