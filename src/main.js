import { CARDS, CARD_POOL } from "./data/cards.js";
import { START_RELIC_CHOICES } from "./data/relics.js";
import { ENEMIES } from "./data/enemies.js";
import { MAPS } from "./data/maps.js";
import { makePlayer, initDeck, draw } from "./engine/core.js";
import { createBattle, startPlayerTurn, playCard, endTurn, makeBattleContext, attachRelics } from "./engine/battle.js";
import { renderBattle, renderMap, renderReward, renderRest, renderShop, renderWin, renderLose, renderEvent, renderRelicSelection, showDamageNumber } from "./ui/render.js";

const app = document.getElementById("app");


const root = {
    app, logs: [], map: MAPS.act1, nodeId: "n1",
    player: makePlayer(),
    relicStates: [],
    completedNodes: [],
    enemy: null,

    log(m) { this.logs.push(m); this.logs = this.logs.slice(-200); },
    render() { renderBattle(this); },
    play(i) { playCard(this, i); },
    showDamageNumber: showDamageNumber,
    end() { endTurn(this); },


    go(nextId) {
        this.nodeId = nextId; // Always set nodeId (needed for battle logic)
        const node = this.map.nodes.find(n => n.id === nextId);
        if (!node) return;
        
        if (node.kind === "battle" || node.kind === "elite" || node.kind === "boss") {

            this._battleInProgress = true;
            createBattle(this, node.enemy);
            renderBattle(this);
        } else {

            this.save();
            if (node.kind === "rest") {
                renderRest(this);
            } else if (node.kind === "shop") {
                renderShop(this);
            } else if (node.kind === "event") {
                renderEvent(this);
            } else if (node.kind === "start") {
                renderMap(this);
            }
        }
    },

    afterNode() {
        if (this.nodeId && !this.completedNodes.includes(this.nodeId)) {
            this.completedNodes.push(this.nodeId);
        }
        

        const node = this.map.nodes.find(n => n.id === this.nodeId);
        if (node.kind === "battle" || node.kind === "elite") {
            const choices = pickCards(3);
            this._pendingChoices = choices;
            renderReward(this, choices);
            return;
        }
        if (node.kind === "boss") {
            renderWin(this); return;
        }

        renderMap(this);
    },

    takeReward(idx) {
        const card = this._pendingChoices[idx];
        if (card) {
            this.player.deck.push(card.id);
            this.log(`Added card: ${card.name}`);
        }
        this._pendingChoices = null;
        this.save();
        renderMap(this);
    },
    skipReward() { 
        this._pendingChoices = null; 
        this.save();
        renderMap(this); 
    },

    onWin() {
        this.log("Enemy defeated! 🎉");

        const goldReward = Math.floor(Math.random() * 20) + 15; // 15-35 gold
        this.player.gold = (this.player.gold || 0) + goldReward;
        this.log(`+${goldReward} gold`);
        

        this._battleInProgress = false;
        
        const node = this.map.nodes.find(n => n.id === this.nodeId);
        if (node.kind === "boss") { 
            this.save(); // Save progress before clearing on victory
            this.clearSave(); // Clear save on victory
            renderWin(this); 
        }
        else {

            this.save();
            this.afterNode();
        }
    },
    onLose() { 

        this._battleInProgress = false;
        this.clearSave(); // Clear save on defeat
        renderLose(this); 
    },

    reset() {
        this.logs = [];
        this.player = makePlayer();
        initDeck(this.player);
        this.nodeId = "n1";
        this.completedNodes = [];

        renderRelicSelection(this);
    },

    selectStartingRelic(relicId) {
        attachRelics(this, [relicId]);
        this.log(`Selected starting relic: ${relicId}`);
        this.save();
        renderMap(this);
    },

    save() {
        if (this._battleInProgress) {
            return;
        }
        
        try {
            const saveData = {
                player: this.player,
                nodeId: this.nodeId,
                relicStates: this.relicStates,
                completedNodes: this.completedNodes,
                logs: this.logs.slice(-50), // Keep last 50 logs
                timestamp: Date.now()
            };
            localStorage.setItem('birthday-spire-save', JSON.stringify(saveData));
        } catch (e) {
            console.warn('Failed to save game:', e);
        }
    },

    load() {
        try {
            const saveData = localStorage.getItem('birthday-spire-save');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.player = data.player;
                this.nodeId = data.nodeId;
                this.relicStates = data.relicStates || [];
                this.completedNodes = data.completedNodes || [];
                this.logs = data.logs || [];
                

                this.restoreCardEffects();
                
                this.log('Game loaded from save.');
                return true;
            }
        } catch (e) {
            console.warn('Failed to load game:', e);
        }
        return false;
    },

    restoreCardEffects() {

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
    },

    clearSave() {
        localStorage.removeItem('birthday-spire-save');
    }
};

function pickCards(n) {
    const ids = shuffle(CARD_POOL.slice()).slice(0, n);
    return ids.map(id => CARDS[id]);
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a; }

const _createBattle = root.go.bind(root);
root.go = function(nextId) {
    _createBattle(nextId);
    const node = this.map.nodes.find(n => n.id === this.nodeId);
    if (node && (node.kind === "battle" || node.kind === "elite" || node.kind === "boss")) {
        const ctx = makeBattleContext(this);

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
    }
};


function initializeGame() {
    const urlParams = new URLSearchParams(window.location.search);
    const screenParam = urlParams.get('screen');
    if (screenParam) {
        setupMockData();
        
        switch (screenParam.toLowerCase()) {
            case 'victory':
            case 'win':
                renderWin(root);
                return;
            case 'defeat':
            case 'lose':
                renderLose(root);
                return;
            case 'map':
                renderMap(root);
                return;
            case 'shop':
                renderShop(root);
                return;
            case 'rest':
                renderRest(root);
                return;
            case 'event':
                renderEvent(root);
                return;
            case 'battle':
                root.go('n2'); // Battle node
                return;
            case 'upgrade':
                renderRest(root);
                setTimeout(() => {
                    const upgradeBtn = root.app.querySelector("[data-act='upgrade']");
                    if (upgradeBtn) upgradeBtn.click();
                }, 100);
                return;
            case 'relic':
            case 'relics':
                renderRelicSelection(root);
                return;
            default:
                console.warn(`Unknown screen: ${screenParam}. Loading normal game.`);
                loadNormalGame();
                return;
        }
    } else {
        loadNormalGame();
    }
}

function setupMockData() {
    root.player.hp = 42;
    root.player.maxHp = 50;
    root.player.gold = 150;
    root.player.energy = 3;
    root.player.deck = ['strike', 'defend', 'coffee_rush', 'raw_dog', 'segfault', 'virgin'];
    root.player.hand = ['strike', 'coffee_rush', 'raw_dog'];
    root.player.draw = ['defend', 'segfault'];
    root.player.discard = ['virgin'];
    
    attachRelics(root, ['coffee_thermos', 'cpp_compiler']);
    
    root.completedNodes = ['n1', 'n2', 'n4'];
    root.nodeId = 'n7';
    root.logs = [
        'Game loaded for testing',
        'Mock data initialized',
        'Ready for screen testing!'
    ];
}

function loadNormalGame() {
    const hasLoadedData = root.load();
    if (hasLoadedData) {
        renderMap(root);
    } else {
        root.reset();
    }
}

initializeGame();

