import { getRelicArt } from "../../ui/shared/renderShared.js";

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
    nodeId: root.nodeId || "unknown",
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
            <div class="stat-item"><div class="stat-info"><div class="stat-label">Turns Survived</div><div class="stat-value">${finalStats.totalTurns}</div></div></div>
            <div class="stat-item"><div class="stat-info"><div class="stat-label">Cards Played</div><div class="stat-value">${finalStats.cardsPlayed}</div></div></div>
            <div class="stat-item"><div class="stat-info"><div class="stat-label">HP Lost</div><div class="stat-value">${finalStats.maxHP}/${finalStats.maxHP}</div></div></div>
            <div class="stat-item"><div class="stat-info"><div class="stat-label">Gold Earned</div><div class="stat-value">${finalStats.finalGold}</div></div></div>
            <div class="stat-item"><div class="stat-info"><div class="stat-label">Deck Size</div><div class="stat-value">${finalStats.deckSize} cards</div></div></div>
            <div class="stat-item"><div class="stat-info"><div class="stat-label">Relics Found</div><div class="stat-value">${finalStats.relicsCollected}</div></div></div>
          </div>
        </div>

        ${
          root.relicStates.length > 0
            ? `
        <div class="defeat-relics">
          <h3>Tools Collected</h3>
          <div class="relics-showcase">
            ${root.relicStates
              .map(
                (relic) => `
              <div class="relic-showcase-item">
                <div class="relic-showcase-icon">${getRelicArt(relic.id, RELICS)}</div>
                <div class="relic-showcase-name">${relic.id.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
        `
            : `
        <div class="defeat-relics">
          <div class="no-relics">No relics were collected during this run.</div>
        </div>
        `
        }

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
          ${
            root.currentAct === "act2" && root.hasAct2Checkpoint()
              ? `
            <button class="defeat-btn primary-btn" data-restart-act2>
              <span class="btn-icon">🎯</span>
              <span>Restart Act 2</span>
            </button>
            <button class="defeat-btn secondary-btn" data-replay>
              <span class="btn-icon">🔄</span>
              <span>Restart from Beginning</span>
            </button>
          `
              : `
            <button class="defeat-btn primary-btn" data-replay>
              <span class="btn-icon">🔄</span>
              <span>Try Again</span>
            </button>
          `
          }
          <button class="defeat-btn secondary-btn" data-menu>
            <span class="btn-icon">🏠</span>
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
    `;
}
