import { ENEMIES } from "../data/enemies.js";
import { RELICS } from "../data/relics.js";
import { CARDS } from "../data/cards.js";
import { draw, endTurnDiscard, clamp, cloneCard, shuffle } from "./core.js";

export function createBattle(ctx, enemyId) {
    const enemyData = ENEMIES[enemyId];
    const enemy = { id: enemyId, name: enemyData.name, maxHp: enemyData.maxHp, hp: enemyData.maxHp, block: 0, weak: 0, vuln: 0, turn: 1, intent: enemyData.ai(1) };
    ctx.enemy = enemy;
    ctx.flags = {};
    ctx.lastCard = null;

    // Initialize draw pile from current deck for the battle
    ctx.player.draw = shuffle(ctx.player.deck.slice());
    ctx.player.discard = [];
    ctx.player.hand = [];


    const relicCtx = { 
        ...ctx, 
        draw: (n) => draw(ctx.player, n, ctx),
        applyWeak: (who, amt) => { who.weak = (who.weak || 0) + amt; ctx.log(`${who === ctx.player ? 'You are' : ctx.enemy.name + ' is'} weakened for ${amt} turn${amt > 1 ? 's' : ''}.`) },
        applyVulnerable: (who, amt) => { who.vuln = (who.vuln || 0) + amt; ctx.log(`${who === ctx.player ? 'You are' : ctx.enemy.name + ' is'} vulnerable for ${amt} turn${amt > 1 ? 's' : ''}.`) }
    };
    for (const r of ctx.relicStates) r.hooks?.onBattleStart?.(relicCtx, r.state);

    startPlayerTurn(ctx);
}

export function startPlayerTurn(ctx) {
    if (ctx.flags.skipThisTurn) { ctx.flags.skipThisTurn = false; enemyTurn(ctx); return; }
    ctx.player.energy = ctx.player.maxEnergy + (ctx.flags.nextTurnEnergyBonus || 0) - (ctx.flags.nextTurnEnergyPenalty || 0);
    ctx.flags.nextTurnEnergyBonus = 0;
    ctx.flags.nextTurnEnergyPenalty = 0;
    draw(ctx.player, 5 - ctx.player.hand.length, ctx);

    // Clear card selection when new turn starts
    ctx.selectedCardIndex = null;

    const relicCtx = { ...ctx, draw: (n) => draw(ctx.player, n, ctx) };
    for (const r of ctx.relicStates) r.hooks?.onTurnStart?.(relicCtx, r.state);
    ctx.log(`Your turn begins. You have ${ctx.player.energy} energy to spend.`);

    ctx.render();
}

export function playCard(ctx, handIndex) {
    const card = ctx.player.hand[handIndex];
    if (!card) return;
    

    let actualCost = card.cost;
    if (ctx.flags.nextCardFree) {
        actualCost = 0;
        ctx.flags.nextCardFree = false;
        ctx.log("Infinite Vim makes your next card free!");
    }
    
    if (ctx.player.energy < actualCost) { ctx.log(`You need ${actualCost} energy but only have ${ctx.player.energy}.`); return; }
    if (card.oncePerFight && card._used) { ctx.log(`${card.name} can only be used once per fight.`); return; }
    
    // Check card-specific play conditions
    if (card.id === "hotfix" && ctx.player.hp > ctx.player.maxHp * 0.5) {
        ctx.log("Hotfix can only be deployed when HP is below 50%!");
        return;
    }
    
    // Prevent playing curse cards
    if (card.type === "curse") {
        ctx.log(`${card.name} cannot be played!`);
        return;
    }

    ctx.player.energy -= actualCost;
    ctx.lastCard = card.id;


    const prevDeal = ctx.deal;
    ctx.deal = (target, amount) => {
        let amt = amount;
        
        // Handle doubleNextCard flag
        if (ctx.flags.doubleNextCard) {
            amt *= 2;
            ctx.flags.doubleNextCard = false;
            ctx.log("Pair Programming doubles the damage!");
        }
        
        for (const r of ctx.relicStates) {
            if (r.hooks?.onPlayerAttack) amt = r.hooks.onPlayerAttack(ctx, r.state, amt);
        }
        prevDeal(target, amt);
    };


    if (typeof card.effect !== 'function') {
        console.error('Card effect is not a function:', card);
        ctx.log(`Error: ${card.name || 'Unknown card'} has no effect function`);
        return;
    }
    
    try {
        card.effect(ctx);
        card._used = true;
    } catch (error) {
        console.error('Card effect error:', error, 'Card:', card);
        ctx.log(`Error playing ${card.name || 'Unknown card'}: ${error.message}`);
        return;
    }


    if (card.type !== "power") {
        const [used] = ctx.player.hand.splice(handIndex, 1);
        if (!card.exhaust) {
            ctx.player.discard.push(used.id);
        } else {
            ctx.log(`${used.name} is exhausted and removed from the fight.`);
        }
    }

    if (ctx.enemy.hp <= 0) { ctx.enemy.hp = 0; ctx.onWin(); return; }
    if (ctx.player.hp <= 0) { ctx.onLose(); return; }
    ctx.render();
}

