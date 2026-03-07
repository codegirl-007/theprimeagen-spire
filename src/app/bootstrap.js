import { MAPS } from "../data/maps.js";
import { attachRelics } from "../engine/battle.js";
import { InputManager } from "../input/InputManager.js";
import { GameStateMachine } from "../systems/state/GameStateMachine.js";
import { createGameRoot } from "./createGameRoot.js";
import { MapState } from "../features/map/MapState.js";
import { BattleState } from "../features/battle/BattleState.js";
import { RewardState } from "../features/reward/RewardState.js";
import { ShopState } from "../features/shop/ShopState.js";
import { RestState } from "../features/rest/RestState.js";
import { EventState } from "../features/event/EventState.js";
import { VictoryState } from "../features/endgame/VictoryState.js";
import { DefeatState } from "../features/endgame/DefeatState.js";
import { RelicSelectionState } from "../features/relic-selection/RelicSelectionState.js";

export async function bootstrap() {
    const app = document.getElementById("app");
    const root = createGameRoot(app);

    initializeStateMachine(root);
    initializeInput(root);
    initializePersistenceLifecycle(root);

    await initializeGame(root);
}

function initializeStateMachine(root) {
    try {
        root.stateMachine = new GameStateMachine(root);
        root.stateMachine.registerState("MAP", new MapState());
        root.stateMachine.registerState("BATTLE", new BattleState());
        root.stateMachine.registerState("REWARD", new RewardState());
        root.stateMachine.registerState("SHOP", new ShopState());
        root.stateMachine.registerState("REST", new RestState());
        root.stateMachine.registerState("EVENT", new EventState());
        root.stateMachine.registerState("VICTORY", new VictoryState());
        root.stateMachine.registerState("DEFEAT", new DefeatState());
        root.stateMachine.registerState("RELIC_SELECTION", new RelicSelectionState());
    } catch (error) {
        console.error("Error initializing state machine:", error);
    }
}

function initializeInput(root) {
    try {
        root.inputManager = new InputManager(root);
        root.inputManager.initGlobalListeners();
    } catch (error) {
        console.error("Error initializing InputManager:", error);
    }
}

function initializePersistenceLifecycle(root) {
    const flushSave = () => {
        root.flushSave?.();
    };

    window.addEventListener("pagehide", flushSave);
    window.addEventListener("beforeunload", flushSave);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            flushSave();
        }
    });
}

async function initializeGame(root) {
    const urlParams = new URLSearchParams(window.location.search);
    const screenParam = urlParams.get("screen");
    const dev = urlParams.get("dev");
    const now = new Date();
    const birthday = new Date("2025-09-09T00:00:00");

    if (now < birthday && dev !== "true") {
        showCountdown(birthday);
        return;
    }

    if (screenParam) {
        setupMockData(root);

        switch (screenParam.toLowerCase()) {
            case "victory":
            case "win":
                await root.stateMachine.setState("VICTORY");
                return;
            case "defeat":
            case "lose":
                await root.stateMachine.setState("DEFEAT");
                return;
            case "map":
                await root.stateMachine.setState("MAP");
                return;
            case "shop":
                await root.stateMachine.setState("SHOP");
                return;
            case "rest":
                await root.stateMachine.setState("REST");
                return;
            case "event":
                await root.stateMachine.setState("EVENT");
                return;
            case "battle":
                await root.go("n2");
                return;
            case "upgrade":
                await root.stateMachine.setState("REST");
                setTimeout(() => {
                    const upgradeBtn = root.app.querySelector("[data-act='upgrade']");
                    if (upgradeBtn) {
                        upgradeBtn.click();
                    }
                }, 100);
                return;
            case "relic":
            case "relics":
                await root.stateMachine.setState("RELIC_SELECTION");
                return;
            default:
                console.warn(`Unknown screen: ${screenParam}. Loading normal game.`);
                await loadNormalGame(root);
                return;
        }
    }

    await loadNormalGame(root);
}

function setupMockData(root) {
    root.player.hp = 42;
    root.player.maxHp = 50;
    root.player.gold = 150;
    root.player.energy = 3;
    root.player.deck = ["strike", "defend", "coffee_rush", "raw_dog", "segfault", "virgin"];
    root.player.hand = ["strike", "coffee_rush", "raw_dog"];
    root.player.draw = ["defend", "segfault"];
    root.player.discard = ["virgin"];

    attachRelics(root, ["terminal_coffee_thermos", "haskell"]);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("act2") === "true") {
        root.currentAct = "act2";
        root.map = MAPS.act2;
        root.completedNodes = ["a2n1", "a2n2"];
        root.nodeId = "a2n5";
        root.logs = [
            "Game loaded for testing",
            "Mock data initialized",
            "Testing Act 2: The Corporate Ladder!"
        ];
        return;
    }

    root.completedNodes = ["n1", "n2", "n4"];
    root.nodeId = "n7";
    root.logs = [
        "Game loaded for testing",
        "Mock data initialized",
        "Ready for screen testing!"
    ];
}

function showCountdown(birthday) {
    document.body.innerHTML = `
        <div class="countdown-screen">
            <div class="countdown-content">
                <div class="countdown-timer">
                    <div class="countdown-message">
                        <p>Your epic birthday surprise launches in:</p>
                    </div>

                    <div class="countdown-display">
                        <div class="time-unit">
                            <div class="time-number" id="days">--</div>
                            <div class="time-label">Days</div>
                        </div>
                        <div class="time-separator">:</div>
                        <div class="time-unit">
                            <div class="time-number" id="hours">--</div>
                            <div class="time-label">Hours</div>
                        </div>
                        <div class="time-separator">:</div>
                        <div class="time-unit">
                            <div class="time-number" id="minutes">--</div>
                            <div class="time-label">Minutes</div>
                        </div>
                        <div class="time-separator">:</div>
                        <div class="time-unit">
                            <div class="time-number" id="seconds">--</div>
                            <div class="time-label">Seconds</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const timer = setInterval(() => {
        const now = new Date();
        const timeLeft = birthday - now;

        if (timeLeft <= 0) {
            clearInterval(timer);
            window.location.reload();
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById("days").textContent = days.toString().padStart(2, "0");
        document.getElementById("hours").textContent = hours.toString().padStart(2, "0");
        document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0");
        document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0");
    }, 1000);
}

async function loadNormalGame(root) {
    const hasLoadedData = root.load();
    if (!hasLoadedData) {
        await root.reset();
        return;
    }

    if (root._battleInProgress) {
        const node = root.map.nodes.find((entry) => entry.id === root.nodeId);
        if (node && (node.kind === "battle" || node.kind === "elite" || node.kind === "boss")) {
            await root.go(root.nodeId);
        } else {
            root._battleInProgress = false;
            await root.stateMachine.setState("MAP");
        }
        return;
    }

    await root.stateMachine.setState("MAP");
}
