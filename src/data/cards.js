

export const CARDS = {
    strike: {
        id: "strike", name: "Strike", cost: 1, type: "attack", text: "Deal 6.", target: "enemy",
        effect: (ctx) => ctx.deal(ctx.enemy, ctx.scalarFromWeak(6)),
        upgrades: "strike+"
    },
    "strike+": {
        id: "strike+", name: "Strike+", cost: 1, type: "attack", text: "Deal 9.", target: "enemy",
        effect: (ctx) => ctx.deal(ctx.enemy, ctx.scalarFromWeak(9))
    },
    defend: {
        id: "defend", name: "Defend", cost: 1, type: "skill", text: "Gain 5 Block.", target: "self",
        effect: (ctx) => ctx.player.block += 5,
        upgrades: "defend+"
    },
    "defend+": {
        id: "defend+", name: "Defend+", cost: 1, type: "skill", text: "Gain 8 Block.", target: "self",
        effect: (ctx) => ctx.player.block += 8
    },

    coffee_rush: {
        id: "coffee_rush", name: "Terminal Coffee Rush", cost: 0, type: "skill", text: "+2 Energy (this turn).",
        effect: (ctx) => ctx.player.energy += 2,
        upgrades: "coffee_rush+"
    },
    "coffee_rush+": {
        id: "coffee_rush+", name: "Terminal Coffee Rush+", cost: 0, type: "skill", text: "+3 Energy (this turn).",
        effect: (ctx) => ctx.player.energy += 3
    },

    macro: {
        id: "macro", name: "Macrobation", cost: 1, type: "skill", text: "Replay last card for free (once/fight).",
        oncePerFight: true,
        effect: (ctx) => {
            if (ctx.lastCard && ctx.lastCard !== "macro") {
                const card = ctx.player.hand.find(c => c.id === ctx.lastCard);
                if (card) {
                    const savedCost = card.cost;
                    card.cost = 0;
                    card.effect(ctx);
                    card.cost = savedCost;
                    ctx.log(`Macro replays ${card.name} at no cost!`);
                } else {
                    ctx.log("Macro fizzles - no valid card to replay.");
                }
            }
        }
    },

    refactor: {
        id: "refactor", name: "Segfault", cost: 2, type: "attack", text: "Deal 7. Draw 1.",
        effect: (ctx) => { ctx.deal(ctx.enemy, ctx.scalarFromWeak(7)); ctx.draw(1); }
    },

    type_safety: {
        id: "type_safety", name: "Skill Issue", cost: 1, type: "skill", text: "Gain 6 Block. If enemy intends attack → apply Weak(1).",
        effect: (ctx) => { ctx.player.block += 6; if (ctx.intentIsAttack()) ctx.applyWeak(ctx.enemy, 1); }
    },

    chat_ban: {
        id: "chat_ban", name: "404", cost: 1, type: "skill", text: "Apply Weak(2).",
        effect: (ctx) => ctx.applyWeak(ctx.enemy, 2)
    },

    segfault: {
        id: "segfault", name: "Dark Mode", cost: 2, type: "attack", text: "Deal 20. End your turn.",
        effect: (ctx) => { ctx.deal(ctx.enemy, ctx.scalarFromWeak(20)); ctx.forceEndTurn() }
    },

    gc: {
        id: "gc", name: "[object Object]", cost: 1, type: "skill", text: "Exhaust 1 card, draw 2.",
        effect: (ctx) => {
            ctx.promptExhaust(1);
            ctx.draw(2);
        }
    },

    async_await: {
        id: "async_await", name: "Just One Game", cost: 1, type: "power", text: "Skip this turn. Next turn +2 Energy.",
        effect: (ctx) => { ctx.flags.skipThisTurn = true; ctx.flags.nextTurnEnergyBonus = (ctx.flags.nextTurnEnergyBonus || 0) + 2; }
    },

    stack_overflow: {
        id: "stack_overflow", name: "Colon Q", cost: 2, type: "attack", text: "Deal 1 per card in discard.",
        effect: (ctx) => ctx.deal(ctx.enemy, ctx.scalarFromWeak(Math.max(0, ctx.discard.length)))
    },

    infinite_vim: {
        id: "infinite_vim", name: "Vibe Code", cost: 1, type: "skill", text: "Next card costs 0.",
        effect: (ctx) => ctx.flags.nextCardFree = true
    },

    debug_print: {
        id: "debug_print", name: "Raw Dog", cost: 0, type: "skill", text: "Draw 2. Exhaust.",
        exhaust: true,
        effect: (ctx) => ctx.draw(2)
    },

    null_pointer: {
        id: "null_pointer", name: "Task failed successfully", cost: 2, type: "attack", text: "Deal 8. If enemy has no Block, deal 4 more.",
        effect: (ctx) => {
            let dmg = ctx.scalarFromWeak(8);
            if (ctx.enemy.block === 0) dmg += ctx.scalarFromWeak(4);
            ctx.deal(ctx.enemy, dmg);
        }
    },

    recursion: {
        id: "recursion", name: "Recursion", cost: 2, type: "attack", text: "Deal 5. If this kills enemy, play again.",
        effect: (ctx) => {
            const prevHp = ctx.enemy.hp;
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(5));
            if (prevHp > 0 && ctx.enemy.hp <= 0) {
                ctx.log("Recursion activates and strikes again!");

                ctx.enemy.hp = 1;
                ctx.deal(ctx.enemy, ctx.scalarFromWeak(5));
            }
        }
    },

    git_commit: {
        id: "git_commit", name: "Git Commit", cost: 1, type: "skill", text: "Gain 4 Block. Draw 1.",
        effect: (ctx) => { ctx.player.block += 4; ctx.draw(1); }
    },

    memory_leak: {
        id: "memory_leak", name: "Memory Leak", cost: 0, type: "skill", text: "Gain 1 Energy. Next turn -1 Energy.",
        effect: (ctx) => {
            ctx.player.energy += 1;
            ctx.flags.nextTurnEnergyPenalty = (ctx.flags.nextTurnEnergyPenalty || 0) + 1;
        }
    },

    code_review: {
        id: "code_review", name: "Code Review", cost: 1, type: "skill", text: "Look at top 3 cards. Put 1 in hand, rest on bottom of deck.",
        effect: (ctx) => {

            ctx.draw(1);
            ctx.log("Code review reveals useful insights. You draw a card.");
        }
    },

    pair_programming: {
        id: "pair_programming", name: "Pair Programming", cost: 2, type: "skill", text: "Double next card's effect.",
        effect: (ctx) => ctx.flags.doubleNextCard = true
    },

    hotfix: {
        id: "hotfix", name: "Hotfix", cost: 2, type: "attack", text: "Deal 10. Can only be played if HP < 50%.",
        effect: (ctx) => {
            if (ctx.player.hp <= ctx.player.maxHp * 0.5) {
                ctx.deal(ctx.enemy, ctx.scalarFromWeak(10));
            } else {
                ctx.log("Hotfix can only be deployed when HP is below 50%!");
            }
        }
    },

    rubber_duck: {
        id: "rubber_duck", name: "Ligma", cost: 0, type: "skill", text: "Unalive yourself with -69 hit points. Courtesy of Defysall.",
        effect: (ctx) => {
            ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp - 69);
            ctx.draw(1);
        }
    },

    merge_conflict: {
        id: "merge_conflict", name: "Merge Conflict", cost: 2, type: "attack", text: "Deal 6 damage twice.",
        effect: (ctx) => {
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(6));
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(6));
        }
    },

    unit_test: {
        id: "unit_test", name: "Virgin", cost: 1, type: "skill", text: "If enemy intends to attack, gain 8 Block.",
        effect: (ctx) => {
            if (ctx.intentIsAttack()) {
                ctx.player.block += 8;
                ctx.log("Unit tests pass! You feel more confident and gain block.");
            }
        }
    },

    production_deploy: {
        id: "production_deploy", name: "Production Deploy", cost: 3, type: "attack", text: "Deal 25. Lose 5 HP.",
        effect: (ctx) => {
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(25));
            ctx.player.hp = Math.max(1, ctx.player.hp - 5);
            ctx.log("Production deployment succeeds, but at what cost to your health?");
        }
    },


    sugar_crash: {
        id: "sugar_crash", name: "Sugar Crash", cost: 1, type: "curse", text: "Unplayable. -1 Energy when drawn.",
        effect: (ctx) => {
            ctx.player.energy = Math.max(0, ctx.player.energy - 1);
            ctx.log("The sugar crash hits hard, draining your energy!");
        }
    },
};


export const STARTER_DECK = [
    "refactor", "debug_print", "coffee_rush",
    "type_safety", "infinite_vim", "chat_ban",
    "git_commit", "rubber_duck", "null_pointer", "unit_test"
];

export const CARD_POOL = [
    "coffee_rush", "macro", "refactor", "type_safety", "chat_ban",
    "segfault", "gc", "async_await", "stack_overflow", "infinite_vim",
    "debug_print", "null_pointer", "recursion", "git_commit", "memory_leak",
    "code_review", "pair_programming", "hotfix", "rubber_duck", "merge_conflict",
    "unit_test", "production_deploy"
];