export function endTurn(ctx) {
    endTurnDiscard(ctx.player);
    enemyTurn(ctx);
}

export function enemyTurn(ctx) {
    const e = ctx.enemy;

    if (e.intent.type === "attack") {
        let dmg = e.intent.value;
        if (e.weak > 0) dmg = Math.floor(dmg * 0.75);
        applyDamage(ctx, ctx.player, dmg, `${e.name} attacks`);
    } else if (e.intent.type === "block") {
        try {
            ENEMIES[e.id].onBlock?.(ctx, e.intent.value);
            e.block += e.intent.value;
            ctx.log(`${e.name} defends and gains ${e.intent.value} block.`);
        } catch (error) {
            console.error('Enemy block effect error:', error, 'Enemy:', e.id);
            ctx.log(`${e.name} tries to defend but fumbles!`);
        }
    } else if (e.intent.type === "debuff") {
        try {
            ENEMIES[e.id].onDebuff?.(ctx, e.intent.value);
            ctx.log(`${e.name} casts a debuffing spell.`);
        } catch (error) {
            console.error('Enemy debuff effect error:', error, 'Enemy:', e.id);
            ctx.log(`${e.name} tries to cast a spell but it fizzles!`);
        }
    } else if (e.intent.type === "heal") {
        try {
            ENEMIES[e.id].onHeal?.(ctx, e.intent.value);
        } catch (error) {
            console.error('Enemy heal effect error:', error, 'Enemy:', e.id);
            ctx.log(`${e.name} tries to heal but something goes wrong!`);
        }
    }


    if (e.weak > 0) e.weak--;
    if (ctx.player.weak > 0) ctx.player.weak--;


    if (ctx.player.hp <= 0) { ctx.onLose(); return; }

    e.turn++;
    try {
        e.intent = ENEMIES[e.id].ai(e.turn);
        if (!e.intent || !e.intent.type) {
            throw new Error('Invalid enemy intent returned');
        }
    } catch (error) {
        console.error('Enemy AI error:', error, 'Enemy:', e.id);
        ctx.log(`Enemy AI malfunction! ${e.name} does nothing this turn.`);
        e.intent = { type: "block", value: 0 }; // Safe fallback
    }
    startPlayerTurn(ctx);
}

