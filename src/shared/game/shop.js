import { CARD_POOL, CARDS } from "../../data/cards.js";
import { START_RELIC_CHOICES, RELICS } from "../data/relics.js";

function shuffle(cards) {
  const next = cards.slice();
  for (let index = next.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function generateShopInventory(root) {
  const availableCards = CARD_POOL.filter((cardId) => {
    const ownedCount = root.player.deck.filter(
      (deckCardId) => deckCardId === cardId,
    ).length;
    return ownedCount < 3;
  });

  const cardsToShow = availableCards.length >= 3 ? availableCards : CARD_POOL;
  const currentShopCards = shuffle(cardsToShow)
    .slice(0, 3)
    .map((id) => CARDS[id]);

  const ownedRelicIds = root.relicStates.map((entry) => entry.id);
  const availableRelics = START_RELIC_CHOICES.filter(
    (id) => !ownedRelicIds.includes(id),
  );
  const currentShopRelic =
    availableRelics.length > 0 ? RELICS[availableRelics[0]] : null;

  return {
    currentShopCards,
    currentShopRelic,
  };
}

export function ensureShopInventory(root) {
  if (root.currentShopCards && root.currentShopRelic !== undefined) {
    return;
  }

  const inventory = generateShopInventory(root);
  root.currentShopCards = inventory.currentShopCards;
  root.currentShopRelic = inventory.currentShopRelic;
}
