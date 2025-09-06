
// Simple audio utility
function playSound(soundFile) {
    try {
        const audio = new Audio(`assets/sounds/${soundFile}`);
        audio.volume = 0.3;
        audio.play().catch(e => { console.log(e) }); // Silently fail if no audio
    } catch (e) {
        // Silently fail if audio not available
    }
}

async function showMessagesModal() {
    const { getAllMessages } = await import("../data/messages.js");
    const messages = getAllMessages();

    const modal = document.createElement('div');
    modal.className = 'messages-modal-overlay';
    modal.innerHTML = `
        <div class="messages-modal">
            <div class="messages-modal-header">
                <h2>Messages for Prime</h2>
                <button class="messages-close-btn" aria-label="Close">×</button>
            </div>
            <div class="messages-modal-content">
                ${messages.length > 0 ? messages.map((msg, index) => `
                    <div class="message-item">
                        <div class="message-from">From: ${msg.from}</div>
                        <div class="message-text">${msg.message}</div>
                    </div>
                `).join('') : `
                    <div class="no-messages-placeholder">
                        <p>No messages added yet!</p>
                        <p>Add your birthday messages to <code>src/data/messages.js</code></p>
                    </div>
                `}
            </div>
        </div>
    `;

    // Close functionality
    const closeModal = () => {
        modal.remove();
    };

    const closeBtn = modal.querySelector('.messages-close-btn');
    closeBtn.addEventListener('click', closeModal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Add to DOM
    document.body.appendChild(modal);
}


export function showDamageNumber(damage, target, isPlayer = false) {
    const targetElement = isPlayer ?
        document.querySelector('.player-battle-zone') :
        document.querySelector('.enemy-battle-zone');

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

export async function renderBattle(root) {
    const app = root.app;
    const p = root.player, e = root.enemy;


    const { ENEMIES } = await import("../data/enemies.js");
    const { CARDS } = await import("../data/cards.js");
    const { RELICS } = await import("../data/relics.js");
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
          ${root.logs.slice(-20).map(log => `<div class="log-entry">${log}</div>`).join('')}
        </div>
      </div>
    </div>
  `;

    // Event listeners are now handled by InputManager
    // Set up card hover sounds through InputManager
    if (root.inputManager) {
        root.inputManager.setupCardHoverSounds();
    }

    // Initialize card selection state if not exists
    if (!root.selectedCardIndex) {
        root.selectedCardIndex = null;
    }

    window.onkeydown = (e) => {
        if (e.key.toLowerCase() === "e") {
            try {
                root.end();
            } catch (error) {
                console.error("Error ending turn via keyboard:", error);
            }
        }

        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= p.hand.length) {
            const cardIndex = n - 1;
            const card = p.hand[cardIndex];

            if (root.selectedCardIndex === cardIndex) {
                // Second press of same key - play the card
                if (p.energy >= card.cost) {
                    root.play(cardIndex);
                    root.selectedCardIndex = null; // Clear selection
                    updateCardSelection(root);
                }
            } else {
                // First press or different key - select the card
                root.selectedCardIndex = cardIndex;
                updateCardSelection(root);
                playSound('swipe.mp3'); // Play swipe sound on keyboard selection
            }
        }
    };

    // Auto-scroll fight log to bottom
    const logContent = document.getElementById('fight-log-content');
    if (logContent) {
        logContent.scrollTop = logContent.scrollHeight;
    }

    // Apply initial card selection visual state
    updateCardSelection(root);
}

export async function renderMap(root) {
    const { CARDS } = await import("../data/cards.js");
    const { ENEMIES } = await import("../data/enemies.js");
    const { RELICS } = await import("../data/relics.js");
    const { getAllMessages } = await import("../data/messages.js");
    const m = root.map;
    const currentId = root.nodeId;

    const currentNode = m.nodes.find(n => n.id === currentId);
    const nextIds = currentNode ? currentNode.next : [];

    const getNodeEmoji = (kind) => {
        const emojis = {
            start: '<img src="assets/card-art/staff.png" alt="Start" class="node-icon-img">',
            battle: '<img src="assets/card-art/crossed_swords.png" alt="Battle" class="node-icon-img">',
            elite: '<img src="assets/card-art/crown.png" alt="Battle" class="node-icon-img">',
            boss: '<img src="assets/card-art/skull.png" alt="Boss" class="node-icon-img">',
            rest: '<img src="assets/card-art/potion_heal.png" alt="Rest" class="node-icon-img">',
            shop: '<img src="assets/card-art/diamond.png" alt="Shop" class="node-icon-img">',
            event: '<img src="assets/card-art/crystal_cluster.png" alt="Event" class="node-icon-img">'
        };
        return emojis[kind] || '❓';
    };

    const getNodeDescription = (node) => {
        switch (node.kind) {
            case 'start':
                return '<strong>Starting Point</strong>\nBegin your journey up ThePrimeagen Spire';
            case 'battle':
                const enemy = ENEMIES[node.enemy];
                return `<strong>Battle</strong>\nFight: ${enemy?.name || 'Unknown Enemy'}\nHP: ${enemy?.maxHp || '?'}`;
            case 'elite':
                const elite = ENEMIES[node.enemy];
                return `<strong>Elite Battle</strong>\nFight: ${elite?.name || 'Unknown Elite'}\nHP: ${elite?.maxHp || '?'}\nTough enemy with better rewards`;
            case 'boss':
                const boss = ENEMIES[node.enemy];
                return `<strong>Boss Battle</strong>\nFight: ${boss?.name || 'Unknown Boss'}\nHP: ${boss?.maxHp || '?'}\nFinal challenge of the act`;
            case 'rest':
                return '<strong>Rest Site</strong>\nHeal up to 30% max HP\nor upgrade a card';
            case 'shop':
                return '<strong>Shop</strong>\nSpend your hard-earned gold';
            case 'event':
                return '<strong>Random Event</strong>\nBirthday-themed encounter\nUnknown outcome\nPotential rewards or challenges';
            default:
                return '<strong>Unknown</strong>\nMysterious node';
        }
    };

    const getNodeTooltipData = (node) => {
        const description = getNodeDescription(node);
        let avatarPath = null;

        if (['battle', 'elite', 'boss'].includes(node.kind) && node.enemy) {
            const enemy = ENEMIES[node.enemy];
            if (enemy?.avatar) {
                avatarPath = enemy.avatar;
            }
        }

        return { description, avatarPath };
    };

    root.app.innerHTML = `
    <div class="map-screen">
      <div class="map-header-section">
        <button class="messages-button" data-action="show-messages">
          Inbox
          <span class="message-count-badge">${getAllMessages().length}</span>
        </button>
        <div class="game-logo">
          <svg width="600" height="240" viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
            <defs>

              <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ff8c00;stop-opacity:1" />
              </linearGradient>

              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                <feOffset dx="1" dy="1" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <text x="300" y="80" text-anchor="middle" font-family="'Kreon', serif" font-size="55" font-weight="700" fill="url(#textGradient)" filter="url(#glow)">
              ThePrimeagen
            </text>

            <text x="300" y="170" text-anchor="middle" font-family="'Kreon', serif" font-size="85" font-weight="700" fill="url(#textGradient)" filter="url(#shadow) url(#glow)">
              Spire
            </text>
          </svg>
        </div>
      </div>
      
      <div class="player-status">
        <div class="status-item">
          <img src="assets/card-art/heart.png" alt="Health" class="status-icon-img">
          <div class="hp-bar player-hp" style="width: 80px;">
            <div class="hp-fill" style="width: ${(root.player.hp / root.player.maxHp) * 100}%"></div>
            <span class="hp-text">${root.player.hp}/${root.player.maxHp}</span>
          </div>
        </div>
        <div class="status-item">
          <img src="assets/card-art/bag_of_gold.png" alt="Gold" class="status-icon-img">
          <span class="status-value">${root.player.gold || 0}</span>
        </div>
        <div class="status-item">
          <img src="assets/card-art/book.png" alt="Deck" class="status-icon-img">
          <span class="status-value">${root.player.deck.length} cards</span>
        </div>
        ${root.relicStates.length > 0 ? `
        <div class="status-item relics-status">
          <img src="assets/card-art/runestone.png" alt="Relics" class="status-icon-img">
          <div class="relics-inline">
            ${root.relicStates.map(r => `
              <div class="relic-inline" title="${getRelicText(r.id, RELICS)}">
                ${getRelicArt(r.id, RELICS)}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        <button class="btn-reset-status" data-reset>
          Start New Run
        </button>
      </div>


      <div class="main-content">
        <div class="map-section">

          <div class="welcome-panel">
            <div class="birthday-message">
              <h2>Happy Birthday Prime!</h2>
              <p>With coffee in hand and code on your side,<br>
ThePrimeagen Spire’s a treacherous ride.  <br>
Gremlins await and errors conspire,  <br>
But cake lies ahead at the top of the Spire. </p>
            </div>
            
            <div class="map-instructions">
              <h3>How to Navigate the Spire</h3>
              <ul>
                <li><strong>Click a node</strong> to climb the way</li>
                <li><strong>Choose your battles</strong> night or day</li>
                <li><strong>Rest at fires</strong>, heal or train</li>
                <li><strong>Each new card</strong> will grow your gain. </li>
                <li><strong>At the summit</strong> face the fight</li>
                <li><strong>Defeat the boss</strong>, win the night</li>
              </ul>
              
              <div class="birthday-wish">
                <p><em>Courage, dear heart.</em></p>
              </div>
            </div>
          </div>
          <div class = "map-act-container">
          <div class="act-progress-indicator">
            <div class="act-progress-bar">
              <div class="act-step ${root.currentAct === 'act1' ? 'current' : 'completed'}">
                <div class="act-number">Act I</div>
                <div class="act-name">I'm doing a startup!</div>
              </div>
              <div class="act-connector ${root.currentAct === 'act2' ? 'active' : ''}"></div>
              <div class="act-step ${root.currentAct === 'act2' ? 'current' : root.currentAct === 'act1' ? 'locked' : 'completed'}">
                <div class="act-number">Act II</div>
                <div class="act-name">Look dad, we made it!</div>
              </div>
            </div>
          </div>
          
          <div class="spire-map">

          <div class="map-legend-overlay">
            <div class="legend-title">Legend</div>
            <div class="legend-item"><img src="assets/card-art/potion_heal.png" alt="Rest" class="legend-icon-img"> Rest</div>
            <div class="legend-item"><img src="assets/card-art/crossed_swords.png" alt="Battle" class="legend-icon-img"> Enemy</div>
            <div class="legend-item"><img src="assets/card-art/crown.png" alt="Battle" class="legend-icon-img"> Elite</div>
            <div class="legend-item"><img src="assets/card-art/skull.png" alt="Battle" class="legend-icon-img"> Boss</div>
            <div class="legend-item"><img src="assets/card-art/crystal_cluster.png" alt="Event" class="legend-icon-img"> Events</div>
            <div class="legend-item"><img src="assets/card-art/diamond.png" alt="Shop" class="legend-icon-img"> Shop</div>
          </div>
          <svg class="spire-paths" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid meet">

            ${(() => {
            // Use positions directly from the map data
            const getNodePos = (nodeId) => {
                const node = m.nodes.find(n => n.id === nodeId);
                return node ? { x: node.x, y: node.y } : null;
            };

            return m.nodes.map(node => {
                if (!node.next || node.next.length === 0) return '';

                return node.next.map(nextId => {
                    const fromPos = { x: node.x, y: node.y };
                    const toPos = getNodePos(nextId);
                    if (!fromPos || !toPos) return '';

                    const isActivePath = (node.id === currentId && nextIds.includes(nextId)) ||
                        (parseInt(nextId.replace('n', '')) <= parseInt(currentId.replace('n', '')));

                    return `<line x1="${fromPos.x}" y1="${fromPos.y}" x2="${toPos.x}" y2="${toPos.y}" 
                                       class="spire-path ${isActivePath ? 'active' : ''}" 
                                       stroke="${isActivePath ? '#8B7355' : '#4A3A2A'}" 
                                       stroke-width="2" 
                                       stroke-dasharray="8,4"
                                       opacity="${isActivePath ? '1' : '0.6'}"/>`;
                }).join('');
            }).join('');
        })()}
          </svg>
          
          <div class="spire-nodes">
            ${(() => {
            // Use positions directly from map data

            return m.nodes.map(n => {
                const isNext = nextIds.includes(n.id);
                const isCurrent = n.id === currentId;
                const isCompleted = root.completedNodes.includes(n.id);
                const locked = (!isNext && !isCurrent && !isCompleted);

                const pos = { x: n.x, y: n.y };
                if (!pos.x || !pos.y) return '';

                const leftPercent = (pos.x / 1000) * 100;
                const topPercent = (pos.y / 800) * 100;
                const tooltipData = getNodeTooltipData(n);

                return `
                  <div class="spire-node ${isCurrent ? 'current' : ''} ${isNext ? 'available' : ''} ${isCompleted ? 'completed' : ''} ${locked ? 'locked' : ''}" 
                       style="left: ${leftPercent}%; top: ${topPercent}%; transform: translate(-50%, -50%);"
                       data-node="${isNext ? n.id : ''}"
                       data-tooltip="${tooltipData.description.replace(/\n/g, '<br>')}"
                       data-avatar="${tooltipData.avatarPath || ''}"
                       onmouseenter="showTooltip(event)" 
                       onmouseleave="hideTooltip()">
                    <div class="node-background ${n.kind}"></div>
                    <div class="node-content">
                      <div class="node-icon">${getNodeEmoji(n.kind)}</div>
                    </div>
                    ${isCurrent ? '<div class="current-indicator">★</div>' : ''}
                  </div>
                `;
            }).join('');
        })()}
          </div>
        </div>
      </div>
      </div>

      <div class="deck-stack-container">
        <div class="deck-stack-header">
          <span class="deck-count">Your deck</span>
        </div>
        <div class="deck-stack" data-tooltip="Hover to view deck">
          ${Object.entries(
            root.player.deck.reduce((acc, cardId) => {
                acc[cardId] = (acc[cardId] || 0) + 1;
                return acc;
            }, {})
        ).map(([cardId, count], index) => {
            const card = CARDS[cardId];
            if (!card) return '';

            const cardType = card.type === 'attack' ? 'attack' : card.type === 'skill' ? 'skill' : 'power';

            return `
              <div class="deck-stack-card ${cardType}" style="--card-index: ${index}">
                  <div class="card-frame">
                    <div class="card-header-row">
                      <div class="card-title">${card.name}</div>
                      <div class="card-cost-orb">${card.cost}</div>
                    </div>
                    <div class="card-art">${getCardArt(cardId, CARDS)}</div>
                  <div class="card-description-box">
                    <div class="card-text">${card.text}</div>
                  </div>
                    ${count > 1 ? `<div class="card-count-badge">×${count}</div>` : ''}
                </div>
              </div>
            `;
        }).join('')}
        </div>
        </div>
    </div>
      <div id="custom-tooltip" class="custom-tooltip"></div>

    </div>
  `;

    // Event listeners are now handled by InputManager

    window.showTooltip = function(event) {
        const tooltip = document.getElementById('custom-tooltip');
        const node = event.target.closest('.spire-node');
        const content = node.dataset.tooltip;
        const avatarPath = node.dataset.avatar;

        let tooltipHTML = '';
        if (avatarPath) {
            tooltipHTML = `
                <div class="tooltip-with-avatar">
                    <div class="tooltip-avatar">
                        <img src="${avatarPath}" alt="Enemy Avatar" class="tooltip-avatar-img" 
                             onerror="this.style.display='none';">
                    </div>
                    <div class="tooltip-content">${content}</div>
                </div>
            `;
        } else {
            tooltipHTML = content;
        }

        tooltip.innerHTML = tooltipHTML;
        tooltip.style.display = 'block';


        const rect = node.getBoundingClientRect();
        tooltip.style.left = (rect.right + 15) + 'px';
        tooltip.style.top = (rect.top + rect.height / 2 - tooltip.offsetHeight / 2) + 'px';


        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = (rect.left - tooltip.offsetWidth - 15) + 'px';
        }
        if (tooltipRect.top < 0) {
            tooltip.style.top = '10px';
        }
        if (tooltipRect.bottom > window.innerHeight) {
            tooltip.style.top = (window.innerHeight - tooltip.offsetHeight - 10) + 'px';
        }
    };

    window.hideTooltip = function() {
        const tooltip = document.getElementById('custom-tooltip');
        tooltip.style.display = 'none';
    };


    // Event listeners are now handled by InputManager
}

export async function renderReward(root, choices) {
    const { CARDS } = await import("../data/cards.js");
    root.app.innerHTML = `
    <div class="reward-screen">
      <h1>Choose a Card</h1>
      <div class="reward-cards-container">
        ${choices.map((c, idx) => {
        const cardType = c.type === 'attack' ? 'attack' : c.type === 'skill' ? 'skill' : 'power';
        return `
            <div class="reward-card-wrapper" data-pick="${idx}">
              <div class="battle-card ${cardType} reward-card">
                <div class="card-glow"></div>
                <div class="card-frame">
                  <div class="card-header-row">
                    <div class="card-title">${c.name}</div>
                    <div class="card-cost-orb">${c.cost}</div>
    </div>
                  
                  <div class="card-artwork">
                    <div class="card-art-icon">${getCardArt(c.id, CARDS)}</div>
                    <div class="card-type-badge ${cardType}">${c.type}</div>
                  </div>
                  
                  <div class="card-description-box">
                    <div class="card-text">${c.text}</div>
                  </div>
                  
                  <div class="card-select-hint">Click to select</div>
                </div>
              </div>
            </div>
          `;
    }).join("")}
      </div>
      <div class="reward-actions">
        <button class="btn secondary skip-btn" data-skip>Skip Reward</button>
      </div>
    </div>
  `;
    // Event listeners are now handled by InputManager
}

export async function renderRest(root) {
    const { CARDS } = await import("../data/cards.js");
    root.app.innerHTML = `
    <div class="rest-screen">
      <div class="rest-header">
        <h1>Rest and Recover</h1>
        <p>Take a moment to restore your strength</p>
      </div>
      
      <div class="rest-options">
        <button class="rest-option" data-act="heal">
          <div class="rest-icon">
            <img src="assets/card-art/heart.png" alt="Heal" class="rest-icon-img">
          </div>
          <div class="rest-content">
            <h3>Rest and Heal</h3>
            <p>Restore 20% of your maximum health</p>
          </div>
        </button>
        
        <button class="rest-option" data-act="upgrade">
          <div class="rest-icon">
            <img src="assets/card-art/scroll.png" alt="Upgrade" class="rest-icon-img">
          </div>
          <div class="rest-content">
            <h3>Upgrade a Card</h3>
            <p>Permanently improve one of your cards</p>
          </div>
        </button>
      </div>
    </div>
  `;
    // Event listeners are now handled by InputManager
}

export function renderUpgrade(root) {
    import("../data/cards.js").then(({ CARDS }) => {
        const upgradableCards = root.player.deck
            .map((cardId, index) => ({ cardId, index }))
            .filter(({ cardId }) => {
                const card = CARDS[cardId];

                return card?.upgrades && !cardId.endsWith('+');
            })
            .slice(0, 3); // Show max 3 options

        if (upgradableCards.length === 0) {
            root.log("No cards can be upgraded.");
            root.afterNode();
            return;
        }

        root.app.innerHTML = `
        <div class="upgrade-screen">
          <div class="upgrade-header">
        <h1>⬆️ Upgrade a Card</h1>
            <p>Select a card from your deck to permanently improve it</p>
          </div>
          
          <div class="upgrade-options">
          ${upgradableCards.map(({ cardId, index }) => {
            const card = CARDS[cardId];
            const upgradedCard = CARDS[card.upgrades];

            if (!upgradedCard) {
                return ''; // Skip if no upgrade found
            }

            return `
                <div class="upgrade-option" data-upgrade="${index}">
                  <div class="upgrade-preview">
                    <div class="upgrade-action-header">
                      <h3>🔧 Upgrade ${card.name}</h3>
                      <p>Click to permanently improve this card</p>
                    </div>
                    
                    <div class="upgrade-comparison">
                      <div class="upgrade-card-container">
                        <div class="upgrade-card-label">Current</div>
                        <div class="battle-card ${card.type} playable upgrade-card-before">
                          <div class="card-glow"></div>
                          <div class="card-frame">
                            <div class="card-header-row">
                              <div class="card-title">${card.name}</div>
                              <div class="card-cost-orb">${card.cost}</div>
                            </div>
                            
                            <div class="card-artwork">
                              <div class="card-art-icon">${getCardArt(card.id, CARDS)}</div>
                              <div class="card-type-badge ${card.type}">${card.type}</div>
                            </div>
                            
                            <div class="card-description-box">
                              <div class="card-text">${card.text}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div class="upgrade-card-container">
                        <div class="upgrade-card-label">Upgraded</div>
                        <div class="battle-card ${upgradedCard.type} playable upgrade-card-after">
                          <div class="card-glow"></div>
                          <div class="card-frame">
                            <div class="card-header-row">
                              <div class="card-title">${upgradedCard.name}</div>
                              <div class="card-cost-orb">${upgradedCard.cost}</div>
                            </div>
                            
                            <div class="card-artwork">
                              <div class="card-art-icon">${getCardArt(upgradedCard.id, CARDS)}</div>
                              <div class="card-type-badge ${upgradedCard.type}">${upgradedCard.type}</div>
                            </div>
                            
                            <div class="card-description-box">
                              <div class="card-text">${upgradedCard.text}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            `;
        }).join("")}
        </div>
          
          <div class="upgrade-actions">
            <button class="upgrade-skip" data-skip>Skip Upgrade</button>
          </div>
        </div>
      `;

        root.app.querySelectorAll("[data-upgrade]").forEach(btn => {
            btn.addEventListener("click", () => {
                const deckIndex = parseInt(btn.dataset.upgrade, 10);
                const oldCardId = root.player.deck[deckIndex];
                const newCardId = CARDS[oldCardId].upgrades;
                root.player.deck[deckIndex] = newCardId;
                root.log(`Upgraded ${CARDS[oldCardId].name} → ${CARDS[newCardId].name}`);
                root.afterNode();
            });
        });
        root.app.querySelector("[data-skip]").addEventListener("click", () => root.afterNode());
    });
}

export function renderShop(root) {
    import("../data/cards.js").then(({ CARDS, CARD_POOL }) => {
        import("../data/relics.js").then(({ RELICS, START_RELIC_CHOICES }) => {

            const availableCards = CARD_POOL.filter(cardId => {

                const ownedCount = root.player.deck.filter(deckCardId => deckCardId === cardId).length;

                return ownedCount < 3;
            });

            const cardsToShow = availableCards.length >= 3 ? availableCards : CARD_POOL;
            const shopCards = shuffle(cardsToShow.slice()).slice(0, 3).map(id => CARDS[id]);
            const ownedRelicIds = root.relicStates.map(r => r.id);
            const availableRelics = START_RELIC_CHOICES.filter(id => !ownedRelicIds.includes(id));
            const shopRelic = availableRelics.length > 0 ? RELICS[availableRelics[0]] : null;

            // Store shop cards for InputManager access
            root.currentShopCards = shopCards;
            root.currentShopRelic = shopRelic;

            root.app.innerHTML = `
            <div class="shop-screen">
              <div class="shop-header">
                <h1>Merchant's Shop</h1>
                <p>Spend your hard-earned gold on powerful upgrades</p>
                <div class="player-gold">
                  <img src="assets/card-art/bag_of_gold.png" alt="Gold" class="gold-icon">
                  <span class="gold-amount">${root.player.gold || 100}</span>
              </div>
            </div>
              
              <div class="shop-inventory">
                <div class="shop-section">
                  <div class="shop-section-header">
                    <h2>Cards for Sale</h2>
                    <p>50 gold each</p>
                  </div>
                  <div class="shop-cards">
                    ${shopCards.map((card, idx) => {
                const cardType = card.type === 'attack' ? 'attack' : card.type === 'skill' ? 'skill' : 'power';
                const canAfford = (root.player.gold || 100) >= 50;
                const ownedCount = root.player.deck.filter(deckCardId => deckCardId === card.id).length;
                return `
                        <div class="shop-card-container">
                          <div class="battle-card ${cardType} ${canAfford ? 'playable' : 'unplayable'} shop-card" data-buy-card="${idx}">
                            <div class="card-glow"></div>
                            <div class="card-frame">
                              <div class="card-header-row">
                                <div class="card-title">${card.name}</div>
                                <div class="card-cost-orb">${card.cost}</div>
                              </div>
                              
                              <div class="card-artwork">
                                <div class="card-art-icon">${getCardArt(card.id, CARDS)}</div>
                                <div class="card-type-badge ${cardType}">${card.type}</div>
                              </div>
                              
                              <div class="card-description-box">
                                <div class="card-text">${card.text}</div>
                              </div>
                            </div>
                            <div class="shop-card-price">
                              <img src="assets/card-art/bag_of_gold.png" alt="Gold" class="price-icon">
                              <span>50</span>
                            </div>
                            ${ownedCount > 0 ? `<div class="card-owned-indicator">Owned: ${ownedCount}</div>` : ''}
                            ${!canAfford ? `<div class="card-disabled-overlay"><span>Need 50 gold</span></div>` : ''}
                          </div>
                        </div>
                      `;
            }).join("")}
                  </div>
                </div>
                
            ${shopRelic ? `
                <div class="shop-section">
                  <div class="shop-section-header">
                    <h2>Mystical Relic</h2>
                    <p>100 gold</p>
                  </div>
                  <div class="shop-relics">
                    <div class="shop-relic-container">
                      <div class="shop-relic ${(root.player.gold || 100) >= 100 ? 'affordable' : 'unaffordable'}" data-buy-relic>
                        <div class="relic-icon">${getRelicArt(shopRelic.id, RELICS)}</div>
                        <div class="relic-info">
                          <h3>${shopRelic.name}</h3>
                          <p>${shopRelic.text}</p>
                        </div>
                        <div class="shop-relic-price">
                          <img src="assets/card-art/bag_of_gold.png" alt="Gold" class="price-icon">
                          <span>100</span>
                        </div>
                      </div>
                    </div>
                  </div>
            </div>
            ` : ''}
              </div>
              
              <div class="shop-actions">
                <button class="shop-leave-btn" data-leave>
                  <img src="assets/card-art/exit.png" alt="Leave" class="leave-icon">
                  <span>Leave Shop</span>
                </button>
              </div>
            </div>
          `;

            if (!root.player.gold) root.player.gold = 100;

            // Note: Card purchase events are now handled by InputManager


            // Note: Shop purchase events are now handled by InputManager
            // Note: Leave shop event is handled by InputManager
        });
    });
}

export function updateCardSelection(root) {
    // Remove selection from all cards
    root.app.querySelectorAll('.battle-card').forEach(card => {
        card.classList.remove('card-selected');
    });

    // Add selection to currently selected card
    if (root.selectedCardIndex !== null) {
        const selectedCard = root.app.querySelector(`[data-play="${root.selectedCardIndex}"]`);
        if (selectedCard) {
            selectedCard.classList.add('card-selected');
        }
    }
}

// updateShopAffordability function moved to InputManager

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRelicArt(relicId, RELICS = null) {
    if (RELICS && RELICS[relicId]?.art) {
        const imagePath = RELICS[relicId].art;
        return `<img src="assets/skill-art/${imagePath}" alt="${relicId}" class="relic-skill-art">`;
    }
    return '💎';
}

function getRelicName(relicId, RELICS = null) {
    return RELICS?.[relicId]?.name || relicId;
}

function getRelicText(relicId, RELICS = null) {
    return RELICS?.[relicId]?.text || 'Unknown relic';
}

function getCardArt(cardId, CARDS = null) {
    if (CARDS && CARDS[cardId]?.art) {
        const imagePath = CARDS[cardId].art;
        return `<img src="assets/skill-art/${imagePath}" alt="${cardId}" class="card-art-image">`;
    }

    // Fallback for cases where CARDS is not passed (shouldn't happen in normal operation)
    return `<span>🃏</span>`;
}

function getEnemyArt(enemyId, ENEMIES = null) {
    const enemyData = ENEMIES?.[enemyId];
    const avatarPath = enemyData?.avatar || `assets/avatars/${enemyId}.png`;
    return `<img src="${avatarPath}" alt="${enemyId}" class="enemy-avatar-img">`;
}

function getEnemyType(enemyId) {
    if (enemyId.includes('boss_')) return 'BOSS';
    if (enemyId.includes('elite_')) return 'ELITE';
    return 'ENEMY';
}

export function renderRelicSelection(root) {
    import("../data/relics.js").then(({ RELICS, START_RELIC_CHOICES }) => {
        import("../data/messages.js").then(({ getAllMessages }) => {
            const relicChoices = START_RELIC_CHOICES.slice(0, 3); // Show first 3 relics

            root.app.innerHTML = `
            <div class="game-screen relic-select">
              <div class="game-header">
                <button class="messages-button" data-action="show-messages">
                  Inbox
                  <span class="message-count-badge">${getAllMessages().length}</span>
                </button>
                <div class="game-logo relic-title-logo">
                  <svg width="600" height="240" viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
                    <defs>
        
                      <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ff8c00;stop-opacity:1" />
                      </linearGradient>
        
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
        
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                        <feOffset dx="1" dy="1" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    <text x="300" y="80" text-anchor="middle" font-family="'Kreon', serif" font-size="55" font-weight="700" fill="url(#textGradient)" filter="url(#glow)">
                      ThePrimeagen
                    </text>
        
                    <text x="300" y="170" text-anchor="middle" font-family="'Kreon', serif" font-size="85" font-weight="700" fill="url(#textGradient)" filter="url(#shadow) url(#glow)">
                      Spire
                    </text>
                  </svg>
                </div>
                <h1>Choose a Starting Relic</h1>
                <p>Select one of the following relics to begin your run.</p>
              </div>
              
              <div class="relic-options">
                ${relicChoices.map(relicId => {
                const relic = RELICS[relicId];
                return `
                    <div class="relic-option" data-relic="${relicId}">
                      <div class="relic-portrait">
                        <div class="relic-icon">${getRelicArt(relicId, RELICS)}</div>
                      </div>
                      <div class="relic-info">
                        <div class="relic-name">${relic.name}</div>
                        <div class="relic-description">${relic.text}</div>
                      </div>
                    </div>
                  `;
            }).join("")}
              </div>
              
            </div>
            `;

            // Set up relic selection event listeners
            root.app.querySelectorAll("[data-relic]").forEach(btn => {
                btn.addEventListener("click", () => {
                    const relicId = btn.dataset.relic;
                    root.selectStartingRelic(relicId);
                });
            });

            // Add Messages button event listener
            const messagesBtn = root.app.querySelector("[data-action='show-messages']");
            if (messagesBtn) {
                messagesBtn.addEventListener("click", () => showMessagesModal());
            }
        });
    });
}

export function renderEvent(root) {
    const events = [
        {
            title: "Birthday Cake",
            text: "You find a delicious birthday cake! But it looks suspicious...",
            artwork: "assets/card-art/bread.png",
            choices: [
                {
                    text: "Eat the whole cake (+15 HP, gain Sugar Crash curse)",
                    quote: "The great thing, if one can, is to stop regarding all the unpleasant things as interruptions of one’s own or real life. The truth is of course that what one calls the interruptions are precisely one’s real life.",
                    icon: "assets/card-art/apple.png",
                    risk: "high",
                    effect: () => {
                        root.player.hp = Math.min(root.player.maxHp, root.player.hp + 15);
                        root.player.deck.push("sugar_crash");
                        root.log("Ate cake: +15 HP, added Sugar Crash curse");
                    }
                },
                {
                    text: "Take a small bite (+8 HP)",
                    quote: "Courage is not simply one of the virtues, but the form of every virtue at the testing point.",
                    icon: "assets/card-art/heart.png",
                    risk: "low",
                    effect: () => {
                        root.player.maxHp += 5;
                        root.log("Small bite: +8 HP");
                    }
                },
                {
                    text: "Leave it alone (gain 25 gold)",
                    quote: "You can’t go back and change the beginning, but you can start where you are and change the ending.",
                    icon: "assets/card-art/bag_of_gold.png",
                    risk: "none",
                    effect: () => {
                        root.player.gold += 25;
                        root.log("Resisted temptation: +25 gold");
                    }
                }
            ]
        },
        {
            title: "Birthday Present",
            text: "A mysterious gift box sits before you. What could be inside?",
            artwork: "assets/card-art/chest_closed.png",
            choices: [
                {
                    text: "Open it eagerly (Random card or lose 10 HP)",
                    quote: "Hardship often leaves an extraordinary destiny.",
                    icon: "assets/card-art/key.png",
                    risk: "high",
                    effect: () => {
                        if (Math.random() < 0.7) {
                            import("../data/cards.js").then(({ CARDS, CARD_POOL }) => {
                                const randomCard = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
                                root.player.deck.push(randomCard);
                                root.log(`Found ${CARDS[randomCard].name}!`);
                            });
                        } else {
                            root.player.hp = Math.max(1, root.player.hp - 10);
                            root.log("It was a trap! -10 HP");
                        }
                    }
                },
                {
                    text: "Open it carefully (+5 Max HP)",
                    quote: "We are what we believe we are.",
                    icon: "assets/card-art/potion_heal.png",
                    risk: "low",
                    effect: () => {
                        root.player.maxHp += 5;
                        root.player.hp += 5;
                        root.log("Careful approach: +5 Max HP");
                    }
                },
                {
                    text: "Don't touch it (gain 30 gold)",
                    quote: "Experience: that most brutal of teachers. But you learn, my God do you learn.",
                    icon: "assets/card-art/bag_of_gold.png",
                    risk: "none",
                    effect: () => {
                        root.player.gold += 30;
                        root.log("Played it safe: +30 gold");
                    }
                }
            ]
        },
        {
            title: "Birthday Balloons",
            text: "Colorful balloons float by. One has a note attached: 'Pop me for a surprise!'",
            artwork: "assets/card-art/feather.png",
            choices: [
                {
                    text: "Pop the balloon (Remove a random basic card from deck)",
                    quote: "There are far, far better things ahead than any we leave behind.",
                    icon: "assets/card-art/scroll.png",
                    risk: "medium",
                    effect: () => {
                        const basicCards = root.player.deck.filter(id => id === "strike" || id === "defend");
                        if (basicCards.length > 0) {
                            const toRemove = basicCards[0];
                            const index = root.player.deck.indexOf(toRemove);
                            root.player.deck.splice(index, 1);
                            root.log(`Removed ${toRemove} from deck`);
                        } else {
                            root.log("No basic cards to remove");
                        }
                    }
                },
                {
                    text: "Collect the balloons (+1 Energy)",
                    quote: "Isn’t it funny how day by day nothing changes, but when you look back, everything is different?",
                    icon: "assets/card-art/magic_sphere.png",
                    risk: "low",
                    effect: () => {
                        root.player.maxEnergy += 1;
                        root.log("Collected balloons: +1 Energy");
                    }
                },
                {
                    text: "Ignore them (heal 12 HP)",
                    quote: "Hardships often prepare ordinary people for an extraordinary destiny.",
                    icon: "assets/card-art/heart.png",
                    risk: "none",
                    effect: () => {
                        root.player.hp = Math.min(root.player.maxHp, root.player.hp + 12);
                        root.log("Focused on rest: +12 HP");
                    }
                }
            ]
        }
    ];

    const event = events[Math.floor(Math.random() * events.length)];

    root.app.innerHTML = `
    <div class="event-screen">
      <div class="event-header">
        <h1>${event.title}</h1>
        <p>A birthday adventure awaits your decision</p>
        <div class="player-status-inline">
          <div class="status-item">
            <img src="assets/card-art/heart.png" alt="Health" class="status-icon-img">
            <span>${root.player.hp}/${root.player.maxHp} HP</span>
          </div>
          <div class="status-item">
            <img src="assets/card-art/bag_of_gold.png" alt="Gold" class="status-icon-img">
            <span>${root.player.gold || 0} Gold</span>
          </div>
        </div>
      </div>

      <div class="event-content">
        <div class="event-story">
          <div class="event-artwork">
            <img src="${event.artwork}" alt="Event" class="event-artwork-img">
          </div>
          <div class="event-description">
      <p>${event.text}</p>
    </div>
        </div>

        <div class="event-choices">
          <h3>Choose your action:</h3>
          <div class="choices-grid">
      ${event.choices.map((choice, idx) => `
              <div class="event-choice ${choice.risk}-risk" data-choice="${idx}">
                <div class="choice-icon">
                  <img src="${choice.icon}" alt="Choice" class="choice-icon-img">
                </div>
                <div class="choice-content">
                  <div class="choice-text">${choice.text}</div>
                  ${choice.quote ? `<div class="choice-quote">"${choice.quote}"</div>` : ''}
                  <div class="choice-risk-badge ${choice.risk}">
                    ${choice.risk === 'high' ? 'High Risk' : choice.risk === 'medium' ? 'Medium Risk' : choice.risk === 'low' ? 'Low Risk' : 'Safe'}
                  </div>
                </div>
              </div>
      `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;

    root.app.querySelectorAll("[data-choice]").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.choice, 10);
            event.choices[idx].effect();
            root.afterNode();
        });
    });
}

