import { RestActionCommand } from "../../commands/RestActionCommand.js";
import { CARDS } from "../../../data/cards.js";

export function handleRestAction(manager, element) {
  const action = element.dataset.act;

  try {
    const command = new RestActionCommand(manager.root, action);
    manager.root.commandInvoker.execute(command);
  } catch (error) {
    console.error("Error with rest action:", error);
  }
}

export function handleCardUpgrade(manager, element) {
  const deckIndex = parseInt(element.dataset.upgrade, 10);
  const oldCardId = manager.root.player.deck[deckIndex];

  if (CARDS && CARDS[oldCardId]?.upgrades) {
    manager.root.player.deck[deckIndex] = CARDS[oldCardId].upgrades;
    manager.root.log(
      `Upgraded ${CARDS[oldCardId].name} to ${CARDS[CARDS[oldCardId].upgrades].name}`,
    );
    manager.root.afterNode();
  }
}
