export function handleShopCardBuy(manager, element) {
  const index = parseInt(element.dataset.buyCard, 10);
  if (manager.root.currentShopCards && manager.root.currentShopCards[index]) {
    const offer = manager.root.currentShopCards[index];
    if (offer.sold) {
      return;
    }

    if (manager.root.player.gold >= offer.price) {
      manager.root.player.gold -= offer.price;
      manager.root.player.deck.push(offer.cardId);
      offer.sold = true;
      manager.root.log(`Bought ${offer.cardId} for ${offer.price} gold.`);
      element.disabled = true;
      element.textContent = "SOLD";

      const goldDisplay = manager.root.app.querySelector(".gold-amount");
      if (goldDisplay) {
        goldDisplay.textContent = manager.root.player.gold;
      }

      updateShopAffordability(manager);
      manager.root.scheduleSave();
    } else {
      manager.root.log("Not enough gold!");
    }
  }
}

export function handleShopRelicBuy(manager, element) {
  if (manager.root.currentShopRelic) {
    const relicOffer = manager.root.currentShopRelic;
    if (relicOffer.sold) {
      return;
    }

    if (manager.root.player.gold >= relicOffer.price) {
      manager.root.player.gold -= relicOffer.price;
      manager.root.log(`Bought ${relicOffer.relicId} for ${relicOffer.price} gold.`);

      import("../../../shared/engine/battle.js").then(({ attachRelics }) => {
        const currentRelicIds = manager.root.relicStates.map(
          (entry) => entry.id,
        );
        const newRelicIds = [...currentRelicIds, relicOffer.relicId];
        attachRelics(manager.root, newRelicIds);
      });

      relicOffer.sold = true;

      element.disabled = true;
      element.textContent = "SOLD";

      const goldDisplay = manager.root.app.querySelector(".gold-amount");
      if (goldDisplay) {
        goldDisplay.textContent = manager.root.player.gold;
      }

      updateShopAffordability(manager);
      manager.root.scheduleSave();
    } else {
      manager.root.log("Not enough gold!");
    }
  }
}

export function updateShopAffordability(manager) {
  manager.root.app.querySelectorAll("[data-buy-card]").forEach((button) => {
    if (!button.disabled) {
      const cardContainer = button.closest(".shop-card-container");
      const overlay = cardContainer.querySelector(".card-disabled-overlay");
      const index = parseInt(button.dataset.buyCard, 10);
      const offer = manager.root.currentShopCards?.[index];
      if (offer?.sold) {
        return;
      }

      if (manager.root.player.gold < (offer?.price || 50)) {
        button.classList.remove("playable");
        button.classList.add("unplayable");
        if (!overlay) {
          const newOverlay = document.createElement("div");
          newOverlay.className = "card-disabled-overlay";
          newOverlay.innerHTML = `<span>Need ${offer?.price || 50} gold</span>`;
          cardContainer.appendChild(newOverlay);
        }
      } else {
        button.classList.remove("unplayable");
        button.classList.add("playable");
        if (overlay) {
          overlay.remove();
        }
      }
    }
  });

  const relicButton = manager.root.app.querySelector("[data-buy-relic]");
  if (relicButton && !relicButton.disabled) {
    const relicContainer = relicButton.closest(".shop-relic-container");
    const overlay = relicContainer.querySelector(".relic-disabled-overlay");
    if (manager.root.currentShopRelic?.sold) {
      return;
    }

    if (manager.root.player.gold < (manager.root.currentShopRelic?.price || 100)) {
      relicButton.classList.remove("affordable");
      relicButton.classList.add("unaffordable");
      if (!overlay) {
        const newOverlay = document.createElement("div");
        newOverlay.className = "relic-disabled-overlay";
        newOverlay.innerHTML = `<span>Need ${manager.root.currentShopRelic?.price || 100} gold</span>`;
        relicContainer.appendChild(newOverlay);
      }
    } else {
      relicButton.classList.remove("unaffordable");
      relicButton.classList.add("affordable");
      if (overlay) {
        overlay.remove();
      }
    }
  }
}

export function handleLeaveShop(manager) {
  manager.root.afterNode();
}