export async function renderWin(root) {
    const { RELICS } = await import("../data/relics.js");
    const finalStats = {
        totalTurns: root.turnCount || 0,
        cardsPlayed: root.cardsPlayedCount || 0,
        finalHP: root.player.hp,
        maxHP: root.player.maxHp,
        finalGold: root.player.gold || 0,
        deckSize: root.player.deck.length,
        relicsCollected: root.relicStates.length
    };

    root.app.innerHTML = `
    <div class="victory-screen">
      <div class="victory-header">
        <div class="victory-crown">
          <img src="assets/card-art/crown.png" alt="Victory Crown" class="crown-img">
        </div>
        <h1>VICTORY ACHIEVED!</h1>
        <h2>ThePrimeagen Spire Has Been Conquered!</h2>
        <p>ThePrimeagen's birthday celebration can continue in peace!</p>
      </div>

      <div class="victory-content">
        <div class="victory-artwork">
          <div class="victory-scene">
            <img src="assets/card-art/trophy.png" alt="Trophy" class="victory-trophy">
            <div class="victory-glow"></div>
          </div>
        </div>

        <div class="victory-stats">
          <h3>Final Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <img src="assets/card-art/heart.png" alt="Health" class="stat-icon">
              <div class="stat-info">
                <span class="stat-label">Final Health</span>
                <span class="stat-value">${finalStats.finalHP}/${finalStats.maxHP}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="assets/card-art/bag_of_gold.png" alt="Gold" class="stat-icon">
              <div class="stat-info">
                <span class="stat-label">Gold Remaining</span>
                <span class="stat-value">${finalStats.finalGold}</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="assets/card-art/book.png" alt="Deck" class="stat-icon">
              <div class="stat-info">
                <span class="stat-label">Final Deck Size</span>
                <span class="stat-value">${finalStats.deckSize} cards</span>
              </div>
            </div>
            <div class="stat-item">
              <img src="assets/card-art/runestone.png" alt="Relics" class="stat-icon">
              <div class="stat-info">
                <span class="stat-label">Relics Collected</span>
                <span class="stat-value">${finalStats.relicsCollected}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="victory-relics">
          <h3>Relics Mastered</h3>
          <div class="relics-showcase">
            ${root.relicStates.length > 0 ?
            root.relicStates.map(r => `
                <div class="relic-showcase-item" title="${getRelicText(r.id, RELICS)}">
                  <div class="relic-showcase-icon">${getRelicArt(r.id, RELICS)}</div>
                  <div class="relic-showcase-name">${getRelicName(r.id, RELICS)}</div>
                </div>
              `).join('') :
            '<div class="no-relics">No relics collected this run</div>'
        }
          </div>
        </div>

        <div class="victory-message">
          <div class="birthday-celebration">
            <h3>Birthday Celebration Complete!</h3>
            <p>Thanks to your heroic efforts in your old age. ThePrimeagen's boomer years shall continue!</p>
            <p class="victory-quote">"Happy Birthday Prime! Hope you have a good one!"</p>
          </div>
        </div>
      </div>

      <div class="victory-actions">
        <button class="victory-btn primary" data-replay>
          <img src="assets/card-art/scroll.png" alt="New Run" class="btn-icon">
          <span>Start New Adventure</span>
        </button>
      </div>
    </div>
  `;
    root.app.querySelector("[data-replay]").addEventListener("click", () => root.reset());
}

