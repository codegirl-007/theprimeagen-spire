
export const MAPS = {
    act1: {
        id: "act1", name: "Birthday Spire — Act I",
        nodes: [
            { id: "n1", kind: "start", next: ["n2", "n3"] },
            { id: "n2", kind: "battle", enemy: "chat_gremlin", next: ["n4"] },
            { id: "n3", kind: "event", next: ["n4"] },
            { id: "n4", kind: "battle", enemy: "infinite_loop", next: ["n5", "n6"] },
            { id: "n5", kind: "rest", next: ["n7"] },
            { id: "n6", kind: "shop", next: ["n7"] },
            { id: "n7", kind: "battle", enemy: "merge_conflict_enemy", next: ["n8"] },
            { id: "n8", kind: "elite", enemy: "elite_ts_demon", next: ["n9"] },
            { id: "n9", kind: "rest", next: ["n10"] },
            { id: "n10", kind: "boss", enemy: "boss_birthday_bug", next: [] },
        ]
    }
};

