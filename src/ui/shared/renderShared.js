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
    const container = root.battleUi?.handHost || root.app;
    const previousSelectedCard = root.battleUi?.selectedCardEl;
    if (previousSelectedCard?.isConnected) {
        previousSelectedCard.classList.remove('card-selected');
    }

    if (root.selectedCardIndex === null) {
        if (root.battleUi) {
            root.battleUi.selectedCardEl = null;
        }
        return;
    }

    const selectedCard = container.querySelector(`[data-play="${root.selectedCardIndex}"]`);
    if (selectedCard) {
        selectedCard.classList.add('card-selected');
    }

    if (root.battleUi) {
        root.battleUi.selectedCardEl = selectedCard || null;
    }
}

export function shuffle(array) {
    for (let index = array.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
    }
    return array;
}

function isConvertibleRasterPath(path) {
    return /\.(png|jpe?g)$/i.test(path);
}

function toWebpPath(path) {
    return path.replace(/\.(png|jpe?g)$/i, ".webp");
}

function getMimeType(path) {
    if (/\.png$/i.test(path)) {
        return "image/png";
    }
    if (/\.jpe?g$/i.test(path)) {
        return "image/jpeg";
    }
    return null;
}

function escapeAttribute(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function serializeAttributes(attributes) {
    return Object.entries(attributes)
        .filter(([, value]) => value !== undefined && value !== null && value !== false)
        .map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${escapeAttribute(value)}"`)
        .join("");
}

export function renderImage(path, alt, className = "", attributes = {}) {
    const imageAttributes = { ...attributes };
    if (className) {
        imageAttributes.class = className;
    }

    const serialized = serializeAttributes(imageAttributes);
    const escapedPath = escapeAttribute(path);
    const escapedAlt = escapeAttribute(alt);

    if (!isConvertibleRasterPath(path)) {
        return `<img src="${escapedPath}" alt="${escapedAlt}"${serialized}>`;
    }

    return `<picture><source srcset="${escapeAttribute(toWebpPath(path))}" type="image/webp"><img src="${escapedPath}" alt="${escapedAlt}"${serialized}></picture>`;
}

export function renderBackgroundImageStyle(path, extraDeclarations = []) {
    const declarations = [];

    if (path) {
        declarations.push(`background-image: url('${path}')`);
        if (isConvertibleRasterPath(path)) {
            const mimeType = getMimeType(path);
            declarations.push(`background-image: image-set(url('${toWebpPath(path)}') type('image/webp'), url('${path}') type('${mimeType}'))`);
        }
    }

    declarations.push(...extraDeclarations);
    return declarations.join("; ");
}

export function preferWebpPath(path) {
    return isConvertibleRasterPath(path) ? toWebpPath(path) : path;
}

export function getRelicArt(relicId, RELICS = null) {
    if (RELICS && RELICS[relicId]?.art) {
        const imagePath = RELICS[relicId].art;
        return renderImage(`assets/skill-art/${imagePath}`, relicId, "relic-skill-art");
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
        return renderImage(`assets/skill-art/${imagePath}`, cardId, "card-art-image");
    }

    return '<span>🃏</span>';
}

export function getEnemyArt(enemyId, ENEMIES = null) {
    const enemyData = ENEMIES?.[enemyId];
    const avatarPath = enemyData?.avatar || `assets/avatars/${enemyId}.png`;
    return renderImage(avatarPath, enemyId, "enemy-avatar-img");
}

export function getEnemyType(enemyId) {
    if (enemyId.includes('boss_')) return 'BOSS';
    if (enemyId.includes('elite_')) return 'ELITE';
    return 'ENEMY';
}

export function showMessagesModal() {
    document.dispatchEvent(new CustomEvent('show-messages-modal'));
}
