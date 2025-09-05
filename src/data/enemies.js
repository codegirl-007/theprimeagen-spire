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
    lowkeyabu: {
        id: "lowkeyabu", name: "LowKeyAbu", maxHp: 85,
        avatar: "assets/avatars/7.png", // Powerful demon/witch
        background: "assets/backgrounds/castle.png", // Repeat background
        ai: (turn) => turn % 3 === 1 ? { type: "debuff", value: 1 } : { type: "attack", value: 10 },
        onDebuff: (ctx) => ctx.applyVulnerable(ctx.player, 1)
    },
    nightshadedude: {
        id: "nightshadedude", name: "Nightshadedude", maxHp: 120,
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
    teej: {
        id: "teej", name: "Teej", maxHp: 65,
        avatar: "assets/avatars/teej.jpg",
        background: "assets/backgrounds/castle.png",
        ai: (turn) => turn % 3 === 0 ? { type: "debuff", value: 2 } : { type: "attack", value: turn % 2 === 0 ? 12 : 14 },
        onDebuff: (ctx) => ctx.applyWeak(ctx.player, 2)
    },
    begin: {
        id: "begin", name: "Begin", maxHp: 80,
        avatar: "assets/avatars/begin.jpg",
        background: "assets/backgrounds/dead forest.png",
        ai: (turn) => (turn % 2 === 0) ? { type: "attack", value: 16 } : { type: "block", value: 12 }
    },
    adam: {
        id: "adam", name: "Adam Elmore", maxHp: 70,
        avatar: "assets/avatars/adam.jpg",
        background: "assets/backgrounds/terrace.png",
        ai: (turn) => turn % 4 === 0 ? { type: "debuff", value: 1 } : { type: "attack", value: 13 },
        onDebuff: (ctx) => { 
            ctx.applyVulnerable(ctx.player, 1); 
            const debuffLines = [
                "Adam: 'Okay, so here's the thing - your architecture is gonna cost you a fortune.'",
                "Adam: 'Let me show you why serverless is the way to go here...'",
                "Adam: 'This is exactly why you need to think about cold starts.'",
                "Adam: 'I'm gonna walk you through why this approach won't scale.'"
            ];
            ctx.log(debuffLines[Math.floor(Math.random() * debuffLines.length)]); 
        }
    },
    david: {
        id: "david", name: "David", maxHp: 90,
        avatar: "assets/avatars/david.jpg",
        background: "assets/backgrounds/castle.png",
        ai: (turn) => {
            const cyc = turn % 3;
            if (cyc === 0) return { type: "attack", value: 11 };
            if (cyc === 1) return { type: "attack", value: 11 };
            return { type: "debuff", value: 1 };
        },
        onDebuff: (ctx) => { ctx.flags.nextTurnEnergyPenalty = (ctx.flags.nextTurnEnergyPenalty || 0) + 1; ctx.log("David schedules another meeting! Lose 1 energy next turn."); }
    },
    dax: {
        id: "dax", name: "Dax", maxHp: 150,
        avatar: "assets/avatars/dax.jpg",
        background: "assets/backgrounds/throne room.png",
        ai: (turn) => {
            const cyc = turn % 5;
            if (cyc === 1) return { type: "debuff", value: 2 };
            if (cyc === 2) return { type: "attack", value: 25 };
            if (cyc === 3) return { type: "block", value: 15 };
            if (cyc === 4) return { type: "attack", value: 30 };
            return { type: "attack", value: 20 };
        },
        onDebuff: (ctx) => { 
            ctx.applyWeak(ctx.player, 2); 
            ctx.applyVulnerable(ctx.player, 1); 
            const debuffLines = [
                "Dax: 'This is actually insane. Like, why would you even do this?'",
                "Dax: 'Bro, this code is literally unhinged. I'm rewriting everything.'",
                "Dax: 'I'm not even joking, this is the worst thing I've ever seen.'",
                "Dax: 'This is so cursed. I can't even look at this anymore.'"
            ];
            ctx.log(debuffLines[Math.floor(Math.random() * debuffLines.length)]); 
        },
        onBlock: (ctx) => { 
            ctx.enemy.hp = Math.min(ctx.enemy.maxHp, ctx.enemy.hp + 12); 
            const healLines = [
                "Dax: 'Actually, let me just rebuild this from scratch in 5 minutes.'",
                "Dax: 'Hold on, I'm gonna ship a fix real quick.' *heals 12 HP*",
                "Dax: 'This is actually trivial to fix. Watch this.' *optimizes everything*",
                "Dax: 'I literally just rewrote your entire stack while you weren't looking.'"
            ];
            ctx.log(healLines[Math.floor(Math.random() * healLines.length)]); 
        }
    },
    taylor: {
        id: "taylor", name: "Taylor Otwell", maxHp: 200,
        avatar: "assets/avatars/taylor.jpg", 
        background: "assets/backgrounds/throne room.png",
        ai: (turn) => {
            const cyc = turn % 6;
            if (cyc === 0) return { type: "attack", value: 22 }; // Eloquent attack
            if (cyc === 1) return { type: "debuff", value: 2 }; // Artisan command
            if (cyc === 2) return { type: "attack", value: 28 }; // Forge deployment
            if (cyc === 3) return { type: "block", value: 25 }; // Laravel shield
            if (cyc === 4) return { type: "debuff", value: 3 }; // Composer update
            return { type: "attack", value: 35 }; // Nova dashboard strike
        },
        onDebuff: (ctx) => {
            if (ctx.enemy.hp < ctx.enemy.maxHp / 2) {
                ctx.applyWeak(ctx.player, 3);
                ctx.applyVulnerable(ctx.player, 2);
                ctx.log("Taylor unleashes a devastating Laravel package!");
            } else {
                ctx.applyWeak(ctx.player, 2);
                ctx.applyVulnerable(ctx.player, 2);
                ctx.log("Taylor rewrites your code with elegant Laravel solutions!");
            }
        },
        onBlock: (ctx) => {
            const heal = 20;
            ctx.enemy.hp = Math.min(ctx.enemy.maxHp, ctx.enemy.hp + heal);
            ctx.log("Taylor optimizes with Laravel Octane, healing " + heal + " HP!");
        }
    },
    dhh: {
        id: "dhh", name: "DHH", maxHp: 300,
        avatar: "assets/avatars/dhh.jpg", 
        background: "assets/backgrounds/throne room.png",
        ai: (turn) => {
            const cyc = turn % 6;
            if (cyc === 0) return { type: "attack", value: 15 }; // Baseline attack
            if (cyc === 1) return { type: "debuff", value: 2 }; // Debuff turn
            if (cyc === 2) return { type: "attack", value: 20 }; // Heavy hitting attack
            if (cyc === 3) return { type: "block", value: 20 }; // Defense + heal
            if (cyc === 4) return { type: "debuff", value: 1 }; // Follow-up debuff
            return { type: "attack", value: 30 }; // Another strong attack
        },
        onDebuff: (ctx) => {
            if (ctx.enemy.hp < ctx.enemy.maxHp / 2) {
                ctx.applyWeak(ctx.player, 3);
                ctx.applyVulnerable(ctx.player, 2);
                ctx.log("DHH unleashes a Twitter rant about your code quality!");
            } else {
                ctx.applyWeak(ctx.player, 2);
                ctx.applyVulnerable(ctx.player, 2);
                ctx.log("DHH criticizes your architecture decisions!");
            }
        },
        onBlock: (ctx) => {
            const heal = ctx.enemy.hp < ctx.enemy.maxHp / 3 ? 20 : 15;
            ctx.enemy.hp = Math.min(ctx.enemy.maxHp, ctx.enemy.hp + heal);
            ctx.log(`DHH refactors the codebase with Ruby on Rails, healing ${heal} HP!`);
        }
    }

};
