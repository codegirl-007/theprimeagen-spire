export const RELICS = {
    mech_kb: {
        id: "mech_kb", name: "Kinesis",
        text: "+1 card draw each turn.",
        hooks: { onTurnStart: (ctx) => ctx.draw(1) }
    },
    standing_desk: {
        id: "standing_desk", name: "Motions",
        text: "+10 Max HP.",
        hooks: { onRunStart: (ctx) => { ctx.player.maxHp += 10; ctx.player.hp += 10; } }
    },
    prime_hat: {
        id: "prime_hat", name: "VS Code",
        text: "-10% damage taken.",
        hooks: { onDamageTaken: (ctx, dmg) => Math.ceil(dmg * 0.9) }
    },
    coffee_thermos: {
        id: "coffee_thermos", name: "Coffee Thermos",
        text: "Start each fight with Coffee Rush.",
        hooks: { onBattleStart: (ctx) => { ctx.player.energy += 2; ctx.log("Thermos: +2 energy") } }
    },
    cpp_compiler: {
        id: "cpp_compiler", name: "C++ Compiler",
        text: "First attack each turn deals double.",
        state: { used: false },
        hooks: {
            onTurnStart: (ctx, st) => st.used = false,
            onPlayerAttack: (ctx, st, amount) => st.used ? amount : (st.used = true, amount * 2)
        }
    },
    chat_mod_sword: {
        id: "chat_mod_sword", name: "Chat Mod Sword",
        text: "Start fights with 1 Weak on all enemies.",
        hooks: { 
            onBattleStart: (ctx) => {
                ctx.applyWeak(ctx.enemy, 1);
                ctx.log("Chat Mod Sword: Enemy starts Weak!");
            }
        }
    },
};

export const START_RELIC_CHOICES = ["mech_kb", "standing_desk", "prime_hat", "coffee_thermos", "cpp_compiler", "chat_mod_sword"];
