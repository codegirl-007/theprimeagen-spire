import { CARDS, STARTER_DECK } from "../data/cards.js";

export function makePlayer() {
    return { maxHp: 70, hp: 70, block: 0, energy: 3, maxEnergy: 3, weak: 0, vuln: 0, relics: [], deck: [], draw: [], discard: [], hand: [], gold: 100 };
}

export function initDeck(player, extraIds = []) {
    player.deck = [...STARTER_DECK, ...extraIds];
    player.draw = shuffle(player.deck.slice());
    player.discard = [];
    player.hand = [];
}

export function draw(player, n = 5, battleCtx = null) {
    for (let i = 0; i < n; i++) {
        if (player.draw.length === 0) {
            if (player.discard.length === 0) break;
            player.draw = shuffle(player.discard);
            player.discard = [];
        }
        const id = player.draw.pop();
        const originalCard = CARDS[id];
        const clonedCard = cloneCard(originalCard);
        
        if (!originalCard) {
            console.error('Original card not found for id:', id);
            continue;
        }
        
        if (clonedCard) {
            player.hand.push(clonedCard);
            
            // Handle curse card draw effects
            if (battleCtx && originalCard.type === "curse" && originalCard.id === "sugar_crash") {
                player.energy = Math.max(0, player.energy - 1);
                battleCtx.log("Sugar Crash drains 1 energy when drawn!");
            }
        }
    }
}

export function endTurnDiscard(player) {
    player.discard.push(...player.hand.map(c => c.id));
    player.hand = [];
    player.block = 0;
    player.energy = player.maxEnergy;
}

// Peek at top N cards from draw pile without removing them
export function peekTopCards(player, n = 3) {
    const cards = [];
    const drawPile = [...player.draw]; // Copy to avoid modifying original
    
    for (let i = 0; i < n && i < drawPile.length; i++) {
        const cardId = drawPile[drawPile.length - 1 - i]; // Peek from top (end of array)
        const originalCard = CARDS[cardId];
        if (originalCard) {
            const clonedCard = cloneCard(originalCard);
            clonedCard._drawIndex = drawPile.length - 1 - i; // Store original position
            cards.push(clonedCard);
        }
    }
    
    return cards;
}

// Put a specific card on the bottom of the draw pile
export function putCardOnBottomOfDeck(player, cardId) {
    // Remove from draw pile first (if it's there)
    const drawIndex = player.draw.findIndex(id => id === cardId);
    if (drawIndex >= 0) {
        player.draw.splice(drawIndex, 1);
    }
    
    // Add to bottom of draw pile (beginning of array)
    player.draw.unshift(cardId);
}

// Add a specific card object to hand
export function addCardToHand(player, card) {
    player.hand.push(card);
}

export function cloneCard(c) {

    if (!c) {
        console.error('Attempting to clone null/undefined card');
        return null;
    }


    const cloned = {
        id: c.id,
        name: c.name,
        cost: c.cost,
        type: c.type,
        text: c.text,
        target: c.target,
        effect: c.effect,
        upgrades: c.upgrades,
        oncePerFight: c.oncePerFight,
        exhaust: c.exhaust,
        _used: false
    };

    return cloned;
}
export function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a; }
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

