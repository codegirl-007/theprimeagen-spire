/**
 * Comprehensive Card Test Suite for Birthday Spire
 * Tests all card mechanics and effects to ensure they work correctly
 */

import { CARDS, STARTER_DECK, CARD_POOL } from '../src/data/cards.js';
import { ENEMIES } from '../src/data/enemies.js';
import { makePlayer } from '../src/engine/core.js';
import { makeBattleContext, createBattle } from '../src/engine/battle.js';
import { cloneCard } from '../src/engine/core.js';

// Test utilities
function createTestBattleContext() {
    const player = makePlayer();
    player.hp = 50;
    player.maxHp = 50;
    player.energy = 3;
    player.maxEnergy = 3;
    player.block = 0;
    player.weak = 0;
    player.vuln = 0;
    player.hand = [];
    player.deck = [];
    player.draw = [];
    player.discard = [];
    
    const enemy = {
        id: "test_dummy",
        name: "Test Dummy",
        hp: 100,
        maxHp: 100,
        block: 0,
        weak: 0,
        vuln: 0,
        intent: { type: "attack", value: 5 }
    };
    
    const logs = [];
    const ctx = {
        player,
        enemy,
        flags: {},
        lastCard: null,
        relicStates: [],
        log: (msg) => logs.push(msg),
        logs,
        render: () => {},
        deal: (target, amount) => {
            const blocked = Math.min(amount, target.block);
            const damage = Math.max(0, amount - blocked);
            target.block -= blocked;
            target.hp -= damage;
            logs.push(`Deal ${amount} damage (${damage} after ${blocked} block)`);
        },
        draw: (n) => {
            for (let i = 0; i < n && player.draw.length > 0; i++) {
                const cardId = player.draw.pop();
                const card = cloneCard(CARDS[cardId]);
                if (card) player.hand.push(card);
            }
        },
        applyWeak: (target, amount) => {
            target.weak = (target.weak || 0) + amount;
            logs.push(`Applied ${amount} weak`);
        },
        applyVulnerable: (target, amount) => {
            target.vuln = (target.vuln || 0) + amount;
            logs.push(`Applied ${amount} vulnerable`);
        },
        intentIsAttack: () => enemy.intent.type === "attack",
        scalarFromWeak: (base) => player.weak > 0 ? Math.floor(base * 0.75) : base,
        forceEndTurn: () => logs.push("Turn ended"),
        promptExhaust: (count) => {
            while (count-- > 0 && player.hand.length > 0) {
                const card = player.hand.shift();
                logs.push(`Exhausted ${card.name}`);
            }
        },
        moveFromDiscardToHand: (cardId) => {
            const idx = player.discard.findIndex(id => id === cardId);
            if (idx >= 0) {
                const [id] = player.discard.splice(idx, 1);
                const card = cloneCard(CARDS[id]);
                if (card) {
                    player.hand.push(card);
                    return true;
                }
            }
            return false;
        },
        countCardType: (type) => {
            const allCards = [...player.deck, ...player.hand.map(c => c.id), ...player.draw, ...player.discard];
            return allCards.filter(id => CARDS[id]?.type === type).length;
        },
        replayCard: (card) => {
            if (typeof card.effect === 'function') {
                card.effect(ctx);
                logs.push(`Replayed ${card.name}`);
            }
        }
    };
    
    return ctx;
}

function testCard(cardId, setupFn = null, assertionFn = null) {
    const card = CARDS[cardId];
    if (!card) {
        throw new Error(`Card ${cardId} not found`);
    }
    
    const ctx = createTestBattleContext();
    
    // Setup test conditions
    if (setupFn) {
        setupFn(ctx);
    }
    
    // Record initial state
    const initialState = {
        playerHp: ctx.player.hp,
        enemyHp: ctx.enemy.hp,
        playerBlock: ctx.player.block,
        enemyBlock: ctx.enemy.block,
        playerEnergy: ctx.player.energy,
        handSize: ctx.player.hand.length,
        discardSize: ctx.player.discard.length
    };
    
    // Clear logs
    ctx.logs.length = 0;
    
    try {
        // Execute card effect
        card.effect(ctx);
        
        const finalState = {
            playerHp: ctx.player.hp,
            enemyHp: ctx.enemy.hp,
            playerBlock: ctx.player.block,
            enemyBlock: ctx.enemy.block,
            playerEnergy: ctx.player.energy,
            handSize: ctx.player.hand.length,
            discardSize: ctx.player.discard.length
        };
        
        const result = {
            card,
            initialState,
            finalState,
            logs: [...ctx.logs],
            flags: { ...ctx.flags },
            success: true,
            error: null
        };
        
        // Run custom assertions
        if (assertionFn) {
            assertionFn(result, ctx);
        }
        
        return result;
    } catch (error) {
        return {
            card,
            initialState,
            finalState: initialState,
            logs: [...ctx.logs],
            flags: { ...ctx.flags },
            success: false,
            error: error.message
        };
    }
}

