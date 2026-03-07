import {
  getRelicArt,
  getRelicName,
  getRelicText,
  renderImage,
} from "../../ui/shared/renderShared.js";

export async function renderWin(root) {
  const { RELICS } = await import("../../data/relics.js");
  const finalStats = {
    totalTurns: root.turnCount || 0,
    cardsPlayed: root.cardsPlayedCount || 0,
    finalHP: root.player.hp,
    maxHP: root.player.maxHp,
    finalGold: root.player.gold || 0,
    deckSize: root.player.deck.length,
    relicsCollected: root.relicStates.length,
  };

  root.app.innerHTML = `
    <div class="victory-screen">
      <div class="victory-header">
        <div class="victory-crown">
          ${renderImage("assets/card-art/crown.png", "Victory Crown", "crown-img")}
        </div>
        <h1>VICTORY ACHIEVED!</h1>
        <h2>ThePrimeagen Spire Has Been Conquered!</h2>
        <p>ThePrimeagen's birthday celebration can continue in peace!</p>
      </div>

      <div class="victory-content">
        <div class="victory-artwork">
          <div class="victory-scene">
            ${renderImage("assets/card-art/trophy.png", "Trophy", "victory-trophy")}
            <div class="victory-glow"></div>
          </div>
        </div>

        <div class="victory-stats">
          <h3>Final Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item">
              ${renderImage("assets/card-art/heart.png", "Health", "stat-icon")}
              <div class="stat-info">
                <span class="stat-label">Final Health</span>
                <span class="stat-value">${finalStats.finalHP}/${finalStats.maxHP}</span>
              </div>
            </div>
            <div class="stat-item">
              ${renderImage("assets/card-art/bag_of_gold.png", "Gold", "stat-icon")}
              <div class="stat-info">
                <span class="stat-label">Gold Remaining</span>
                <span class="stat-value">${finalStats.finalGold}</span>
              </div>
            </div>
            <div class="stat-item">
              ${renderImage("assets/card-art/book.png", "Deck", "stat-icon")}
              <div class="stat-info">
                <span class="stat-label">Final Deck Size</span>
                <span class="stat-value">${finalStats.deckSize} cards</span>
              </div>
            </div>
            <div class="stat-item">
              ${renderImage("assets/card-art/runestone.png", "Relics", "stat-icon")}
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
            ${
              root.relicStates.length > 0
                ? root.relicStates
                    .map(
                      (relic) => `
                <div class="relic-showcase-item" title="${getRelicText(relic.id, RELICS)}">
                  <div class="relic-showcase-icon">${getRelicArt(relic.id, RELICS)}</div>
                  <div class="relic-showcase-name">${getRelicName(relic.id, RELICS)}</div>
                </div>
              `,
                    )
                    .join("")
                : '<div class="no-relics">No relics collected this run</div>'
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
          ${renderImage("assets/card-art/scroll.png", "New Run", "btn-icon")}
          <span>Start New Adventure</span>
        </button>
      </div>
    </div>
  `;
}
