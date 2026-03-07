import {
    getRelicArt,
    getRelicText,
    getCardArt
} from "../../ui/shared/renderShared.js";

export async function renderMap(root) {
    const { CARDS } = await import("../../data/cards.js");
    const { ENEMIES } = await import("../../data/enemies.js");
    const { RELICS } = await import("../../data/relics.js");
    const { getAllMessages } = await import("../../data/messages.js");
    const { MAPS } = await import("../../data/maps.js");
    const m = root.map;
    const currentId = root.nodeId;

    const currentNode = m.nodes.find((node) => node.id === currentId);
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
            case 'battle': {
                const enemy = ENEMIES[node.enemy];
                return `<strong>Battle</strong>\nFight: ${enemy?.name || 'Unknown Enemy'}\nHP: ${enemy?.maxHp || '?'}`;
            }
            case 'elite': {
                const elite = ENEMIES[node.enemy];
                return `<strong>Elite Battle</strong>\nFight: ${elite?.name || 'Unknown Elite'}\nHP: ${elite?.maxHp || '?'}\nTough enemy with better rewards`;
            }
            case 'boss': {
                const boss = ENEMIES[node.enemy];
                return `<strong>Boss Battle</strong>\nFight: ${boss?.name || 'Unknown Boss'}\nHP: ${boss?.maxHp || '?'}\nFinal challenge of the act`;
            }
            case 'rest':
                return '<strong>Rest Site</strong>\nHeal up to 20% max HP\nor upgrade a card';
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

        if (["battle", "elite", "boss"].includes(node.kind) && node.enemy) {
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
            ${root.relicStates.map((r) => `
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
                <div class="act-name">${MAPS.act1?.name || 'Act I'}</div>
              </div>
              <div class="act-connector ${root.currentAct === 'act2' ? 'active' : ''}"></div>
              <div class="act-step ${root.currentAct === 'act2' ? 'current' : root.currentAct === 'act1' ? 'locked' : 'completed'}">
                <div class="act-number">Act II</div>
                <div class="act-name">${MAPS.act2?.name || 'Act II'}</div>
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
            const getNodePos = (nodeId) => {
                const node = m.nodes.find((entry) => entry.id === nodeId);
                return node ? { x: node.x, y: node.y } : null;
            };

            return m.nodes.map((node) => {
                if (!node.next || node.next.length === 0) return '';

                return node.next.map((nextId) => {
                    const fromPos = { x: node.x, y: node.y };
                    const toPos = getNodePos(nextId);
                    if (!fromPos || !toPos) return '';

                    const isActivePath = (node.id === currentId && nextIds.includes(nextId)) ||
                        (parseInt(nextId.replace('n', ''), 10) <= parseInt(currentId.replace('n', ''), 10));

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
            return m.nodes.map((n) => {
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
        tooltip.style.left = `${rect.right + 15}px`;
        tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;

        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = `${rect.left - tooltip.offsetWidth - 15}px`;
        }
        if (tooltipRect.top < 0) {
            tooltip.style.top = '10px';
        }
        if (tooltipRect.bottom > window.innerHeight) {
            tooltip.style.top = `${window.innerHeight - tooltip.offsetHeight - 10}px`;
        }
    };

    window.hideTooltip = function() {
        const tooltip = document.getElementById('custom-tooltip');
        tooltip.style.display = 'none';
    };
}
