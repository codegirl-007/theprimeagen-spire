import {
  showDamageNumber,
  updateCardSelection,
  getCardArt,
  getEnemyArt,
  getEnemyType,
  renderImage,
  renderBackgroundImageStyle,
} from "../../ui/shared/renderShared.js";
import { renderCodeReviewSelection } from "../endgame/codeReviewRender.js";

export { showDamageNumber, updateCardSelection };

export async function renderBattle(root) {
  const p = root.player;
  const e = root.enemy;

  const { ENEMIES } = await import("../../../shared/data/enemies.js");
  const { CARDS } = await import("../../../shared/data/cards.js");
  const enemyData = ENEMIES[e.id];
  const intentInfo = getIntentInfo(e);

  root.selectedCardIndex ??= null;

  ensureBattleShell(root, enemyData);
  updateBattleArena(root, enemyData);
  updateBattleEnemy(root, enemyData, intentInfo, ENEMIES);
  updateBattlePlayer(root);
  updateBattleHand(root, CARDS);
  updateBattleControls(root, p);
  updateBattleLog(root);
  updateBattleSelection(root);
  updateBattleOverlay(root);
}

function getIntentInfo(enemy) {
  return (
    {
      attack: {
        emoji: "",
        text: `Will attack for ${enemy.intent.value} damage`,
        color: "danger",
      },
      block: {
        emoji: "",
        text: `Will gain ${enemy.intent.value} block`,
        color: "info",
      },
      debuff: { emoji: "", text: "Will apply a debuff", color: "warning" },
      heal: {
        emoji: "",
        text: `Will heal for ${enemy.intent.value} HP`,
        color: "success",
      },
    }[enemy.intent.type] || {
      emoji: "",
      text: "Unknown intent",
      color: "neutral",
    }
  );
}

function ensureBattleShell(root, enemyData) {
  const battleInstanceId = root._battleInstanceId || 0;
  if (root.battleUi?.battleInstanceId === battleInstanceId) {
    return;
  }

  root.app.innerHTML = createBattleShellMarkup(enemyData?.background || null);
  root.battleUi = cacheBattleUi(root, battleInstanceId);
}

function createBattleShellMarkup(backgroundImage) {
  return `
    <div class="battle-scene">
      <div class="battle-arena" ${backgroundImage ? `style="${renderBackgroundImageStyle(backgroundImage, ["background-size: cover", "background-position: center", "background-repeat: no-repeat"])}"` : ""}>
        <div class="enemy-battle-zone">
          <div class="enemy-panel-host"></div>
        </div>

        <div class="player-battle-zone">
          <div class="player-panel-host"></div>
        </div>
      </div>

      <div class="battle-action-zone">
        <div class="hand-area">
          <div class="hand-header">
            <div class="deck-counters"></div>
          </div>

          <div class="cards-battlefield"></div>

          <div class="hand-controls"></div>
        </div>
      </div>

      <div class="fight-log-panel">
        <div class="fight-log-header">
          <span class="fight-log-title">Combat Log</span>
        </div>
        <div class="fight-log-content" id="fight-log-content"></div>
      </div>

      <div class="battle-overlay-host"></div>
    </div>
  `;
}

function cacheBattleUi(root, battleInstanceId) {
  return {
    battleInstanceId,
    scene: root.app.querySelector(".battle-scene"),
    arena: root.app.querySelector(".battle-arena"),
    enemyHost: root.app.querySelector(".enemy-panel-host"),
    playerHost: root.app.querySelector(".player-panel-host"),
    handHost: root.app.querySelector(".cards-battlefield"),
    controlsHost: root.app.querySelector(".hand-controls"),
    logContent: root.app.querySelector("#fight-log-content"),
    overlayHost: root.app.querySelector(".battle-overlay-host"),
    lastVisibleLogs: [],
    selectedCardEl: null,
  };
}

function updateBattleArena(root, enemyData) {
  const backgroundImage = enemyData?.background || null;
  if (!backgroundImage) {
    root.battleUi.arena.removeAttribute("style");
    return;
  }

  root.battleUi.arena.setAttribute(
    "style",
    renderBackgroundImageStyle(backgroundImage, [
      "background-size: cover",
      "background-position: center",
      "background-repeat: no-repeat",
    ]),
  );
}

