import { CARDS, CARD_POOL } from "../data/cards.js";

function shuffle(cards) {
  const next = cards.slice();
  for (let index = next.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function pickCards(count) {
  return shuffle(CARD_POOL)
    .slice(0, count)
    .map((cardId, index) => ({
      offerId: `rw_${index}_${cardId}`,
      cardId,
    }));
}

export function attachRewardFlow(root) {
  root.currentRewardChoices = null;

  root.enterRewardSelection = async function enterRewardSelection() {
    this.currentRewardChoices = pickCards(3);
    await this.stateMachine.setState("REWARD");
  };

  root.takeReward = async function takeReward(index) {
    const offer = this.currentRewardChoices?.[index];
    if (offer) {
      this.player.deck.push(offer.cardId);
      this.log(`Added card: ${CARDS[offer.cardId].name}`);
    }
    this.currentRewardChoices = null;
    this.scheduleSave();
    await this.stateMachine.setState("MAP");
  };

  root.skipReward = async function skipReward() {
    this.currentRewardChoices = null;
    this.scheduleSave();
    await this.stateMachine.setState("MAP");
  };
}