function applyDamage(ctx, target, raw, label) {
    let dmg = raw;
    for (const r of ctx.relicStates) {
        if (r.hooks?.onDamageTaken && target === ctx.player) dmg = r.hooks.onDamageTaken(ctx, dmg);
    }
    const blocked = Math.min(dmg, target.block);
    const hpLoss = Math.max(0, dmg - blocked);
    target.block -= blocked;
    target.hp = clamp(target.hp - hpLoss, 0, target.maxHp);
    const isPlayer = target === ctx.player;
    if (blocked > 0 && hpLoss > 0) {
        ctx.log(`${label} for ${dmg} damage. ${blocked} blocked, ${hpLoss} damage taken.`);
    } else if (blocked > 0) {
        ctx.log(`${label} for ${dmg} damage, but it's completely blocked!`);
    } else {
        ctx.log(`${label} for ${dmg} damage!`);
    }
    

    if (hpLoss > 0 && ctx.showDamageNumber) {
        const isPlayer = target === ctx.player;
        ctx.showDamageNumber(hpLoss, target, isPlayer);
    }
}

export function makeBattleContext(root) {
    return {
        player: root.player,
        enemy: root.enemy,
        discard: root.player.discard,
        relicStates: root.relicStates || [],
        draw: (n) => draw(root.player, n, root),
        log: (m) => root.log(m),
        render: () => root.render(),
        onWin: () => root.onWin(),
        onLose: () => root.onLose(),
        intentIsAttack: () => root.enemy.intent.type === "attack",
        deal: (target, amount) => applyDamage(root, target, amount, target === root.enemy ? "You attack" : `${root.enemy.name} hits you`),
        applyWeak: (who, amt) => { who.weak = (who.weak || 0) + amt; root.log(`${who === root.player ? 'You are' : root.enemy.name + ' is'} weakened for ${amt} turn${amt > 1 ? 's' : ''}.`) },
        applyVulnerable: (who, amt) => { who.vuln = (who.vuln || 0) + amt; root.log(`${who === root.player ? 'You are' : root.enemy.name + ' is'} vulnerable for ${amt} turn${amt > 1 ? 's' : ''}.`) },
        forceEndTurn: () => endTurn(root),
        promptExhaust: async (count) => { // MVP: exhaust first N non-basics
            while (count-- > 0 && root.player.hand.length > 0) {
                const idx = root.player.hand.findIndex(c => !["strike", "defend"].includes(c.id));
                const drop = idx >= 0 ? idx : 0;
                const [ex] = root.player.hand.splice(drop, 1);
                root.log(`${ex.name} is exhausted and removed from the fight.`);
            }
        },
        scalarFromWeak: (base) => (root.player.weak > 0 ? Math.floor(base * 0.75) : base),
        showDamageNumber: root.showDamageNumber,
        lastCard: null,
        flags: {},
        // New mechanics for advanced cards
        moveFromDiscardToHand: (cardId) => {
            const idx = root.player.discard.findIndex(id => id === cardId);
            if (idx >= 0) {
                const [id] = root.player.discard.splice(idx, 1);
                const originalCard = CARDS[id];
                if (originalCard) {
                    const clonedCard = cloneCard(originalCard);
                    root.player.hand.push(clonedCard);
                    return true;
                }
            }
            return false;
        },
        countCardType: (type) => {
            const allCards = [...root.player.deck, ...root.player.hand.map(c => c.id), ...root.player.draw, ...root.player.discard];
            return allCards.filter(id => CARDS[id]?.type === type).length;
        },
        replayCard: (card) => {
            // Temporarily replay a card without removing it from hand
            if (typeof card.effect === 'function') {
                const battleCtx = makeBattleContext(root);
                card.effect(battleCtx);
                root.log(`${card.name} is replayed!`);
            }
        },
    };
}

export function attachRelics(root, relicIds) {
    root.relicStates = relicIds.map(id => ({ id, hooks: RELICS[id].hooks || {}, state: structuredClone(RELICS[id].state || {}) }));

    const relicCtx = { 
        ...root, 
        draw: (n) => draw(root.player, n),
        applyWeak: (who, amt) => { who.weak = (who.weak || 0) + amt; root.log(`Weak +${amt}`) },
        applyVulnerable: (who, amt) => { who.vuln = (who.vuln || 0) + amt; root.log(`Vulnerable +${amt}`) }
    };
    for (const r of root.relicStates) r.hooks?.onRunStart?.(relicCtx, r.state);
}