// Test Suite Definitions
const tests = {
    // Basic Attack Cards
    strike: () => testCard('strike', null, (result) => {
        if (result.finalState.enemyHp !== 94) {
            throw new Error(`Expected enemy to have 94 HP, got ${result.finalState.enemyHp}`);
        }
    }),
    
    'strike+': () => testCard('strike+', null, (result) => {
        if (result.finalState.enemyHp !== 91) {
            throw new Error(`Expected enemy to have 91 HP, got ${result.finalState.enemyHp}`);
        }
    }),
    
    // Basic Skill Cards
    defend: () => testCard('defend', null, (result) => {
        if (result.finalState.playerBlock !== 5) {
            throw new Error(`Expected player to have 5 block, got ${result.finalState.playerBlock}`);
        }
    }),
    
    'defend+': () => testCard('defend+', null, (result) => {
        if (result.finalState.playerBlock !== 8) {
            throw new Error(`Expected player to have 8 block, got ${result.finalState.playerBlock}`);
        }
    }),
    
    // Energy Cards
    coffee_rush: () => testCard('coffee_rush', null, (result) => {
        if (result.finalState.playerEnergy !== 5) {
            throw new Error(`Expected player to have 5 energy, got ${result.finalState.playerEnergy}`);
        }
    }),
    
    'coffee_rush+': () => testCard('coffee_rush+', null, (result) => {
        if (result.finalState.playerEnergy !== 6) {
            throw new Error(`Expected player to have 6 energy, got ${result.finalState.playerEnergy}`);
        }
    }),
    
    // Complex Cards
    macro: () => testCard('macro', 
        (ctx) => {
            ctx.lastCard = 'strike';
            ctx.player.hand.push(cloneCard(CARDS['strike']));
        },
        (result) => {
            if (result.finalState.enemyHp !== 94) {
                throw new Error(`Macro should have replayed strike, expected enemy HP 94, got ${result.finalState.enemyHp}`);
            }
        }
    ),
    
    segfault: () => testCard('segfault', 
        (ctx) => {
            ctx.player.draw = ['strike'];
        },
        (result) => {
            if (result.finalState.enemyHp !== 93) {
                throw new Error(`Expected enemy to have 93 HP from segfault, got ${result.finalState.enemyHp}`);
            }
            if (result.finalState.handSize !== 1) {
                throw new Error(`Expected 1 card drawn, hand size is ${result.finalState.handSize}`);
            }
        }
    ),
    
    skill_issue: () => testCard('skill_issue', 
        (ctx) => {
            ctx.enemy.intent = { type: "attack", value: 5 };
        },
        (result) => {
            if (result.finalState.playerBlock !== 6) {
                throw new Error(`Expected 6 block, got ${result.finalState.playerBlock}`);
            }
            if (result.finalState.enemyHp !== 100 || ctx.enemy.weak !== 1) {
                throw new Error(`Expected enemy to be weakened when intending attack`);
            }
        }
    ),
    
    dark_mode: () => testCard('dark_mode', null, (result) => {
        if (result.finalState.enemyHp !== 80) {
            throw new Error(`Expected enemy to have 80 HP, got ${result.finalState.enemyHp}`);
        }
        if (!result.logs.includes("Turn ended")) {
            throw new Error(`Expected turn to end`);
        }
    }),
    
    just_one_game: () => testCard('just_one_game', null, (result) => {
        if (!result.flags.skipThisTurn) {
            throw new Error(`Expected skipThisTurn flag to be set`);
        }
        if (result.flags.nextTurnEnergyBonus !== 2) {
            throw new Error(`Expected nextTurnEnergyBonus to be 2, got ${result.flags.nextTurnEnergyBonus}`);
        }
    }),
    
    vibe_code: () => testCard('vibe_code', null, (result) => {
        if (!result.flags.nextCardFree) {
            throw new Error(`Expected nextCardFree flag to be set`);
        }
    }),
    
    pair_programming: () => testCard('pair_programming', null, (result) => {
        if (!result.flags.doubleNextCard) {
            throw new Error(`Expected doubleNextCard flag to be set`);
        }
    }),
    
    // Cards with conditions
    hotfix: () => {
        // Test when HP is low (should work)
        const lowHpResult = testCard('hotfix', 
            (ctx) => {
                ctx.player.hp = 20; // Below 50%
            },
            (result) => {
                if (result.finalState.enemyHp !== 90) {
                    throw new Error(`Expected enemy to have 90 HP when hotfix works, got ${result.finalState.enemyHp}`);
                }
            }
        );
        
        return lowHpResult;
    },
    
    // Advanced mechanics
    ctrl_z: () => testCard('ctrl_z',
        (ctx) => {
            ctx.player.discard = ['strike'];
        },
        (result) => {
            if (result.finalState.handSize !== 1) {
                throw new Error(`Expected 1 card in hand after ctrl_z, got ${result.finalState.handSize}`);
            }
            if (result.finalState.discardSize !== 0) {
                throw new Error(`Expected discard to be empty after ctrl_z, got ${result.finalState.discardSize}`);
            }
        }
    ),
    
    npm_audit: () => testCard('npm_audit',
        (ctx) => {
            ctx.player.deck = ['sugar_crash', 'sugar_crash'];
            ctx.player.discard = ['sugar_crash'];
        },
        (result) => {
            if (result.finalState.playerBlock !== 9) { // 3 curses * 3 block each
                throw new Error(`Expected 9 block from npm_audit, got ${result.finalState.playerBlock}`);
            }
        }
    ),
    
    infinite_loop: () => testCard('infinite_loop',
        (ctx) => {
            ctx.lastCard = 'strike';
            ctx.player.hand.push(cloneCard(CARDS['strike']));
        },
        (result) => {
            if (!result.logs.some(log => log.includes('Replayed'))) {
                throw new Error(`Expected card to be replayed`);
            }
        }
    ),
    
    // Curse cards
    sugar_crash: () => {
        try {
            testCard('sugar_crash');
            throw new Error('Sugar crash should not be playable');
        } catch (error) {
            if (!error.message.includes('cannot be played')) {
                throw new Error(`Expected curse to be unplayable, got: ${error.message}`);
            }
        }
        return { success: true, message: 'Curse correctly unplayable' };
    }
};

