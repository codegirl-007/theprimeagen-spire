import { MAPS } from "../shared/data/maps.js";
import { makePlayer, initDeck } from "../shared/engine/core.js";
import {
  playCard,
  endTurn,
  makeBattleContext,
  attachRelics,
} from "../shared/engine/battle.js";
import { CommandInvoker } from "../client/commands/CommandInvoker.js";
import {
  renderBattle,
  showDamageNumber,
  updateCardSelection,
} from "../client/features/battle/battleRender.js";
import { renderMap } from "../client/features/map/mapRender.js";
import { renderUpgrade } from "../client/features/rest/restRender.js";
import { renderCodeReviewSelection } from "../client/features/endgame/codeReviewRender.js";
import { attachPersistence } from "../client/app/localPersistence.js";
import { attachRewardFlow } from "../shared/game/rewardFlow.js";

export function createGameRoot(app) {
  const root = {
    app,
    logs: [],
    map: MAPS.act1,
    nodeId: "n1",
    currentAct: "act1",
    player: makePlayer(),
    relicStates: [],
    completedNodes: [],
    enemy: null,
    inputManager: null,
    commandInvoker: new CommandInvoker(),
    stateMachine: null,
    currentEvent: null,
    currentShopCards: null,
    currentShopRelic: null,
    _codeReviewCards: null,
    _codeReviewCallback: null,
    _battleContext: null,
    selectedCardIndex: null,
    ui: {
      renderMap,
      renderUpgrade,
      updateCardSelection,
      renderCodeReviewSelection,
    },

    log(message) {
      this.logs.push(message);
      this.logs = this.logs.slice(-200);
    },

    async render() {
      if (this.stateMachine) {
        await this.stateMachine.render();
        return;
      }
      await renderBattle(this);
    },

    play(index) {
      const battleCtx =
        this._battleContext || (this._battleContext = makeBattleContext(this));
      playCard(battleCtx, index);
    },

    showDamageNumber,

    // end the turn
    end() {
      const battleCtx =
        this._battleContext || (this._battleContext = makeBattleContext(this));
      endTurn(battleCtx);
    },

    async go(nextId) {
      this.nodeId = nextId;
      const node = this.map.nodes.find((entry) => entry.id === nextId);
      if (!node) {
        return;
      }

      if (
        node.kind === "battle" ||
        node.kind === "elite" ||
        node.kind === "boss"
      ) {
        await this.stateMachine.setState("BATTLE");
      } else if (node.kind === "rest") {
        await this.stateMachine.setState("REST");
      } else if (node.kind === "shop") {
        await this.stateMachine.setState("SHOP");
      } else if (node.kind === "event") {
        await this.stateMachine.setState("EVENT");
      } else if (node.kind === "start") {
        await this.stateMachine.setState("MAP");
      }
    },

    async afterNode() {
      if (this.nodeId && !this.completedNodes.includes(this.nodeId)) {
        this.completedNodes.push(this.nodeId);
      }

      const node = this.map.nodes.find((entry) => entry.id === this.nodeId);
      if (!node) {
        return;
      }

      if (node.kind === "battle" || node.kind === "elite") {
        await this.enterRewardSelection();
        return;
      }

      if (node.kind === "boss") {
        await this.stateMachine.setState("VICTORY");
        return;
      }

      await this.stateMachine.setState("MAP");
    },

    async onWin() {
      this.log("Enemy defeated!");
      this.player.block = 0;

      const goldReward = Math.floor(Math.random() * 20) + 15;
      this.player.gold = (this.player.gold || 0) + goldReward;
      this.log(`+${goldReward} gold`);
      this._battleInProgress = false;

      const node = this.map.nodes.find((entry) => entry.id === this.nodeId);
      if (!node) {
        return;
      }

      if (node.kind === "boss") {
        const nextAct = this.currentAct === "act1" ? "act2" : null;
        if (nextAct && MAPS[nextAct]) {
          this.currentAct = nextAct;
          this.map = MAPS[nextAct];
          this.nodeId = this.map.nodes.find(
            (entry) => entry.kind === "start",
          ).id;
          this.completedNodes = [];
          this.log(
            `Act ${this.currentAct === "act2" ? "II" : "I"} Complete! Advancing to the next challenge...`,
          );

          if (nextAct === "act2") {
            this.saveAct2Checkpoint();
          }

          this.save();
          await this.stateMachine.setState("MAP");
          return;
        }

        this.save();
        this.clearSave();
        await this.stateMachine.setState("VICTORY");
        return;
      }

      this.save();
      await this.afterNode();
    },

    async onLose() {
      this._battleInProgress = false;
      this.player.block = 0;
      this.clearSave();
      await this.stateMachine.setState("DEFEAT");
    },

    async reset() {
      this.logs = [];
      this.player = makePlayer();
      initDeck(this.player);
      this.currentAct = "act1";
      this.map = MAPS.act1;
      this.nodeId = "n1";
      this.completedNodes = [];
      this.currentRewardChoices = null;
      this.currentEvent = null;
      this.currentShopCards = null;
      this.currentShopRelic = null;
      this._battleInProgress = false;
      await this.stateMachine.setState("RELIC_SELECTION");
    },

    async selectStartingRelic(relicId) {
      attachRelics(this, [relicId]);
      this.save();
      await this.stateMachine.setState("MAP");
    },
  };

  attachPersistence(root);
  attachRewardFlow(root);
  decorateBattleAccessors(root);

  return root;
}

function decorateBattleAccessors(root) {
  const baseGo = root.go.bind(root);

  root.go = async function go(nextId) {
    await baseGo(nextId);
    const node = this.map.nodes.find((entry) => entry.id === this.nodeId);
    if (
      !node ||
      (node.kind !== "battle" && node.kind !== "elite" && node.kind !== "boss")
    ) {
      return;
    }

    const ctx =
      this._battleContext || (this._battleContext = makeBattleContext(this));
    this.deal = ctx.deal;
    this.applyWeak = ctx.applyWeak;
    this.applyVulnerable = ctx.applyVulnerable;
    this.draw = ctx.draw;
    this.forceEndTurn = ctx.forceEndTurn;
    this.promptExhaust = ctx.promptExhaust;
    this.scalarFromWeak = ctx.scalarFromWeak;
    this.intentIsAttack = ctx.intentIsAttack;
    this.showDamageNumber = ctx.showDamageNumber;
    this.flags = ctx.flags;
    this.lastCard = ctx.lastCard;
  };
}
