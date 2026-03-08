import { getCardArt } from "../../ui/shared/renderShared.js";

export async function renderReward(root, choices) {
  const { CARDS } = await import("../../../shared/data/cards.js");
  root.app.innerHTML = `
    <div class="reward-screen">
      <h1>Choose a Card</h1>
      <div class="reward-cards-container">
        ${choices
          .map((c, idx) => {
            const cardType =
              c.type === "attack"
                ? "attack"
                : c.type === "skill"
                  ? "skill"
                  : "power";
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
          })
          .join("")}
      </div>
      <div class="reward-actions">
        <button class="btn secondary skip-btn" data-skip>Skip Reward</button>
      </div>
    </div>
  `;
}
