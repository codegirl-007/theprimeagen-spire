
export const ENEMIES = {
    chat_gremlin: {
        id: "chat_gremlin", name: "Old Man Judo", maxHp: 40,
        avatar: "assets/avatars/13.png", // Young person with cap
        background: "assets/backgrounds/terrace.png",
        ai: (turn) => turn % 3 === 0 ? { type: "block", value: 6 } : { type: "attack", value: turn % 2 === 0 ? 7 : 8 }
    },
    type_checker: {
        id: "type_checker", name: "Type Checker", maxHp: 45,
        avatar: "assets/avatars/type_checker.png", // Scholar/mage with glasses
        background: "assets/backgrounds/castle.png",
        ai: (turn) => (turn % 3 === 0) ? { type: "debuff", value: 1 } : { type: "attack", value: 8 },
        onDebuff: (ctx) => ctx.applyWeak(ctx.player, 1)
    },
    js_blob: {
        id: "js_blob", name: "JS Blob", maxHp: 60,
        avatar: "assets/avatars/js_blob.png", // Mysterious hooded figure
        background: "assets/backgrounds/dead forest.png",
        ai: (turn) => (turn % 2 === 0) ? { type: "attack", value: 12 } : { type: "block", value: 6 },
        onBlock: (ctx, val) => ctx.enemy.block += val
    },
    infinite_loop: {
        id: "infinite_loop", name: "Beastco", maxHp: 35,
        avatar: "assets/avatars/2.png", // Dizzy/confused character
        background: "assets/backgrounds/throne room.png",
        ai: (turn) => ({ type: "attack", value: 4 }),
    },
    merge_conflict_enemy: {
        id: "merge_conflict_enemy", name: "Codegirl", maxHp: 50,
        avatar: "assets/avatars/merge_conflict_enemy.png", // Warrior with conflicted expression
        background: "assets/backgrounds/terrace.png", // Repeat background
        ai: (turn) => turn <= 4 ? { type: "attack", value: 8 } : { type: "debuff", value: 1 },
        onDebuff: (ctx) => {

            ctx.enemy.hp = Math.min(ctx.enemy.maxHp, ctx.enemy.hp + 8);
            ctx.log("Codegirl resolves the merge conflict and heals 8 HP!");
        }
    },
    bug_404: {
        id: "bug_404", name: "404 Bug", maxHp: 45,
        avatar: "assets/avatars/bug_404.png", // Elusive character
        background: "assets/backgrounds/castle.png", // Repeat background
        ai: (turn) => ({ type: "attack", value: 10 }),

    },
    elite_ts_demon: {
        id: "elite_ts_demon", name: "Nightshadedude", maxHp: 85,
        avatar: "assets/avatars/11.png", // Powerful demon/witch
        background: "assets/backgrounds/dead forest.png", // Repeat background
        ai: (turn) => turn % 3 === 1 ? { type: "debuff", value: 1 } : { type: "attack", value: 14 },
        onDebuff: (ctx) => ctx.applyVulnerable(ctx.player, 1)
    },
    elite_refactor: {
        id: "elite_refactor", name: "Refactor Dragon (Elite)", maxHp: 90,
        avatar: "assets/avatars/elite_refactor.png", // Regal/noble character
        background: "assets/backgrounds/throne room.png", // Repeat background
        ai: (turn) => ({ type: "attack", value: 10 + Math.floor(turn * 1.5) })
    },
    boss_birthday_bug: {
        id: "boss_birthday_bug", name: "Teej", maxHp: 120,
        avatar: "assets/avatars/boss_birthday_bug.png", // Demanding/angry character
        background: "assets/backgrounds/throne room.png", // Repeat background - fitting for boss
        ai: (turn) => {
            const cyc = turn % 4;
            if (cyc === 1) return { type: "debuff", value: 1 };      // Weak player
            if (cyc === 2) return { type: "attack", value: 18 };     // Big hit
            if (cyc === 3) return { type: "block", value: 0 };       // Crash → heal
            return { type: "attack", value: 22 };                  // Burst
        },
        onBlock: (ctx) => { ctx.enemy.hp = Math.min(ctx.enemy.maxHp, ctx.enemy.hp + 8); ctx.log("Teej crashes and reboots, healing 8 HP!"); }
    }
};
