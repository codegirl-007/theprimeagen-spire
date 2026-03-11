import { MAPS } from "../data/maps.js";
import { makePlayer, initDeck } from "../engine/core.js";
import {
  playCard,
  endTurn,
  makeBattleContext,
  grantRelic,
} from "../engine/battle.js";

export function attachGameActions(root) {
  root.log = function log(message) {
    this.logs.push(message);
    this.logs = this.logs.slice(-200);
  };

  root.play = function play(index) {
    const battleCtx =
      this._battleContext || (this._battleContext = makeBattleContext(this));
    playCard(battleCtx, index);
  };

  root.end = function end() {
    const battleCtx =
      this._battleContext || (this._battleContext = makeBattleContext(this));
    endTurn(battleCtx);
  };

  root.go = async function go(nextId) {
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
  };

  root.afterNode = async function afterNode() {
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
  };

  root.onWin = async function onWin() {
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
        this.nodeId = this.map.nodes.find((entry) => entry.kind === "start").id;
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
  };

  root.onLose = async function onLose() {
    this._battleInProgress = false;
    this.player.block = 0;
    this.clearSave();
    await this.stateMachine.setState("DEFEAT");
  };

  root.reset = async function reset() {
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
  };

  root.selectStartingRelic = async function selectStartingRelic(relicId) {
    grantRelic(this, relicId);
    this.save();
    await this.stateMachine.setState("MAP");
  };

  decorateBattleAccessors(root);
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
