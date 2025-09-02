
export const ENEMIES = {
    old_man_judo: {
        id: "old_man_judo", name: "Old Man Judo", maxHp: 40,
        avatar: "assets/avatars/13.png", // Young person with cap
        background: "assets/backgrounds/terrace.png",
        ai: (turn) => turn % 3 === 0 ? { type: "block", value: 6 } : { type: "attack", value: turn % 2 === 0 ? 7 : 8 }
    },
    beastco: {
        id: "beastco", name: "Beastco", maxHp: 35,
        avatar: "assets/avatars/2.png", // Dizzy/confused character
        background: "assets/backgrounds/throne room.png",
        ai: (turn) => ({ type: "attack", value: 4 }),
    },
    codegirl: {
        id: "codegirl", name: "Codegirl", maxHp: 50,
        avatar: "assets/avatars/codegirl.png", // Warrior with conflicted expression
        background: "assets/backgrounds/terrace.png", // Repeat background
        ai: (turn) => turn % 4 === 0 ? { type: "heal", value: 8 } : { type: "attack", value: 8 },
        onHeal: (ctx) => {
            ctx.enemy.hp = Math.min(ctx.enemy.maxHp, ctx.enemy.hp + 8);
            ctx.log("Codegirl resolves the merge conflict and heals 8 HP!");
        }
    },
    nightshadedude: {
        id: "nightshadedude", name: "Nightshadedude", maxHp: 85,
        avatar: "assets/avatars/11.png", // Powerful demon/witch
        background: "assets/backgrounds/dead forest.png", // Repeat background
        ai: (turn) => turn % 3 === 1 ? { type: "debuff", value: 1 } : { type: "attack", value: 14 },
        onDebuff: (ctx) => ctx.applyVulnerable(ctx.player, 1)
    },
    defyusall: {
        id: "defyusall", name: "Defyusall", maxHp: 65,
        avatar: "assets/avatars/15.png", // Elusive character
        background: "assets/backgrounds/castle.png",
        ai: (turn) => turn % 3 === 0 ? { type: "block", value: 8 } : { type: "attack", value: 10 },
    },
    lithium: {
        id: "lithium", name: "Lithium", maxHp: 55,
        avatar: "assets/avatars/19.png", // Scholar/mage with glasses
        background: "assets/backgrounds/dead forest.png",
        ai: (turn) => (turn % 2 === 0) ? { type: "debuff", value: 1 } : { type: "attack", value: 12 },
        onDebuff: (ctx) => ctx.applyWeak(ctx.player, 1)
    },
    teej: {
        id: "teej", name: "Teej", maxHp: 120,
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
    },

    // ACT 2 ENEMIES - Harder versions
    senior_dev: {
        id: "senior_dev", name: "Senior Dev", maxHp: 65,
        avatar: "assets/avatars/elite_ts_demon.png",
        background: "assets/backgrounds/castle.png",
        ai: (turn) => turn % 3 === 0 ? { type: "debuff", value: 2 } : { type: "attack", value: turn % 2 === 0 ? 12 : 14 },
        onDebuff: (ctx) => ctx.applyWeak(ctx.player, 2)
    },
    tech_lead: {
        id: "tech_lead", name: "Tech Lead", maxHp: 80,
        avatar: "assets/avatars/infinite_loop.png",
        background: "assets/backgrounds/dead forest.png",
        ai: (turn) => (turn % 2 === 0) ? { type: "attack", value: 16 } : { type: "block", value: 12 }
    },
    code_reviewer: {
        id: "code_reviewer", name: "Code Reviewer", maxHp: 70,
        avatar: "assets/avatars/chat_gremlin.png",
        background: "assets/backgrounds/terrace.png",
        ai: (turn) => turn % 4 === 0 ? { type: "debuff", value: 1 } : { type: "attack", value: 13 },
        onDebuff: (ctx) => { ctx.applyVulnerable(ctx.player, 1); ctx.log("Code Reviewer finds bugs in your logic!"); }
    },
    scrum_master: {
        id: "scrum_master", name: "Scrum Master", maxHp: 90,
        avatar: "assets/avatars/js_blob.png",
        background: "assets/backgrounds/castle.png",
        ai: (turn) => {
            const cyc = turn % 3;
            if (cyc === 0) return { type: "attack", value: 11 };
            if (cyc === 1) return { type: "attack", value: 11 };
            return { type: "debuff", value: 1 };
        },
        onDebuff: (ctx) => { ctx.flags.nextTurnEnergyPenalty = (ctx.flags.nextTurnEnergyPenalty || 0) + 1; ctx.log("Scrum Master schedules another meeting! Lose 1 energy next turn."); }
    },
    architect: {
        id: "architect", name: "The Architect", maxHp: 150,
        avatar: "assets/avatars/bug_404.png",
        background: "assets/backgrounds/throne room.png",
        ai: (turn) => {
            const cyc = turn % 5;
            if (cyc === 1) return { type: "debuff", value: 2 };
            if (cyc === 2) return { type: "attack", value: 25 };
            if (cyc === 3) return { type: "block", value: 15 };
            if (cyc === 4) return { type: "attack", value: 30 };
            return { type: "attack", value: 20 };
        },
        onDebuff: (ctx) => { ctx.applyWeak(ctx.player, 2); ctx.applyVulnerable(ctx.player, 1); ctx.log("The Architect redesigns your entire approach!"); },
        onBlock: (ctx) => { ctx.enemy.hp = Math.min(ctx.enemy.maxHp, ctx.enemy.hp + 12); ctx.log("The Architect refactors and optimizes, healing 12 HP!"); }
    }
};
