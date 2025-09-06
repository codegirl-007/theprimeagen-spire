export const CARDS = {
    strike: {
        id: "strike", name: "Strike", cost: 1, type: "attack", text: "Deal 6.", target: "enemy",
        art: "Monk_1.png",
        effect: (ctx) => ctx.deal(ctx.enemy, ctx.scalarFromWeak(6)),
        upgrades: "strike+"
    },
    "strike+": {
        id: "strike+", name: "Strike+", cost: 1, type: "attack", text: "Deal 9.", target: "enemy",
        art: "Monk_2.png",
        effect: (ctx) => ctx.deal(ctx.enemy, ctx.scalarFromWeak(9))
    },
    defend: {
        id: "defend", name: "Defend", cost: 1, type: "skill", text: "Gain 5 Block.", target: "self",
        art: "Monk_3.png",
        effect: (ctx) => ctx.player.block += 5,
        upgrades: "defend+"
    },
    "defend+": {
        id: "defend+", name: "Defend+", cost: 1, type: "skill", text: "Gain 8 Block.", target: "self",
        art: "Monk_4.png",
        effect: (ctx) => ctx.player.block += 8
    },

    coffee_rush: {
        id: "coffee_rush", name: "Terminal Coffee Rush", cost: 0, type: "skill", text: "+2 Energy (this turn).",
        art: "Monk_5.png",
        effect: (ctx) => ctx.player.energy += 2,
        upgrades: "coffee_rush+"
    },
    "coffee_rush+": {
        id: "coffee_rush+", name: "Terminal Coffee Rush+", cost: 0, type: "skill", text: "+3 Energy (this turn).",
        art: "Monk_6.png",
        effect: (ctx) => ctx.player.energy += 3
    },

    macro: {
        id: "macro", name: "Macrobation", cost: 1, type: "skill", text: "Replay last card for free (once/fight).",
        art: "Monk_7.png",
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

    segfault: {
        id: "segfault", name: "Segfault", cost: 2, type: "attack", text: "Deal 7. Draw 1.",
        art: "Monk_8.png",
        effect: (ctx) => { ctx.deal(ctx.enemy, ctx.scalarFromWeak(7)); ctx.draw(1); }
    },

    skill_issue: {
        id: "skill_issue", name: "Skill Issue", cost: 1, type: "skill", text: "Gain 6 Block. If enemy intends attack → apply Weak(1).",
        art: "Monk_9.png",
        effect: (ctx) => { ctx.player.block += 6; if (ctx.intentIsAttack()) ctx.applyWeak(ctx.enemy, 1); }
    },

    "404": {
        id: "404", name: "404", cost: 1, type: "skill", text: "Apply Weak(2).",
        art: "Monk_10.png",
        effect: (ctx) => ctx.applyWeak(ctx.enemy, 2)
    },

    dark_mode: {
        id: "dark_mode", name: "Dark Mode", cost: 2, type: "attack", text: "Deal 20. End your turn.",
        art: "Monk_11.png",
        effect: (ctx) => { ctx.deal(ctx.enemy, ctx.scalarFromWeak(20)); ctx.forceEndTurn() }
    },

    object_object: {
        id: "object_object", name: "[object Object]", cost: 1, type: "skill", text: "Exhaust 1 card, draw 2.",
        art: "Monk_17.png",
        effect: (ctx) => {
            ctx.promptExhaust(1);
            ctx.draw(2);
        }
    },

    just_one_game: {
        id: "just_one_game", name: "Just One Game", cost: 1, type: "power", text: "Skip this turn. Next turn +2 Energy.",
        art: "Monk_18.png",
        effect: (ctx) => { ctx.flags.skipThisTurn = true; ctx.flags.nextTurnEnergyBonus = (ctx.flags.nextTurnEnergyBonus || 0) + 2; }
    },

    colon_q: {
        id: "colon_q", name: "Colon Q", cost: 2, type: "attack", text: "Deal 1 per card in discard.",
        art: "Monk_19.png",
        effect: (ctx) => ctx.deal(ctx.enemy, ctx.scalarFromWeak(Math.max(0, ctx.discard.length)))
    },

    vibe_code: {
        id: "vibe_code", name: "Vibe Code", cost: 1, type: "skill", text: "Next card costs 0.",
        art: "Monk_20.png",
        effect: (ctx) => ctx.flags.nextCardFree = true
    },

    raw_dog: {
        id: "raw_dog", name: "Raw Dog", cost: 0, type: "skill", text: "Draw 2. Exhaust.",
        art: "Monk_21.png",
        exhaust: true,
        effect: (ctx) => ctx.draw(2)
    },

    task_failed_successfully: {
        id: "task_failed_successfully", name: "Task failed successfully", cost: 2, type: "attack", text: "Deal 8. If enemy has no Block, deal 4 more.",
        art: "Monk_12.png",
        effect: (ctx) => {
            let dmg = ctx.scalarFromWeak(8);
            if (ctx.enemy.block === 0) dmg += ctx.scalarFromWeak(4);
            ctx.deal(ctx.enemy, dmg);
        }
    },

    recursion: {
        id: "recursion", name: "Recursion", cost: 2, type: "attack", text: "Deal 5. If this kills enemy, play again.",
        art: "Monk_13.png",
        effect: (ctx) => {
            const prevHp = ctx.enemy.hp;
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(5));
            if (prevHp > 0 && ctx.enemy.hp <= 0) {
                ctx.log("Recursion activates and strikes again!");
                ctx.enemy.hp = 1;
                ctx.deal(ctx.enemy, ctx.scalarFromWeak(5));
                
                // Check for battle end after second attack
                if (ctx.enemy.hp <= 0) { 
                    ctx.enemy.hp = 0; 
                    ctx.onWin(); 
                    return; 
                }
            }
        }
    },

    git_commit: {
        id: "git_commit", name: "Git Commit", cost: 1, type: "skill", text: "Gain 4 Block. Draw 1.",
        art: "Monk_22.png",
        effect: (ctx) => { ctx.player.block += 4; ctx.draw(1); }
    },

    memory_leak: {
        id: "memory_leak", name: "Memory Leak", cost: 0, type: "skill", text: "Gain 1 Energy. Next turn -1 Energy.",
        art: "Monk_23.png",
        effect: (ctx) => {
            ctx.player.energy += 1;
            ctx.flags.nextTurnEnergyPenalty = (ctx.flags.nextTurnEnergyPenalty || 0) + 1;
        }
    },

    code_review: {
        id: "code_review", name: "Code Review", cost: 1, type: "skill", text: "Look at top 3 cards. Put 1 in hand, rest on bottom of deck.",
        art: "Monk_24.png",
        effect: (ctx) => {
            const topCards = ctx.peekTop(3);
            if (topCards.length === 0) {
                ctx.log("No cards left in deck to review.");
                return;
            }
            
            // Store selection state for modal
            ctx.root._codeReviewCards = topCards;
            ctx.root._codeReviewCallback = (selectedIndex) => {
                // Get the selected card
                const selectedCard = topCards[selectedIndex];
                
                // Remove the peeked cards from draw pile (they were only peeked)
                topCards.forEach((card, i) => {
                    const drawIndex = ctx.root.player.draw.findIndex(id => id === card.id);
                    if (drawIndex >= 0) {
                        ctx.root.player.draw.splice(drawIndex, 1);
                    }
                });
                
                // Add selected card to hand
                ctx.addToHand(selectedCard);
                
                // Put remaining cards on bottom of deck
                topCards.forEach((card, i) => {
                    if (i !== selectedIndex) {
                        ctx.putOnBottom(card.id);
                    }
                });
                
                ctx.log(`Code review complete. Added ${selectedCard.name} to hand.`);
                ctx.render();
            };
            
            // Show selection modal
            if (window.gameModules?.render?.renderCodeReviewSelection) {
                window.gameModules.render.renderCodeReviewSelection(ctx.root, topCards);
            }
        }
    },

    pair_programming: {
        id: "pair_programming", name: "Pair Programming", cost: 2, type: "skill", text: "Double next card's effect.",
        art: "Monk_25.png",
        effect: (ctx) => ctx.flags.doubleNextCard = true
    },

    hotfix: {
        id: "hotfix", name: "Hotfix", cost: 2, type: "attack", text: "Deal 10. Can only be played if HP < 50%.",
        art: "Monk_15.png",
        effect: (ctx) => {
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(10));
        }
    },

    ligma: {
        id: "ligma", name: "Ligma", cost: 0, type: "skill", text: "Unalive yourself with -69 hit points. Courtesy of Defysall.",
        art: "Monk_26.png",
        effect: (ctx) => {
            ctx.player.hp = Math.max(0, ctx.player.hp - 69);
            ctx.draw(1);
            ctx.log("Ligma balls! You take 69 damage!");
        }
    },

    merge_conflict: {
        id: "merge_conflict", name: "Merge Conflict", cost: 2, type: "attack", text: "Deal 6 damage twice.",
        art: "Monk_14.png",
        effect: (ctx) => {
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(6));
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(6));
        }
    },

    virgin: {
        id: "virgin", name: "Virgin", cost: 1, type: "skill", text: "If enemy intends to attack, gain 8 Block.",
        art: "Monk_27.png",
        effect: (ctx) => {
            if (ctx.intentIsAttack()) {
                ctx.player.block += 8;
                ctx.log("Unit tests pass! You feel more confident and gain block.");
            }
        }
    },

    production_deploy: {
        id: "production_deploy", name: "Production Deploy", cost: 2, type: "attack", text: "Deal 25. Lose 5 HP.",
        art: "Monk_16.png",
        effect: (ctx) => {
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(25));
            ctx.player.hp = Math.max(1, ctx.player.hp - 5);
            ctx.log("Production deployment succeeds, but at what cost to your health?");
        }
    },


    sugar_crash: {
        id: "sugar_crash", name: "Sugar Crash", cost: 1, type: "curse", text: "Unplayable. -1 Energy when drawn.",
        art: "Monk_28.png",
        effect: (ctx) => {
            ctx.player.energy = Math.max(0, ctx.player.energy - 1);
            ctx.log("The sugar crash hits hard, draining your energy!");
        }
    },

    stack_overflow: {
        id: "stack_overflow", name: "Stack Overflow", cost: 1, type: "attack", text: "Deal damage equal to cards in hand.",
        art: "Monk_29.png",
        effect: (ctx) => ctx.deal(ctx.enemy, ctx.scalarFromWeak(ctx.player.hand.length))
    },

    ctrl_z: {
        id: "ctrl_z", name: "Ctrl+Z", cost: 1, type: "skill", text: "Return a random card from discard to hand.",
        art: "Monk_30.png",
        effect: (ctx) => {
            if (ctx.player.discard.length > 0) {
                const randomId = ctx.player.discard[Math.floor(Math.random() * ctx.player.discard.length)];
                if (ctx.moveFromDiscardToHand(randomId)) {
                    ctx.log(`Ctrl+Z brings back ${CARDS[randomId].name}!`);
                } else {
                    ctx.log("Ctrl+Z failed to undo anything.");
                }
            } else {
                ctx.log("Nothing to undo!");
            }
        }
    },

    rubber_duck: {
        id: "rubber_duck", name: "Rubber Duck Debug", cost: 0, type: "skill", text: "Draw 1. Reveal enemy intent.",
        art: "Monk_31.png",
        effect: (ctx) => {
            ctx.draw(1);
            const intent = ctx.enemy.intent;
            ctx.log(`Rubber duck reveals: Enemy will ${intent.type} for ${intent.value || 'unknown'} next turn.`);
        }
    },

    infinite_loop: {
        id: "infinite_loop", name: "Infinite Loop", cost: 2, type: "skill", text: "Play the same card twice this turn. Exhaust.",
        art: "Monk_32.png",
        exhaust: true,
        effect: (ctx) => {
            if (ctx.lastCard && ctx.lastCard !== "infinite_loop") {
                const card = ctx.player.hand.find(c => c.id === ctx.lastCard);
                if (card) {
                    ctx.replayCard(card);
                } else {
                    ctx.log("Infinite loop has nothing to repeat!");
                }
            } else {
                ctx.log("Infinite loop needs a previous card to repeat!");
            }
        }
    },

    npm_audit: {
        id: "npm_audit", name: "npm audit", cost: 1, type: "skill", text: "Gain 3 Block per curse in deck.",
        art: "Monk_33.png",
        effect: (ctx) => {
            const curseCount = ctx.countCardType("curse");
            const blockGain = curseCount * 3;
            ctx.player.block += blockGain;
            ctx.log(`npm audit found ${curseCount} vulnerabilities. Gain ${blockGain} Block.`);
        }
    },

    git_push_force: {
        id: "git_push_force", name: "git push --force", cost: 0, type: "attack", text: "Deal 15. Put random card from hand on top of draw pile.",
        art: "Monk_34.png",
        effect: (ctx) => {
            ctx.deal(ctx.enemy, ctx.scalarFromWeak(15));
            if (ctx.player.hand.length > 0) { // Check if there are any cards left in hand
                const randomCard = ctx.player.hand[Math.floor(Math.random() * ctx.player.hand.length)];
                const handIdx = ctx.player.hand.findIndex(c => c === randomCard);
                const [card] = ctx.player.hand.splice(handIdx, 1);
                ctx.player.draw.push(card.id);
                ctx.log(`${card.name} was force-pushed back to your deck!`);
            }
        }
    },

    stack_trace: {
        id: "stack_trace", name: "Stack Trace", cost: 1, type: "skill", text: "Heal 5 HP.",
        art: "Monk_35.png",
        effect: (ctx) => {
            const healAmount = 5;
            ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + healAmount);
            ctx.log(`Stack trace reveals the bug! Heal ${healAmount} HP.`);
        }
    },

    refactor: {
        id: "refactor", name: "Refactor", cost: 2, type: "skill", text: "Heal 8 HP. Draw 1 card.",
        art: "Monk_36.png",
        effect: (ctx) => {
            const healAmount = 8;
            ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + healAmount);
            ctx.draw(1);
            ctx.log(`Clean code heals the soul! Heal ${healAmount} HP and draw 1.`);
        }
    }
};


export const STARTER_DECK = [
    "strike", "strike", "defend", "defend",
    "segfault", "coffee_rush", "skill_issue", "git_commit",
    "stack_trace", "stack_trace"
];

export const CARD_POOL = [
    "coffee_rush", "macro", "segfault", "skill_issue", "404",
    "dark_mode", "object_object", "just_one_game", "colon_q", "vibe_code",
    "raw_dog", "task_failed_successfully", "recursion", "git_commit", "memory_leak",
    "code_review", "pair_programming", "hotfix", "ligma", "merge_conflict",
    "virgin", "production_deploy", "stack_overflow", "ctrl_z", "rubber_duck",
    "infinite_loop", "npm_audit", "git_push_force", "stack_trace", "refactor"
];
