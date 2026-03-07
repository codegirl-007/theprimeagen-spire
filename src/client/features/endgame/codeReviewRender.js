import { getCardArt } from "../../ui/shared/renderShared.js";

export async function renderCodeReviewSelection(root, cards) {
  const { CARDS } = await import("../../../data/cards.js");

  if (!cards || cards.length === 0) {
    root.log("No cards available for code review.");
    return;
  }

  const overlayHost = root.battleUi?.overlayHost;
  if (!overlayHost) {
    return;
  }

  overlayHost.innerHTML = `
        <div class="code-review-modal-overlay">
            <div class="code-review-modal">
                <div class="code-review-header">
                    <h2>🔍 Code Review</h2>
                    <p>Choose 1 card to add to your hand. The rest will go to the bottom of your deck.</p>
                </div>

                <div class="code-review-cards-container">
                    ${cards
                      .map((card, index) => {
                        const cardType =
                          card.type === "attack"
                            ? "attack"
                            : card.type === "skill"
                              ? "skill"
                              : "power";
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
                      })
                      .join("")}
                </div>

                <div class="code-review-footer">
                    <p>💡 Press ESC to cancel</p>
                </div>
            </div>
        </div>
    `;
}
