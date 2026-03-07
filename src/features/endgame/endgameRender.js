import { getRelicArt, getRelicName, getRelicText, getCardArt } from "../../ui/shared/renderShared.js";

export async function renderWin(root) {
    const { RELICS } = await import("../../data/relics.js");
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
            root.relicStates.map((r) => `
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
}

export async function renderCodeReviewSelection(root, cards) {
    const { CARDS } = await import("../../data/cards.js");

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
    const { RELICS } = await import("../../data/relics.js");
    const finalStats = {
        totalTurns: root.turnCount || 0,
        cardsPlayed: root.cardsPlayedCount || 0,
        finalHP: 0,
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
        <p>It seems age has slowed the CPU upstairs...
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
            ${root.relicStates.map((relic) => `
              <div class="relic-showcase-item">
                <div class="relic-showcase-icon">${getRelicArt(relic.id, RELICS)}</div>
                <div class="relic-showcase-name">${relic.id.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}</div>
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
}
