export const RELICS = {
    kinesis: {
        id: "kinesis", name: "Kinesis",
        text: "+1 card draw each turn.",
        art: "Monk_29.png",
        hooks: { onTurnStart: (ctx) => ctx.draw(1) }
    },
    vim_motions: {
        id: "vim_motions", name: "Vim Motions",
        text: "+10 Max HP.",
        art: "Monk_30.png",
        hooks: { onRunStart: (ctx) => { ctx.player.maxHp += 10; ctx.player.hp += 10; } }
    },
    vs_code: {
        id: "vs_code", name: "VS Code",
        text: "-10% damage taken.",
        art: "Monk_31.png",
        hooks: { onDamageTaken: (ctx, dmg) => Math.ceil(dmg * 0.9) }
    },
    terminal_coffee_thermos: {
        id: "terminal_coffee_thermos", name: "Terminal Coffee Thermos",
        text: "Start each fight with Coffee Rush.",
        art: "Monk_32.png",
        hooks: { onBattleStart: (ctx) => { ctx.player.energy += 2; ctx.log("Your coffee thermos provides an energizing boost!") } }
    },
    haskell: {
        id: "haskell", name: "Haskell",
        text: "First attack each turn deals double.",
        art: "Monk_33.png",
        state: { used: false },
        hooks: {
            onTurnStart: (ctx, st) => st.used = false,
            onPlayerAttack: (ctx, st, amount) => st.used ? amount : (st.used = true, amount * 2)
        }
    },
    worst_streamer_award: {
        id: "worst_streamer_award", name: "Worst Streamer Award",
        text: "Start fights with 1 Weak on all enemies.",
        art: "Monk_34.png",
        hooks: { 
            onBattleStart: (ctx) => {
                ctx.applyWeak(ctx.enemy, 1);
                ctx.log("Your Worst Streamer Award intimidates the enemy, making them weak!");
            }
        }
    },
};

export const START_RELIC_CHOICES = ["kinesis", "vim_motions", "vs_code", "terminal_coffee_thermos", "haskell", "worst_streamer_award"];
