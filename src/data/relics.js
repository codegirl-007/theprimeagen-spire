export const RELICS = {
    mech_kb: {
        id: "mech_kb", name: "Kinesis",
        text: "+1 card draw each turn.",
        art: "Monk_29.png",
        hooks: { onTurnStart: (ctx) => ctx.draw(1) }
    },
    standing_desk: {
        id: "standing_desk", name: "Vim Motions",
        text: "+10 Max HP.",
        art: "Monk_30.png",
        hooks: { onRunStart: (ctx) => { ctx.player.maxHp += 10; ctx.player.hp += 10; } }
    },
    prime_hat: {
        id: "prime_hat", name: "VS Code",
        text: "-10% damage taken.",
        art: "Monk_31.png",
        hooks: { onDamageTaken: (ctx, dmg) => Math.ceil(dmg * 0.9) }
    },
    coffee_thermos: {
        id: "coffee_thermos", name: "Terminal Coffee Thermos",
        text: "Start each fight with Coffee Rush.",
        art: "Monk_32.png",
        hooks: { onBattleStart: (ctx) => { ctx.player.energy += 2; ctx.log("Your coffee thermos provides an energizing boost!") } }
    },
    cpp_compiler: {
        id: "cpp_compiler", name: "Haskell",
        text: "First attack each turn deals double.",
        art: "Monk_33.png",
        state: { used: false },
        hooks: {
            onTurnStart: (ctx, st) => st.used = false,
            onPlayerAttack: (ctx, st, amount) => st.used ? amount : (st.used = true, amount * 2)
        }
    },
    chat_mod_sword: {
        id: "chat_mod_sword", name: "Worst Streamer Award",
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

export const START_RELIC_CHOICES = ["mech_kb", "standing_desk", "prime_hat", "coffee_thermos", "cpp_compiler", "chat_mod_sword"];
