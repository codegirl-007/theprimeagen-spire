import { CARDS } from "../../shared/data/cards.js";
import { MAPS } from "../../shared/data/maps.js";

export function attachPersistence(root) {
  root._saveDirty = false;
  root._saveScheduled = false;
  root._saveTimerId = null;
  root._saveIdleId = null;

  root.buildSaveData = function buildSaveData() {
    return {
      player: this.player,
      nodeId: this.nodeId,
      currentAct: this.currentAct,
      relicStates: this.relicStates,
      completedNodes: this.completedNodes,
      logs: this.logs.slice(-50),
      battleInProgress: this._battleInProgress || false,
      enemy: this.enemy,
      flags: this.flags,
      lastCard: this.lastCard,
      pendingCodeReview: this.pendingCodeReview,
      stateMachine: this.stateMachine ? this.stateMachine.getSaveData() : null,
      timestamp: Date.now(),
    };
  };

  root.cancelScheduledSave = function cancelScheduledSave() {
    if (
      this._saveIdleId !== null &&
      typeof window !== "undefined" &&
      "cancelIdleCallback" in window
    ) {
      window.cancelIdleCallback(this._saveIdleId);
    }
    if (this._saveTimerId !== null) {
      clearTimeout(this._saveTimerId);
    }

    this._saveIdleId = null;
    this._saveTimerId = null;
    this._saveScheduled = false;
  };

  root.flushSave = function flushSave() {
    try {
      this.cancelScheduledSave();
      if (!this._saveDirty) {
        return;
      }

      const saveData = this.buildSaveData();
      localStorage.setItem("birthday-spire-save", JSON.stringify(saveData));
      this._saveDirty = false;
    } catch (error) {
      console.warn("Failed to save game:", error);
    }
  };

  root.scheduleSave = function scheduleSave() {
    this._saveDirty = true;
    if (this._saveScheduled) {
      return;
    }

    this._saveScheduled = true;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      this._saveIdleId = window.requestIdleCallback(
        () => {
          this.flushSave();
        },
        { timeout: 500 },
      );
      return;
    }

    this._saveTimerId = setTimeout(() => {
      this.flushSave();
    }, 75);
  };

  root.save = function save() {
    this._saveDirty = true;
    this.flushSave();
  };

  root.saveAct2Checkpoint = function saveAct2Checkpoint() {
    try {
      const checkpointData = {
        player: {
          ...this.player,
          hp: this.player.maxHp,
          energy: this.player.maxEnergy,
          block: 0,
          weak: 0,
          vuln: 0,
          hand: [],
          draw: [],
          discard: [],
        },
        currentAct: "act2",
        relicStates: this.relicStates,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        "birthday-spire-act2-checkpoint",
        JSON.stringify(checkpointData),
      );
      this.log("Act 2 checkpoint saved!");
    } catch (error) {
      console.warn("Failed to save Act 2 checkpoint:", error);
    }
  };

  root.loadAct2Checkpoint = function loadAct2Checkpoint() {
    try {
      const checkpointData = localStorage.getItem(
        "birthday-spire-act2-checkpoint",
      );
      if (!checkpointData) {
        return false;
      }

      const data = JSON.parse(checkpointData);
      this.logs = [];
      this.player = data.player;
      this.currentAct = "act2";
      this.map = MAPS.act2;
      this.nodeId = "n1";
      this.completedNodes = [];
      this.relicStates = data.relicStates || [];
      this._battleInProgress = false;
      this._saveDirty = false;
      this.cancelScheduledSave();

      this.log("Restarting from Act 2 checkpoint...");
      return true;
    } catch (error) {
      console.warn("Failed to load Act 2 checkpoint:", error);
      return false;
    }
  };

  root.hasAct2Checkpoint = function hasAct2Checkpoint() {
    try {
      const checkpointData = localStorage.getItem(
        "birthday-spire-act2-checkpoint",
      );
      return !!checkpointData;
    } catch {
      return false;
    }
  };

  root.restoreCardEffects = function restoreCardEffects() {
    const restoreCard = (card) => {
      if (card && card.id && !card.effect) {
        const originalCard = CARDS[card.id];
        if (originalCard && originalCard.effect) {
          card.effect = originalCard.effect;
        }
      }
    };

    if (this.player.hand) {
      this.player.hand.forEach(restoreCard);
    }
  };

  root.load = function load() {
    try {
      const saveData = localStorage.getItem("birthday-spire-save");
      if (!saveData) {
        return false;
      }

      const data = JSON.parse(saveData);
      if (!data || typeof data !== "object") {
        throw new Error("Invalid save data format");
      }
      if (!data.player || typeof data.player !== "object") {
        throw new Error("Invalid player data");
      }
      if (!data.nodeId || typeof data.nodeId !== "string") {
        throw new Error("Invalid node ID");
      }

      const actId = data.currentAct || "act1";
      if (!MAPS[actId]) {
        console.warn(`Invalid act ${actId}, falling back to act1`);
        this.currentAct = "act1";
      } else {
        this.currentAct = actId;
      }

      this.map = MAPS[this.currentAct];

      const nodeExists = this.map.nodes.some((node) => node.id === data.nodeId);
      if (!nodeExists) {
        console.warn(
          `Node ${data.nodeId} not found in ${this.currentAct}, starting from beginning`,
        );
        this.nodeId = this.map.nodes.find((node) => node.kind === "start").id;
      } else {
        this.nodeId = data.nodeId;
      }

      if (typeof data.player.hp !== "number" || data.player.hp < 0) {
        throw new Error("Invalid player HP");
      }
      if (typeof data.player.maxHp !== "number" || data.player.maxHp <= 0) {
        throw new Error("Invalid player max HP");
      }
      if (!Array.isArray(data.player.deck)) {
        throw new Error("Invalid player deck");
      }

      this.player = data.player;
      this.relicStates = Array.isArray(data.relicStates)
        ? data.relicStates
        : [];
      this.completedNodes = Array.isArray(data.completedNodes)
        ? data.completedNodes
        : [];
      this.logs = Array.isArray(data.logs) ? data.logs : [];
      this._battleInProgress = Boolean(data.battleInProgress);
      this.pendingCodeReview = data.pendingCodeReview || null;

      if (data.stateMachine && this.stateMachine) {
        this.stateMachine.restoreFromSave(data.stateMachine);
      }

      this.restoreCardEffects();
      this._saveDirty = false;
      this.cancelScheduledSave();
      this.log("Game loaded from save.");
      return true;
    } catch (error) {
      console.warn("Failed to load game:", error);
      console.warn("Clearing corrupted save data");
      this.clearSave();
      return false;
    }
  };

  root.clearSave = function clearSave() {
    this.cancelScheduledSave();
    this._saveDirty = false;
    localStorage.removeItem("birthday-spire-save");
    localStorage.removeItem("birthday-spire-act2-checkpoint");
  };
}
