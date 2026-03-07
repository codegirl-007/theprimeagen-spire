import { PlayCardCommand } from "../../commands/PlayCardCommand.js";
import { EndTurnCommand } from "../../commands/EndTurnCommand.js";

export function handleCardPlay(manager, element) {
  if (!element.classList.contains("playable")) return;

  const index = parseInt(element.dataset.play, 10);
  const card = manager.root.player.hand[index];

  if (!card) return;
  if (manager.root.player.energy < card.cost) return;

  try {
    manager.playSound("played-card.mp3");
    const command = new PlayCardCommand(manager.root, index);
    const success = manager.root.commandInvoker.execute(command);

    if (success) {
      manager.root.selectedCardIndex = null;
      if (manager.root.ui?.updateCardSelection) {
        manager.root.ui.updateCardSelection(manager.root);
      }
    }
  } catch (error) {
    console.error("Error playing card:", error);
  }
}

export function handleEndTurn(manager) {
  try {
    const command = new EndTurnCommand(manager.root);
    const success = manager.root.commandInvoker.execute(command);

    if (success) {
      manager.root.selectedCardIndex = null;
      if (manager.root.ui?.updateCardSelection) {
        manager.root.ui.updateCardSelection(manager.root);
      }
    }
  } catch (error) {
    console.error("Error ending turn:", error);
  }
}

export function handleBattleCardShortcut(manager, cardIndex) {
  const card = manager.root.player.hand[cardIndex];
  if (!card) {
    return;
  }

  if (manager.root.selectedCardIndex === cardIndex) {
    if (manager.root.player.energy >= card.cost) {
      const cardElement = manager.root.app.querySelector(
        `[data-play="${cardIndex}"]`,
      );
      if (cardElement) {
        handleCardPlay(manager, cardElement);
      }
    }
    return;
  }

  manager.root.selectedCardIndex = cardIndex;
  if (manager.root.ui?.updateCardSelection) {
    manager.root.ui.updateCardSelection(manager.root);
  }
  manager.playSound("swipe.mp3");
}
