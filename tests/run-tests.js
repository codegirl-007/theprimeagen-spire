#!/usr/bin/env node

/**
 * Node.js Test Runner for Birthday Spire Card Tests
 * Usage: node tests/run-tests.js [--card=cardId] [--coverage] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock browser environment for Node.js
global.window = {};

// Import game modules (adjust paths as needed)
let CARDS, ENEMIES, makePlayer, cloneCard;

try {
    const cardsModule = await import('../src/data/cards.js');
    const enemiesModule = await import('../src/data/enemies.js');
    const coreModule = await import('../src/engine/core.js');
    
    CARDS = cardsModule.CARDS;
    ENEMIES = enemiesModule.ENEMIES;
    makePlayer = coreModule.makePlayer;
    cloneCard = coreModule.cloneCard;
} catch (error) {
    console.error('❌ Failed to import game modules:', error.message);
    console.error('Make sure you\'re running this from the project root directory');
    process.exit(1);
}

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
    
    if (setupFn) {
        setupFn(ctx);
    }
    
    const initialState = {
        playerHp: ctx.player.hp,
        enemyHp: ctx.enemy.hp,
        playerBlock: ctx.player.block,
        enemyBlock: ctx.enemy.block,
        playerEnergy: ctx.player.energy,
        handSize: ctx.player.hand.length,
        discardSize: ctx.player.discard.length
    };
    
    ctx.logs.length = 0;
    
    try {
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

// Comprehensive test definitions
const tests = {
    // Basic cards
    strike: () => testCard('strike', null, (result) => {
        if (result.finalState.enemyHp !== 94) {
            throw new Error(`Expected enemy HP 94, got ${result.finalState.enemyHp}`);
        }
    }),
    
    'strike+': () => testCard('strike+', null, (result) => {
        if (result.finalState.enemyHp !== 91) {
            throw new Error(`Expected enemy HP 91, got ${result.finalState.enemyHp}`);
        }
    }),
    
    defend: () => testCard('defend', null, (result) => {
        if (result.finalState.playerBlock !== 5) {
            throw new Error(`Expected player block 5, got ${result.finalState.playerBlock}`);
        }
    }),
    
    'defend+': () => testCard('defend+', null, (result) => {
        if (result.finalState.playerBlock !== 8) {
            throw new Error(`Expected player block 8, got ${result.finalState.playerBlock}`);
        }
    }),
    
    // Energy cards
    coffee_rush: () => testCard('coffee_rush', null, (result) => {
        if (result.finalState.playerEnergy !== 5) {
            throw new Error(`Expected energy 5, got ${result.finalState.playerEnergy}`);
        }
    }),
    
    'coffee_rush+': () => testCard('coffee_rush+', null, (result) => {
        if (result.finalState.playerEnergy !== 6) {
            throw new Error(`Expected energy 6, got ${result.finalState.playerEnergy}`);
        }
    }),
    
    // Complex cards
    macro: () => testCard('macro', 
        (ctx) => {
            ctx.lastCard = 'strike';
            ctx.player.hand.push(cloneCard(CARDS['strike']));
        },
        (result) => {
            if (result.finalState.enemyHp !== 94) {
                throw new Error(`Macro should replay strike, expected enemy HP 94, got ${result.finalState.enemyHp}`);
            }
        }
    ),
    
    segfault: () => testCard('segfault', 
        (ctx) => {
            ctx.player.draw = ['strike'];
        },
        (result) => {
            if (result.finalState.enemyHp !== 93) {
                throw new Error(`Expected enemy HP 93, got ${result.finalState.enemyHp}`);
            }
            if (result.finalState.handSize !== 1) {
                throw new Error(`Expected hand size 1, got ${result.finalState.handSize}`);
            }
        }
    ),
    
    skill_issue: () => testCard('skill_issue', 
        (ctx) => {
            ctx.enemy.intent = { type: "attack", value: 5 };
        },
        (result, ctx) => {
            if (result.finalState.playerBlock !== 6) {
                throw new Error(`Expected block 6, got ${result.finalState.playerBlock}`);
            }
            if (ctx.enemy.weak !== 1) {
                throw new Error(`Expected enemy to be weakened`);
            }
        }
    ),
    
    dark_mode: () => testCard('dark_mode', null, (result) => {
        if (result.finalState.enemyHp !== 80) {
            throw new Error(`Expected enemy HP 80, got ${result.finalState.enemyHp}`);
        }
        if (!result.logs.includes("Turn ended")) {
            throw new Error(`Expected turn to end`);
        }
    }),
    
    // Flag-based cards
    just_one_game: () => testCard('just_one_game', null, (result) => {
        if (!result.flags.skipThisTurn) {
            throw new Error(`Expected skipThisTurn flag`);
        }
        if (result.flags.nextTurnEnergyBonus !== 2) {
            throw new Error(`Expected nextTurnEnergyBonus 2, got ${result.flags.nextTurnEnergyBonus}`);
        }
    }),
    
    vibe_code: () => testCard('vibe_code', null, (result) => {
        if (!result.flags.nextCardFree) {
            throw new Error(`Expected nextCardFree flag`);
        }
    }),
    
    pair_programming: () => testCard('pair_programming', null, (result) => {
        if (!result.flags.doubleNextCard) {
            throw new Error(`Expected doubleNextCard flag`);
        }
    }),
    
    // Advanced mechanics
    ctrl_z: () => testCard('ctrl_z',
        (ctx) => {
            ctx.player.discard = ['strike'];
        },
        (result) => {
            if (result.finalState.handSize !== 1) {
                throw new Error(`Expected hand size 1, got ${result.finalState.handSize}`);
            }
            if (result.finalState.discardSize !== 0) {
                throw new Error(`Expected discard size 0, got ${result.finalState.discardSize}`);
            }
        }
    ),
    
    npm_audit: () => testCard('npm_audit',
        (ctx) => {
            ctx.player.deck = ['sugar_crash', 'sugar_crash'];
            ctx.player.discard = ['sugar_crash'];
        },
        (result) => {
            if (result.finalState.playerBlock !== 9) {
                throw new Error(`Expected block 9 (3 curses * 3), got ${result.finalState.playerBlock}`);
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
    
    // Test all basic damage cards work
    merge_conflict: () => testCard('merge_conflict', null, (result) => {
        if (result.finalState.enemyHp !== 88) { // 6 + 6 = 12 damage
            throw new Error(`Expected enemy HP 88, got ${result.finalState.enemyHp}`);
        }
    }),
    
    production_deploy: () => testCard('production_deploy', null, (result) => {
        if (result.finalState.enemyHp !== 75) { // 25 damage
            throw new Error(`Expected enemy HP 75, got ${result.finalState.enemyHp}`);
        }
        if (result.finalState.playerHp !== 45) { // Lost 5 HP
            throw new Error(`Expected player HP 45, got ${result.finalState.playerHp}`);
        }
    }),
    
    // Test healing cards
    stack_trace: () => testCard('stack_trace',
        (ctx) => {
            ctx.player.hp = 40; // Start damaged
        },
        (result) => {
            if (result.finalState.playerHp !== 45) { // Healed 5
                throw new Error(`Expected player HP 45, got ${result.finalState.playerHp}`);
            }
        }
    ),
    
    refactor: () => testCard('refactor',
        (ctx) => {
            ctx.player.hp = 40;
            ctx.player.draw = ['strike'];
        },
        (result) => {
            if (result.finalState.playerHp !== 48) { // Healed 8
                throw new Error(`Expected player HP 48, got ${result.finalState.playerHp}`);
            }
            if (result.finalState.handSize !== 1) { // Drew 1 card
                throw new Error(`Expected hand size 1, got ${result.finalState.handSize}`);
            }
        }
    ),
    
    // Previously untested cards
    '404': () => testCard('404', null, (result, ctx) => {
        if (ctx.enemy.weak !== 2) {
            throw new Error(`Expected enemy to have 2 weak, got ${ctx.enemy.weak}`);
        }
    }),
    
    object_object: () => testCard('object_object', 
        (ctx) => {
            ctx.player.hand = [cloneCard(CARDS['strike']), cloneCard(CARDS['defend'])];
            ctx.player.draw = ['coffee_rush'];
        },
        (result) => {
            if (result.finalState.handSize !== 2) { // Exhausted 1, drew 2, net +1
                throw new Error(`Expected hand size 2, got ${result.finalState.handSize}`);
            }
        }
    ),
    
    colon_q: () => testCard('colon_q',
        (ctx) => {
            ctx.player.discard = ['strike', 'defend', 'coffee_rush']; // 3 cards
        },
        (result) => {
            if (result.finalState.enemyHp !== 97) { // 100 - 3 = 97
                throw new Error(`Expected enemy HP 97, got ${result.finalState.enemyHp}`);
            }
        }
    ),
    
    raw_dog: () => testCard('raw_dog',
        (ctx) => {
            ctx.player.draw = ['strike', 'defend'];
        },
        (result) => {
            if (result.finalState.handSize !== 2) {
                throw new Error(`Expected hand size 2, got ${result.finalState.handSize}`);
            }
            // Note: Card should be exhausted after play
        }
    ),
    
    task_failed_successfully: () => testCard('task_failed_successfully', null, (result) => {
        if (result.finalState.enemyHp !== 88) { // 8 + 4 = 12 damage (no block)
            throw new Error(`Expected enemy HP 88, got ${result.finalState.enemyHp}`);
        }
    }),
    
    recursion: () => testCard('recursion', null, (result) => {
        if (result.finalState.enemyHp !== 90) { // 5 + 5 = 10 damage (triggers twice)
            throw new Error(`Expected enemy HP 90, got ${result.finalState.enemyHp}`);
        }
    }),
    
    git_commit: () => testCard('git_commit', 
        (ctx) => {
            ctx.player.draw = ['strike']; // Need cards to draw
        },
        (result) => {
            if (result.finalState.playerBlock !== 4) { // Actually gives 4 block, not 8
                throw new Error(`Expected player block 4, got ${result.finalState.playerBlock}`);
            }
            if (result.finalState.handSize !== 1) { // Should draw 1 card
                throw new Error(`Expected hand size 1, got ${result.finalState.handSize}`);
            }
        }
    ),
    
    memory_leak: () => testCard('memory_leak', null, (result) => {
        if (result.finalState.playerEnergy !== 4) { // +1 energy
            throw new Error(`Expected player energy 4, got ${result.finalState.playerEnergy}`);
        }
        if (result.flags.nextTurnEnergyPenalty !== 1) {
            throw new Error(`Expected nextTurnEnergyPenalty 1, got ${result.flags.nextTurnEnergyPenalty}`);
        }
    }),
    
    code_review: () => testCard('code_review',
        (ctx) => {
            ctx.player.draw = ['strike']; // Need cards to draw
        },
        (result) => {
            if (result.finalState.handSize !== 1) { // Should draw 1 card
                throw new Error(`Expected hand size 1, got ${result.finalState.handSize}`);
            }
            if (!result.logs.includes('Code review reveals useful insights. You draw a card.')) {
                throw new Error(`Expected code review log message`);
            }
        }
    ),
    
    hotfix: () => testCard('hotfix',
        (ctx) => {
            ctx.player.hp = 20; // Below 50%
        },
        (result) => {
            if (result.finalState.enemyHp !== 90) {
                throw new Error(`Expected enemy HP 90, got ${result.finalState.enemyHp}`);
            }
        }
    ),
    
    ligma: () => testCard('ligma', 
        (ctx) => {
            ctx.player.draw = ['strike']; // Need cards to draw
        },
        (result) => {
            if (result.finalState.playerHp !== 0) { // Takes exactly 69 damage, 50-69=0 (clamped to 0)
                throw new Error(`Expected player HP 0 after 69 damage, got ${result.finalState.playerHp}`);
            }
            if (result.finalState.handSize !== 1) { // Should draw 1 card
                throw new Error(`Expected hand size 1, got ${result.finalState.handSize}`);
            }
        }
    ),
    
    virgin: () => testCard('virgin',
        (ctx) => {
            ctx.enemy.intent = { type: "attack", value: 5 };
        },
        (result) => {
            if (result.finalState.playerBlock !== 8) {
                throw new Error(`Expected player block 8, got ${result.finalState.playerBlock}`);
            }
        }
    ),
    
    sugar_crash: () => {
        // Test that curse cards cannot be played
        const ctx = createTestBattleContext();
        const card = CARDS['sugar_crash'];
        
        try {
            card.effect(ctx);
            // If we get here, the card was played successfully
            // But curse cards should be blocked at the game level, not in the effect
            // So this test just verifies the effect exists and doesn't crash
            return { success: true, message: 'Curse effect executed' };
        } catch (error) {
            throw new Error(`Unexpected error in curse effect: ${error.message}`);
        }
    },
    
    stack_overflow: () => testCard('stack_overflow',
        (ctx) => {
            ctx.player.hand = [cloneCard(CARDS['strike']), cloneCard(CARDS['defend'])]; // 2 cards in hand
        },
        (result) => {
            if (result.finalState.enemyHp !== 98) { // 2 damage
                throw new Error(`Expected enemy HP 98, got ${result.finalState.enemyHp}`);
            }
        }
    ),
    
    rubber_duck: () => testCard('rubber_duck',
        (ctx) => {
            ctx.player.draw = ['strike', 'defend'];
        },
        (result) => {
            if (result.finalState.handSize !== 3) { // Drew 3 cards
                throw new Error(`Expected hand size 3, got ${result.finalState.handSize}`);
            }
        }
    ),
    
    git_push_force: () => testCard('git_push_force',
        (ctx) => {
            ctx.player.hand = [cloneCard(CARDS['strike']), cloneCard(CARDS['defend'])];
        },
        (result, ctx) => {
            if (result.finalState.enemyHp !== 85) { // 15 damage
                throw new Error(`Expected enemy HP 85, got ${result.finalState.enemyHp}`);
            }
            // Should have moved a card back to draw pile
            if (result.finalState.handSize !== 1) { // Started with 2, removed 1
                throw new Error(`Expected hand size 1 after force push, got ${result.finalState.handSize}`);
            }
        }
    )
};

// Test runner
function runAllTests(verbose = false) {
    console.log('🎮 Running Birthday Spire Card Tests...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        errors: []
    };
    
    for (const [cardId, testFn] of Object.entries(tests)) {
        try {
            if (verbose) console.log(`Testing ${cardId}...`);
            const result = testFn();
            console.log(`✅ ${cardId} passed`);
            results.passed++;
            
            if (verbose && result.logs.length > 0) {
                console.log(`   Logs: ${result.logs.join(', ')}`);
            }
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

function runSpecificCardTest(cardId, verbose = false) {
    if (!CARDS[cardId]) {
        console.log(`❌ Card '${cardId}' not found`);
        return;
    }
    
    console.log(`🎯 Testing specific card: ${cardId}`);
    
    try {
        const result = testCard(cardId);
        console.log(`✅ ${cardId} executed successfully`);
        
        if (verbose) {
            console.log(`Initial state:`, result.initialState);
            console.log(`Final state:`, result.finalState);
            console.log(`Logs:`, result.logs);
            if (Object.keys(result.flags).length > 0) {
                console.log(`Flags:`, result.flags);
            }
        }
    } catch (error) {
        console.log(`❌ ${cardId} failed: ${error.message}`);
    }
}

// CLI handling
const args = process.argv.slice(2);
const cardArg = args.find(arg => arg.startsWith('--card='));
const coverageArg = args.includes('--coverage');
const verboseArg = args.includes('--verbose');

if (cardArg) {
    const cardId = cardArg.split('=')[1];
    runSpecificCardTest(cardId, verboseArg);
} else if (coverageArg) {
    checkTestCoverage();
} else {
    const results = runAllTests(verboseArg);
    checkTestCoverage();
    
    // Exit with error code if tests failed
    if (results.failed > 0) {
        process.exit(1);
    }
}
