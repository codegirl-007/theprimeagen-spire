
export const MAPS = {
    act1: {
        id: "act1", name: "Birthday Spire — Act I",
        nodes: [
            { id: "n1", kind: "start", next: ["n2", "n3"], x: 500, y: 760 },
            { id: "n2", kind: "battle", enemy: "old_man_judo", next: ["n4"], x: 350, y: 695 },
            { id: "n3", kind: "event", next: ["n4"], x: 650, y: 695 },
            { id: "n4", kind: "battle", enemy: "beastco", next: ["n5", "n6"], x: 500, y: 600 },
            { id: "n5", kind: "rest", next: ["n7"], x: 350, y: 525 },
            { id: "n6", kind: "shop", next: ["n7"], x: 650, y: 525 },
            { id: "n7", kind: "battle", enemy: "codegirl", next: ["n8"], x: 500, y: 460 },
            { id: "n8", kind: "battle", enemy: "defyusall", next: ["n9", "n10"], x: 500, y: 395 },
            { id: "n9", kind: "rest", next: ["n11"], x: 350, y: 330 },
            { id: "n10", kind: "shop", next: ["n11"], x: 650, y: 330 },
            { id: "n11", kind: "battle", enemy: "lithium", next: ["n12"], x: 500, y: 280 },
            { id: "n12", kind: "elite", enemy: "nightshadedude", next: ["n13"], x: 500, y: 205 },
            { id: "n13", kind: "rest", next: ["n14"], x: 500, y: 125 },
            { id: "n14", kind: "boss", enemy: "teej", next: [], x: 500, y: 40 },
        ]
    },
    act2: {
        id: "act2", name: "Birthday Spire — Act II: The Corporate Ladder",
        nodes: [
            { id: "a2n1", kind: "start", next: ["a2n2", "a2n3"], x: 500, y: 760 },
            { id: "a2n2", kind: "battle", enemy: "senior_dev", next: ["a2n4", "a2n5"], x: 400, y: 680 },
            { id: "a2n3", kind: "event", next: ["a2n5"], x: 600, y: 680 },
            { id: "a2n4", kind: "shop", next: ["a2n6"], x: 300, y: 600 },
            { id: "a2n5", kind: "battle", enemy: "tech_lead", next: ["a2n6", "a2n7"], x: 500, y: 600 },
            { id: "a2n6", kind: "battle", enemy: "code_reviewer", next: ["a2n8"], x: 400, y: 520 },
            { id: "a2n7", kind: "rest", next: ["a2n8"], x: 600, y: 520 },
            { id: "a2n8", kind: "battle", enemy: "scrum_master", next: ["a2n9", "a2n10"], x: 500, y: 440 },
            { id: "a2n9", kind: "event", next: ["a2n11"], x: 350, y: 360 },
            { id: "a2n10", kind: "shop", next: ["a2n11"], x: 650, y: 360 },
            { id: "a2n11", kind: "elite", enemy: "senior_dev", next: ["a2n12"], x: 500, y: 280 },
            { id: "a2n12", kind: "rest", next: ["a2n13"], x: 500, y: 200 },
            { id: "a2n13", kind: "boss", enemy: "architect", next: [], x: 500, y: 120 },
        ]
    }
};

