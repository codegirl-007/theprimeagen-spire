import { getCardArt, renderImage } from "../../ui/shared/renderShared.js";

export async function renderRest(root) {
  root.app.innerHTML = `
    <div class="rest-screen">
      <div class="rest-header">
        <h1>Rest and Recover</h1>
        <p>Take a moment to restore your strength</p>
      </div>
      
      <div class="rest-options">
        <button class="rest-option" data-act="heal">
          <div class="rest-icon">
            ${renderImage("assets/card-art/heart.png", "Heal", "rest-icon-img")}
          </div>
          <div class="rest-content">
            <h3>Rest and Heal</h3>
            <p>Restore 20% of your maximum health</p>
          </div>
        </button>
        
        <button class="rest-option" data-act="upgrade">
          <div class="rest-icon">
            ${renderImage("assets/card-art/scroll.png", "Upgrade", "rest-icon-img")}
          </div>
          <div class="rest-content">
            <h3>Upgrade a Card</h3>
            <p>Permanently improve one of your cards</p>
          </div>
        </button>
      </div>
    </div>
  `;
}

export function renderUpgrade(root) {
  import("../../../data/cards.js").then(({ CARDS }) => {
    const upgradableCards = root.player.deck
      .map((cardId, index) => ({ cardId, index }))
      .filter(({ cardId }) => {
        const card = CARDS[cardId];
        return card?.upgrades && !cardId.endsWith("+");
      })
      .slice(0, 3);

    if (upgradableCards.length === 0) {
      root.log("No cards can be upgraded.");
      root.afterNode();
      return;
    }

    root.app.innerHTML = `
        <div class="upgrade-screen">
          <div class="upgrade-header">
        <h1>Upgrade a Card</h1>
            <p>Select a card from your deck to permanently improve it</p>
          </div>
          
          <div class="upgrade-options">
          ${upgradableCards
            .map(({ cardId, index }) => {
              const card = CARDS[cardId];
              const upgradedCard = CARDS[card.upgrades];

              if (!upgradedCard) {
                return "";
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
            })
            .join("")}
        </div>
          
          <div class="upgrade-actions">
            <button class="upgrade-skip" data-skip>Skip Upgrade</button>
          </div>
        </div>
      `;

    root.app.querySelectorAll("[data-upgrade]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const deckIndex = parseInt(btn.dataset.upgrade, 10);
        const oldCardId = root.player.deck[deckIndex];
        const newCardId = CARDS[oldCardId].upgrades;
        root.player.deck[deckIndex] = newCardId;
        root.log(
          `Upgraded ${CARDS[oldCardId].name} → ${CARDS[newCardId].name}`,
        );
        root.afterNode();
      });
    });
    root.app
      .querySelector("[data-skip]")
      .addEventListener("click", () => root.afterNode());
  });
}