export async function renderCodeReviewSelection(root, cards) {
    const { CARDS } = await import("../data/cards.js");
    
    if (!cards || cards.length === 0) {
        root.log("No cards available for code review.");
        return;
    }

    root.app.innerHTML = `
        <div class="code-review-modal-overlay">
            <div class="code-review-modal">
                <div class="code-review-header">
                    <h2>🔍 Code Review</h2>
                    <p>Choose 1 card to add to your hand. The rest will go to the bottom of your deck.</p>
                </div>
                
                <div class="code-review-cards-container">
                    ${cards.map((card, index) => {
                        const cardType = card.type === 'attack' ? 'attack' : card.type === 'skill' ? 'skill' : 'power';
                        return `
                            <div class="code-review-card" data-code-review-pick="${index}">
                                <div class="battle-card ${cardType} playable">
                                    <div class="card-glow"></div>
                                    <div class="card-frame">
                                        <div class="card-header-row">
                                            <div class="card-title">${card.name}</div>
                                            <div class="card-cost-orb">${card.cost}</div>
                                        </div>
                                        
                                        <div class="card-artwork">
                                            <div class="card-art-icon">${getCardArt(card.id, CARDS)}</div>
                                            <div class="card-type-badge ${cardType}">${card.type}</div>
                                        </div>
                                        
                                        <div class="card-description-box">
                                            <div class="card-text">${card.text}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="code-review-card-label">Click to choose</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="code-review-footer">
                    <p>💡 Press ESC to cancel</p>
                </div>
            </div>
        </div>
    `;
}

export async function renderLose(root) {
    const { RELICS } = await import("../data/relics.js");
    const finalStats = {
        totalTurns: root.turnCount || 0,
        cardsPlayed: root.cardsPlayedCount || 0,
        finalHP: 0, // Player is defeated
        maxHP: root.player.maxHp,
        finalGold: root.player.gold || 0,
        deckSize: root.player.deck.length,
        relicsCollected: root.relicStates.length,
        nodeId: root.nodeId || 'unknown'
    };

    root.app.innerHTML = `
    <div class="defeat-screen">
      <div class="defeat-header">
        <h1>You Failed!</h1>
        <h2>The Spire Claims Another Developer</h2>
        <p>It seems age has slowed the CPU upstairs…  
Better luck on the next run!</p>
      </div>

        <div class="defeat-stats">
          <h3>Final Debug Report</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-info">
                <div class="stat-label">Turns Survived</div>
                <div class="stat-value">${finalStats.totalTurns}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-info">
                <div class="stat-label">Cards Played</div>
                <div class="stat-value">${finalStats.cardsPlayed}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-info">
                <div class="stat-label">HP Lost</div>
                <div class="stat-value">${finalStats.maxHP}/${finalStats.maxHP}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-info">
                <div class="stat-label">Gold Earned</div>
                <div class="stat-value">${finalStats.finalGold}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-info">
                <div class="stat-label">Deck Size</div>
                <div class="stat-value">${finalStats.deckSize} cards</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-info">
                <div class="stat-label">Relics Found</div>
                <div class="stat-value">${finalStats.relicsCollected}</div>
              </div>
            </div>
          </div>
        </div>

        ${root.relicStates.length > 0 ? `
        <div class="defeat-relics">
          <h3>Tools Collected</h3>
          <div class="relics-showcase">
            ${root.relicStates.map(relic => `
              <div class="relic-showcase-item">
                <div class="relic-showcase-icon">${getRelicArt(relic.id, RELICS)}</div>
                <div class="relic-showcase-name">${relic.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : `
        <div class="defeat-relics">
          <div class="no-relics">No relics were collected during this run.</div>
        </div>
        `}

        <div class="defeat-message">
          <div class="debug-session">
            <h3>Post-Mortem Analysis</h3>
            <div class="defeat-quote">
              "Debugging is twice as hard as writing the code in the first place.<br/>
              Therefore, if you write the code as cleverly as possible,<br/>
              you are, by definition, not smart enough to debug it."<br/>
              <em>- Brian Kernighan</em>
            </div>
          </div>
        </div>

        <div class="defeat-actions">
          ${root.currentAct === "act2" && root.hasAct2Checkpoint() ? `
            <button class="defeat-btn primary-btn" data-restart-act2>
              <span class="btn-icon">🎯</span>
              <span>Restart Act 2</span>
            </button>
            <button class="defeat-btn secondary-btn" data-replay>
              <span class="btn-icon">🔄</span>
              <span>Restart from Beginning</span>
            </button>
          ` : `
            <button class="defeat-btn primary-btn" data-replay>
              <span class="btn-icon">🔄</span>
              <span>Try Again</span>
            </button>
          `}
          <button class="defeat-btn secondary-btn" data-menu>
            <span class="btn-icon">🏠</span>
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
    `;


    // Add event listeners for restart options
    const restartAct2Btn = root.app.querySelector("[data-restart-act2]");
    if (restartAct2Btn) {
        restartAct2Btn.addEventListener("click", async () => {
            if (root.loadAct2Checkpoint()) {
                await renderMap(root);
            } else {
                // Fallback to full reset if checkpoint fails
                root.reset();
            }
        });
    }

    const replayBtn = root.app.querySelector("[data-replay]");
    if (replayBtn) {
        replayBtn.addEventListener("click", () => {
            root.reset();
        });
    }

    const menuBtn = root.app.querySelector("[data-menu]");
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            root.reset();
        });
    }
}

