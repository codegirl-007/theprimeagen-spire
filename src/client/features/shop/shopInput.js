export function handleShopCardBuy(manager, element) {
  const index = parseInt(element.dataset.buyCard, 10);
  if (manager.root.currentShopCards && manager.root.currentShopCards[index]) {
    const card = manager.root.currentShopCards[index];
    if (manager.root.player.gold >= 50) {
      manager.root.player.gold -= 50;
      manager.root.player.deck.push(card.id);
      manager.root.log(`Bought ${card.name} for 50 gold.`);
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
    const relic = manager.root.currentShopRelic;
    if (manager.root.player.gold >= 100) {
      manager.root.player.gold -= 100;
      manager.root.log(`Bought ${relic.name} for 100 gold.`);

<<<<<<< Updated upstream
      import("../../../shared/engine/battle.js").then(({ attachRelics }) => {
        const currentRelicIds = manager.root.relicStates.map(
          (entry) => entry.id,
        );
        const newRelicIds = [...currentRelicIds, relic.id];
        attachRelics(manager.root, newRelicIds);
=======
      import("../../../shared/engine/battle.js").then(({ grantRelic }) => {
        grantRelic(manager.root, relicOffer.relicId);
>>>>>>> Stashed changes
      });

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

      if (manager.root.player.gold < 50) {
        button.classList.remove("playable");
        button.classList.add("unplayable");
        if (!overlay) {
          const newOverlay = document.createElement("div");
          newOverlay.className = "card-disabled-overlay";
          newOverlay.innerHTML = "<span>Need 50 gold</span>";
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

    if (manager.root.player.gold < 100) {
      relicButton.classList.remove("affordable");
      relicButton.classList.add("unaffordable");
      if (!overlay) {
        const newOverlay = document.createElement("div");
        newOverlay.className = "relic-disabled-overlay";
        newOverlay.innerHTML = "<span>Need 100 gold</span>";
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
