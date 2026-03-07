import {
    showDamageNumber,
    updateCardSelection,
    getCardArt,
    getEnemyArt,
    getEnemyType
} from "../../ui/shared/renderShared.js";

export { showDamageNumber, updateCardSelection };

export async function renderBattle(root) {
    const app = root.app;
    const p = root.player;
    const e = root.enemy;

    const { ENEMIES } = await import("../../data/enemies.js");
    const { CARDS } = await import("../../data/cards.js");
    const enemyData = ENEMIES[e.id];
    const backgroundImage = enemyData?.background || null;

    const intentInfo = {
        attack: { emoji: '', text: `Will attack for ${e.intent.value} damage`, color: 'danger' },
        block: { emoji: '', text: `Will gain ${e.intent.value} block`, color: 'info' },
        debuff: { emoji: '', text: 'Will apply a debuff', color: 'warning' },
        heal: { emoji: '', text: `Will heal for ${e.intent.value} HP`, color: 'success' }
    }[e.intent.type] || { emoji: '', text: 'Unknown intent', color: 'neutral' };

    app.innerHTML = `
    <div class="battle-scene">

      <div class="battle-arena" ${backgroundImage ? `style="background-image: url('${backgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;"` : ''}>
      
      <div class="enemy-battle-zone">
        <div class="enemy-container">

          <div class="enemy-character">
            <div class="enemy-sprite">
              <div class="enemy-avatar">${getEnemyArt(e.id, ENEMIES)}</div>
              <div class="enemy-shadow"></div>
              ${e.block > 0 ? `<div class="shield-effect"><img src="assets/card-art/shield.png" alt="Shield" class="shield-effect-img"></div>` : ''}
              ${e.weak > 0 ? `<div class="debuff-effect"><img src="assets/card-art/heart_damaged.png" alt="Weak" class="debuff-effect-img"></div>` : ''}
            </div>
          </div>


          <div class="enemy-ui-panel">
            <div class="enemy-nameplate">
              <h2 class="enemy-title">${e.name}</h2>
              <div class="enemy-level">${getEnemyType(e.id)}</div>
    </div>
            <div class="enemy-health-section">
              <div class="health-bar-container">
                <div class="health-bar enemy-health">
                  <div class="health-fill" style="width: ${(e.hp / e.maxHp) * 100}%"></div>
                  <div class="health-text">${e.hp} / ${e.maxHp}</div>
                  <div class="health-glow"></div>
                </div>
              </div>
              ${e.block > 0 ? `
                <div class="status-effect block-status">
                  <img src="assets/card-art/shield.png" alt="Block" class="status-icon-img">
                  <span class="status-value">${e.block}</span>
                  <span class="status-label">Block</span>
                </div>
              ` : ''}
            </div>

            <div class="intent-panel intent-${intentInfo.color}">
              <div class="intent-header">
                <span class="intent-label">Next Action</span>
              </div>
              <div class="intent-content">
                <div class="intent-icon-large">${intentInfo.emoji}</div>
                <div class="intent-description">${intentInfo.text}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="player-battle-zone">
        <div class="player-container">

          <div class="player-character">
            <div class="player-sprite">
              <div class="player-avatar">
                <img src="assets/prime.webp" alt="Prime" class="player-avatar-img" />
              </div>
              <div class="player-shadow"></div>
              ${p.block > 0 ? `<div class="shield-effect"><img src="assets/card-art/shield.png" alt="Shield" class="shield-effect-img"></div>` : ''}
              ${p.weak > 0 ? `<div class="debuff-effect"><img src="assets/card-art/heart_damaged.png" alt="Weak" class="debuff-effect-img"></div>` : ''}
            </div>
          </div>


          <div class="player-ui-panel">
            <div class="player-nameplate">
              <h2 class="player-title">ThePrimeagen</h2>
              <div class="player-level">PLAYER</div>
            </div>

            <div class="player-health-section">
              <div class="health-bar-container">
                <div class="health-bar player-health">
                  <div class="health-fill" style="width: ${(p.hp / p.maxHp) * 100}%"></div>
                  <div class="health-text">${p.hp} / ${p.maxHp}</div>
                  <div class="health-glow"></div>
                </div>
              </div>
              ${p.block > 0 ? `
                <div class="status-effect block-status">
                  <img src="assets/card-art/shield.png" alt="Block" class="status-icon-img">
                  <span class="status-value">${p.block}</span>
                  <span class="status-label">Block</span>
                </div>
              ` : ''}
              ${p.weak > 0 ? `
                <div class="status-effect weak-status">
                  <img src="assets/card-art/heart_damaged.png" alt="Weak" class="status-icon-img">
                  <span class="status-value">${p.weak}</span>
                  <span class="status-label">Weak</span>
                </div>
              ` : ''}
            </div>

            <div class="player-energy-section">
              <div class="energy-display">
                <span class="energy-label">⚡</span>
                <div class="energy-orbs">
                  ${Array.from({ length: p.maxEnergy }, (_, i) =>
        `<div class="energy-orb ${i < p.energy ? 'active' : 'inactive'}"></div>`
    ).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div class="battle-action-zone">
        <div class="hand-area">
          <div class="hand-header">
            <div class="deck-counters">
            </div>
          </div>
          
          <div class="cards-battlefield">
            ${p.hand.length === 0 ?
            '<div class="no-cards-message">🎴 No cards in hand - End turn to draw new cards</div>' :
            p.hand.map((card, i) => {
                const canPlay = p.energy >= card.cost;
                const cardType = card.type === 'attack' ? 'attack' : card.type === 'skill' ? 'skill' : 'power';
                return `
                  <div class="battle-card ${cardType} ${!canPlay ? 'unplayable' : 'playable'}" data-play="${i}">
                    <div class="card-glow"></div>
                    <div class="card-frame">
                      <div class="card-header-row">
                        <div class="card-title">${card.name}</div>
                        <div class="card-cost-orb ${!canPlay ? 'insufficient' : ''}">${card.cost}</div>
                      </div>
                      
                      <div class="card-artwork">
                        <div class="card-art-icon">${getCardArt(card.id, CARDS)}</div>
                        <div class="card-type-badge ${cardType}">${card.type}</div>
                      </div>
                      
                      <div class="card-description-box">
                        <div class="card-text">${card.text}</div>
                      </div>
                    </div>
                    ${!canPlay ? `<div class="card-disabled-overlay"><span>Need ${card.cost} energy</span></div>` : ''}
                  </div>
                `;
            }).join('')
        }
          </div>

          <div class="hand-controls">
            <button class="end-turn-btn" data-action="end">
              <span class="end-turn-text">End Turn</span>
              <span class="end-turn-hotkey">E</span>
          </button>
          </div>
        </div>


    </div>

      <div class="fight-log-panel">
        <div class="fight-log-header">
          <span class="fight-log-title">Combat Log</span>
        </div>
        <div class="fight-log-content" id="fight-log-content">
          ${root.logs.slice(-20).map((log) => `<div class="log-entry">${log}</div>`).join('')}
        </div>
      </div>
    </div>
  `;

    if (root.inputManager) {
        root.inputManager.setupCardHoverSounds();
    }

    if (root.selectedCardIndex === undefined) {
        root.selectedCardIndex = null;
    }

    const logContent = document.getElementById('fight-log-content');
    if (logContent) {
        logContent.scrollTop = logContent.scrollHeight;
    }

    updateCardSelection(root);
}