function updateBattleEnemy(root, enemyData, intentInfo, ENEMIES) {
  root.battleUi.enemyHost.innerHTML = getEnemyMarkup(
    root,
    enemyData,
    intentInfo,
    ENEMIES,
  );
}

function updateBattlePlayer(root) {
  root.battleUi.playerHost.innerHTML = getPlayerMarkup(root);
}

function updateBattleHand(root, CARDS) {
  root.battleUi.handHost.innerHTML = getHandMarkup(root, CARDS);
  root.battleUi.selectedCardEl = null;
}

function updateBattleControls(root, player) {
  root.battleUi.controlsHost.innerHTML = getEndTurnMarkup(player);
}

function updateBattleLog(root) {
  const visibleLogs = root.logs.slice(-20);
  const previousLogs = root.battleUi.lastVisibleLogs || [];
  const logContent = root.battleUi.logContent;

  if (logsMatch(previousLogs, visibleLogs)) {
    return;
  }

  const overlap = getLogOverlap(previousLogs, visibleLogs);
  if (overlap > 0 || previousLogs.length === 0) {
    removeLeadingLogEntries(logContent, previousLogs.length - overlap);
    appendLogEntries(logContent, visibleLogs.slice(overlap));
  } else {
    rebuildBattleLog(logContent, visibleLogs);
  }

  root.battleUi.lastVisibleLogs = visibleLogs.slice();
  logContent.scrollTop = logContent.scrollHeight;
}

function updateBattleSelection(root) {
  updateCardSelection(root);
}

function updateBattleOverlay(root) {
  if (root.pendingCodeReview) {
    renderCodeReviewSelection(root);
    return;
  }

  root.battleUi?.overlayHost?.replaceChildren();
}

function getEnemyMarkup(root, enemyData, intentInfo, ENEMIES) {
  const e = root.enemy;

  return `
      <div class="enemy-container">
        <div class="enemy-character">
          <div class="enemy-sprite">
            <div class="enemy-avatar">${getEnemyArt(e.id, ENEMIES)}</div>
            <div class="enemy-shadow"></div>
            ${e.block > 0 ? `<div class="shield-effect">${renderImage("assets/card-art/shield.png", "Shield", "shield-effect-img")}</div>` : ""}
            ${e.weak > 0 ? `<div class="debuff-effect">${renderImage("assets/card-art/heart_damaged.png", "Weak", "debuff-effect-img")}</div>` : ""}
          </div>
        </div>

        <div class="enemy-ui-panel">
          <div class="enemy-nameplate">
            <h2 class="enemy-title">${e.name}</h2>
            <div class="enemy-level">${getEnemyType(e.id)}</div>
          </div>
          <div class="enemy-health-section">
            <div class="health-bar-container">
              <div class="health-bar enemy-health">
                <div class="health-fill" style="width: ${(e.hp / e.maxHp) * 100}%"></div>
                <div class="health-text">${e.hp} / ${e.maxHp}</div>
                <div class="health-glow"></div>
              </div>
            </div>
            ${
              e.block > 0
                ? `
              <div class="status-effect block-status">
                ${renderImage("assets/card-art/shield.png", "Block", "status-icon-img")}
                <span class="status-value">${e.block}</span>
                <span class="status-label">Block</span>
              </div>
            `
                : ""
            }
          </div>

          <div class="intent-panel intent-${intentInfo.color}">
            <div class="intent-header">
              <span class="intent-label">Next Action</span>
            </div>
            <div class="intent-content">
              <div class="intent-icon-large">${intentInfo.emoji}</div>
              <div class="intent-description">${intentInfo.text}</div>
            </div>
          </div>
        </div>
      </div>
    `;
}

