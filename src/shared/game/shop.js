import { CARD_POOL, CARDS } from "../data/cards.js";
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
    .map((cardId, index) => ({
      offerId: `shop_card_${index}_${cardId}`,
      cardId,
      price: 50,
      sold: false,
    }));

  const ownedRelicIds = root.relicStates.map((entry) => entry.id);
  const availableRelics = START_RELIC_CHOICES.filter(
    (id) => !ownedRelicIds.includes(id),
  );
  const currentShopRelic =
    availableRelics.length > 0
      ? {
          offerId: `shop_relic_${availableRelics[0]}`,
          relicId: availableRelics[0],
          price: 100,
          sold: false,
        }
      : null;

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
