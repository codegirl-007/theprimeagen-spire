import { getRelicArt, getCardArt, renderImage } from "../../ui/shared/renderShared.js";

export async function renderShop(root) {
  const { CARDS } = await import("../../../shared/data/cards.js");
  const { RELICS } = await import("../../../shared/data/relics.js");
  const shopCards = root.currentShopCards || [];
  const shopRelic = root.currentShopRelic;

  root.app.innerHTML = `
            <div class="shop-screen">
              <div class="shop-header">
                <h1>Merchant's Shop</h1>
                <p>Spend your hard-earned gold on powerful upgrades</p>
                <div class="player-gold">
                  ${renderImage("assets/card-art/bag_of_gold.png", "Gold", "gold-icon")}
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
                   ${shopCards
                       .map((offer, idx) => {
                         const card = CARDS[offer.cardId];
                         const cardType =
                           card.type === "attack"
                             ? "attack"
                             : card.type === "skill"
                               ? "skill"
                               : "power";
                         const canAfford = (root.player.gold || 100) >= offer.price;
                         const ownedCount = root.player.deck.filter(
                           (deckCardId) => deckCardId === offer.cardId,
                         ).length;
                         return `
                        <div class="shop-card-container">
                           <div class="battle-card ${canAfford && !offer.sold ? "playable" : "unplayable"} ${cardType} shop-card" data-buy-card="${idx}">
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
                               ${renderImage("assets/card-art/bag_of_gold.png", "Gold", "price-icon")}
                               <span>${offer.price}</span>
                             </div>
                             ${ownedCount > 0 ? `<div class="card-owned-indicator">Owned: ${ownedCount}</div>` : ""}
                             ${offer.sold ? `<div class="card-disabled-overlay"><span>SOLD</span></div>` : !canAfford ? `<div class="card-disabled-overlay"><span>Need ${offer.price} gold</span></div>` : ""}
                           </div>
                         </div>
                       `;
                      })
                      .join("")}
                  </div>
                </div>

            ${
              shopRelic
                ? `
                <div class="shop-section">
                  <div class="shop-section-header">
                    <h2>Mystical Relic</h2>
                    <p>100 gold</p>
                  </div>
                  <div class="shop-relics">
                    <div class="shop-relic-container">
                      <div class="shop-relic ${(root.player.gold || 100) >= shopRelic.price && !shopRelic.sold ? "affordable" : "unaffordable"}" data-buy-relic>
                        <div class="relic-icon">${getRelicArt(shopRelic.relicId, RELICS)}</div>
                        <div class="relic-info">
                          <h3>${RELICS[shopRelic.relicId].name}</h3>
                          <p>${RELICS[shopRelic.relicId].text}</p>
                        </div>
                        <div class="shop-relic-price">
                          ${renderImage("assets/card-art/bag_of_gold.png", "Gold", "price-icon")}
                          <span>${shopRelic.price}</span>
                        </div>
                      </div>
                      ${shopRelic.sold ? `<div class="relic-disabled-overlay"><span>SOLD</span></div>` : ""}
                    </div>
                  </div>
            </div>
            `
                : ""
            }
              </div>

              <div class="shop-actions">
                <button class="shop-leave-btn" data-leave>
                  ${renderImage("assets/card-art/exit.png", "Leave", "leave-icon")}
                  <span>Leave Shop</span>
                </button>
              </div>
            </div>
          `;

  if (!root.player.gold) root.player.gold = 100;
}
