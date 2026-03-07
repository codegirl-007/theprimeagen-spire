export function showDamageNumber(damage, target, isPlayer = false) {
    const targetElement = isPlayer
        ? document.querySelector('.player-battle-zone')
        : document.querySelector('.enemy-battle-zone');

    if (!targetElement) return;

    const damageNumber = document.createElement('div');
    damageNumber.className = 'damage-number';
    damageNumber.textContent = damage;

    const rect = targetElement.getBoundingClientRect();
    damageNumber.style.left = `${rect.left + rect.width / 2}px`;
    damageNumber.style.top = `${rect.top + rect.height / 2}px`;

    document.body.appendChild(damageNumber);

    requestAnimationFrame(() => {
        damageNumber.classList.add('damage-number-animate');
    });

    setTimeout(() => {
        if (damageNumber.parentNode) {
            damageNumber.parentNode.removeChild(damageNumber);
        }
    }, 1000);
}

export function updateCardSelection(root) {
    root.app.querySelectorAll('.battle-card').forEach((card) => {
        card.classList.remove('card-selected');
    });

    if (root.selectedCardIndex !== null) {
        const selectedCard = root.app.querySelector(`[data-play="${root.selectedCardIndex}"]`);
        if (selectedCard) {
            selectedCard.classList.add('card-selected');
        }
    }
}

export function shuffle(array) {
    for (let index = array.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
    }
    return array;
}

export function getRelicArt(relicId, RELICS = null) {
    if (RELICS && RELICS[relicId]?.art) {
        const imagePath = RELICS[relicId].art;
        return `<img src="assets/skill-art/${imagePath}" alt="${relicId}" class="relic-skill-art">`;
    }
    return '💎';
}

export function getRelicName(relicId, RELICS = null) {
    return RELICS?.[relicId]?.name || relicId;
}

export function getRelicText(relicId, RELICS = null) {
    return RELICS?.[relicId]?.text || 'Unknown relic';
}

export function getCardArt(cardId, CARDS = null) {
    if (CARDS && CARDS[cardId]?.art) {
        const imagePath = CARDS[cardId].art;
        return `<img src="assets/skill-art/${imagePath}" alt="${cardId}" class="card-art-image">`;
    }

    return '<span>🃏</span>';
}

export function getEnemyArt(enemyId, ENEMIES = null) {
    const enemyData = ENEMIES?.[enemyId];
    const avatarPath = enemyData?.avatar || `assets/avatars/${enemyId}.png`;
    return `<img src="${avatarPath}" alt="${enemyId}" class="enemy-avatar-img">`;
}

export function getEnemyType(enemyId) {
    if (enemyId.includes('boss_')) return 'BOSS';
    if (enemyId.includes('elite_')) return 'ELITE';
    return 'ENEMY';
}

export function showMessagesModal() {
    document.dispatchEvent(new CustomEvent('show-messages-modal'));
}