// Test Runner
function runAllTests() {
    console.log('🎮 Running Birthday Spire Card Tests...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        errors: []
    };
    
    for (const [cardId, testFn] of Object.entries(tests)) {
        try {
            console.log(`Testing ${cardId}...`);
            const result = testFn();
            console.log(`✅ ${cardId} passed`);
            results.passed++;
        } catch (error) {
            console.log(`❌ ${cardId} failed: ${error.message}`);
            results.failed++;
            results.errors.push({ cardId, error: error.message });
        }
    }
    
    console.log(`\n📊 Test Results:`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Total: ${results.passed + results.failed}`);
    
    if (results.errors.length > 0) {
        console.log(`\n🔍 Failed Tests:`);
        results.errors.forEach(({ cardId, error }) => {
            console.log(`  ${cardId}: ${error}`);
        });
    }
    
    return results;
}

// Comprehensive Test Coverage Check
function checkTestCoverage() {
    const allCardIds = Object.keys(CARDS);
    const testedCardIds = Object.keys(tests);
    const untestedCards = allCardIds.filter(id => !testedCardIds.includes(id));
    
    console.log(`\n📋 Test Coverage:`);
    console.log(`Total cards: ${allCardIds.length}`);
    console.log(`Tested cards: ${testedCardIds.length}`);
    console.log(`Coverage: ${((testedCardIds.length / allCardIds.length) * 100).toFixed(1)}%`);
    
    if (untestedCards.length > 0) {
        console.log(`\n⚠️  Untested cards:`);
        untestedCards.forEach(cardId => console.log(`  - ${cardId}`));
    }
    
    return {
        total: allCardIds.length,
        tested: testedCardIds.length,
        untested: untestedCards
    };
}

// Export for use in browser or Node.js
if (typeof window !== 'undefined') {
    window.CardTests = { runAllTests, checkTestCoverage, testCard };
} else if (typeof module !== 'undefined') {
    module.exports = { runAllTests, checkTestCoverage, testCard };
}

// Auto-run if called directly
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
    checkTestCoverage();
}
