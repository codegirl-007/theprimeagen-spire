import { applyEventChoice } from "../../../shared/game/events.js";

export async function handleEventChoice(manager, element) {
  const index = parseInt(element.dataset.choice, 10);

  if (manager.root.currentEvent && manager.root.currentEvent.choices[index]) {
    applyEventChoice(manager.root, index);
    await manager.root.afterNode();
  }
}