function getPlayerMarkup(root) {
  const p = root.player;

  return `
      <div class="player-container">
        <div class="player-character">
          <div class="player-sprite">
            <div class="player-avatar">
              <img src="assets/prime.webp" alt="Prime" class="player-avatar-img" />
            </div>
            <div class="player-shadow"></div>
            ${p.block > 0 ? `<div class="shield-effect">${renderImage("assets/card-art/shield.png", "Shield", "shield-effect-img")}</div>` : ""}
            ${p.weak > 0 ? `<div class="debuff-effect">${renderImage("assets/card-art/heart_damaged.png", "Weak", "debuff-effect-img")}</div>` : ""}
          </div>
        </div>

        <div class="player-ui-panel">
          <div class="player-nameplate">
            <h2 class="player-title">ThePrimeagen</h2>
            <div class="player-level">PLAYER</div>
          </div>

          <div class="player-health-section">
            <div class="health-bar-container">
              <div class="health-bar player-health">
                <div class="health-fill" style="width: ${(p.hp / p.maxHp) * 100}%"></div>
                <div class="health-text">${p.hp} / ${p.maxHp}</div>
                <div class="health-glow"></div>
              </div>
            </div>
            ${
              p.block > 0
                ? `
              <div class="status-effect block-status">
                ${renderImage("assets/card-art/shield.png", "Block", "status-icon-img")}
                <span class="status-value">${p.block}</span>
                <span class="status-label">Block</span>
              </div>
            `
                : ""
            }
            ${
              p.weak > 0
                ? `
              <div class="status-effect weak-status">
                ${renderImage("assets/card-art/heart_damaged.png", "Weak", "status-icon-img")}
                <span class="status-value">${p.weak}</span>
                <span class="status-label">Weak</span>
              </div>
            `
                : ""
            }
          </div>

          <div class="player-energy-section">
            <div class="energy-display">
              <span class="energy-label">⚡</span>
              <div class="energy-orbs">
                ${Array.from({ length: p.maxEnergy }, (_, i) => `<div class="energy-orb ${i < p.energy ? "active" : "inactive"}"></div>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
}

function getHandMarkup(root, CARDS) {
  const p = root.player;

  if (p.hand.length === 0) {
    return '<div class="no-cards-message">🎴 No cards in hand - End turn to draw new cards</div>';
  }

  return p.hand
    .map((card, i) => {
      const canPlay = p.energy >= card.cost;
      const cardType =
        card.type === "attack"
          ? "attack"
          : card.type === "skill"
            ? "skill"
            : "power";

      return `
          <div class="battle-card ${cardType} ${canPlay ? "playable" : "unplayable"}" data-play="${i}">
            <div class="card-glow"></div>
            <div class="card-frame">
              <div class="card-header-row">
                <div class="card-title">${card.name}</div>
                <div class="card-cost-orb ${canPlay ? "" : "insufficient"}">${card.cost}</div>
              </div>

              <div class="card-artwork">
                <div class="card-art-icon">${getCardArt(card.id, CARDS)}</div>
                <div class="card-type-badge ${cardType}">${card.type}</div>
              </div>

              <div class="card-description-box">
                <div class="card-text">${card.text}</div>
              </div>
            </div>
            ${canPlay ? "" : `<div class="card-disabled-overlay"><span>Need ${card.cost} energy</span></div>`}
          </div>
        `;
    })
    .join("");
}

function getEndTurnMarkup() {
  return `
      <button class="end-turn-btn" data-action="end">
        <span class="end-turn-text">End Turn</span>
        <span class="end-turn-hotkey">E</span>
      </button>
    `;
}

function getLogMarkup(root) {
  return root.logs
    .slice(-20)
    .map((log) => `<div class="log-entry">${log}</div>`)
    .join("");
}

function logsMatch(previousLogs, nextLogs) {
  if (previousLogs.length !== nextLogs.length) {
    return false;
  }

  return previousLogs.every((entry, index) => entry === nextLogs[index]);
}

function getLogOverlap(previousLogs, nextLogs) {
  const maxOverlap = Math.min(previousLogs.length, nextLogs.length);

  for (let overlap = maxOverlap; overlap >= 0; overlap--) {
    let matches = true;

    for (let index = 0; index < overlap; index++) {
      if (
        previousLogs[previousLogs.length - overlap + index] !== nextLogs[index]
      ) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return overlap;
    }
  }

  return 0;
}

function removeLeadingLogEntries(logContent, count) {
  for (let index = 0; index < count; index++) {
    if (!logContent.firstChild) {
      break;
    }

    logContent.removeChild(logContent.firstChild);
  }
}

function appendLogEntries(logContent, entries) {
  const fragment = document.createDocumentFragment();

  entries.forEach((entry) => {
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.textContent = entry;
    fragment.appendChild(logEntry);
  });

  logContent.appendChild(fragment);
}

function rebuildBattleLog(logContent, entries) {
  logContent.replaceChildren();
  appendLogEntries(logContent, entries);
}
