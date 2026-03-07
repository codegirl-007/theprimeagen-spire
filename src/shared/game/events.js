import { CARDS, CARD_POOL } from "../../data/cards.js";

const EVENT_DEFINITIONS = [
  {
    id: "birthday_cake",
    title: "Birthday Cake",
    text: "You find a delicious birthday cake! But it looks suspicious...",
    artwork: "assets/card-art/bread.png",
    choices: [
      {
        id: "eat_whole_cake",
        text: "Eat the whole cake (+15 HP, gain Sugar Crash curse)",
        quote:
          "The great thing, if one can, is to stop regarding all the unpleasant things as interruptions of one's own or real life. The truth is of course that what one calls the interruptions are precisely one's real life.",
        icon: "assets/card-art/apple.png",
        risk: "high",
        apply(root) {
          const oldHp = root.player.hp;
          root.player.hp += 15;
          if (root.player.hp > root.player.maxHp) {
            root.player.maxHp = root.player.hp;
          }
          root.player.deck.push("sugar_crash");
          root.log(
            `Ate cake: +15 HP (${oldHp} -> ${root.player.hp}), added Sugar Crash curse`,
          );
        },
      },
      {
        id: "small_bite",
        text: "Take a small bite (+8 HP)",
        quote:
          "Courage is not simply one of the virtues, but the form of every virtue at the testing point.",
        icon: "assets/card-art/heart.png",
        risk: "low",
        apply(root) {
          root.player.maxHp += 8;
          if (root.player.hp > root.player.maxHp) {
            root.player.maxHp = root.player.hp;
          }
          root.log("Small bite: +8 HP");
        },
      },
      {
        id: "leave_cake",
        text: "Leave it alone (gain 25 gold)",
        quote:
          "You can't go back and change the beginning, but you can start where you are and change the ending.",
        icon: "assets/card-art/bag_of_gold.png",
        risk: "none",
        apply(root) {
          root.player.gold += 25;
          root.log("Resisted temptation: +25 gold");
        },
      },
    ],
  },
  {
    id: "birthday_present",
    title: "Birthday Present",
    text: "A mysterious gift box sits before you. What could be inside?",
    artwork: "assets/card-art/chest_closed.png",
    choices: [
      {
        id: "open_eagerly",
        text: "Open it eagerly (Random card or lose 10 HP)",
        quote: "Hardship often leaves an extraordinary destiny.",
        icon: "assets/card-art/key.png",
        risk: "high",
        apply(root) {
          if (Math.random() < 0.7) {
            const randomCard = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
            root.player.deck.push(randomCard);
            root.log(`Found ${CARDS[randomCard].name}!`);
            return;
          }

          root.player.hp = Math.max(1, root.player.hp - 10);
          root.log("It was a trap! -10 HP");
        },
      },
      {
        id: "open_carefully",
        text: "Open it carefully (+5 Max HP)",
        quote: "We are what we believe we are.",
        icon: "assets/card-art/potion_heal.png",
        risk: "low",
        apply(root) {
          root.player.maxHp += 5;
          root.player.hp += 5;
          root.log("Careful approach: +5 Max HP");
        },
      },
      {
        id: "ignore_present",
        text: "Don't touch it (gain 30 gold)",
        quote:
          "Experience: that most brutal of teachers. But you learn, my God do you learn.",
        icon: "assets/card-art/bag_of_gold.png",
        risk: "none",
        apply(root) {
          root.player.gold += 30;
          root.log("Played it safe: +30 gold");
        },
      },
    ],
  },
  {
    id: "birthday_balloons",
    title: "Birthday Balloons",
    text: "Colorful balloons float by. One has a note attached: 'Pop me for a surprise!'",
    artwork: "assets/card-art/feather.png",
    choices: [
      {
        id: "pop_balloon",
        text: "Pop the balloon (Remove a random basic card from deck)",
        quote:
          "There are far, far better things ahead than any we leave behind.",
        icon: "assets/card-art/scroll.png",
        risk: "medium",
        apply(root) {
          const basicCards = root.player.deck.filter(
            (id) => id === "strike" || id === "defend",
          );
          if (basicCards.length > 0) {
            const toRemove = basicCards[0];
            const index = root.player.deck.indexOf(toRemove);
            root.player.deck.splice(index, 1);
            root.log(`Removed ${toRemove} from deck`);
            return;
          }

          root.log("No basic cards to remove");
        },
      },
      {
        id: "collect_balloons",
        text: "Collect the balloons (+1 Energy)",
        quote:
          "Isn't it funny how day by day nothing changes, but when you look back, everything is different?",
        icon: "assets/card-art/magic_sphere.png",
        risk: "low",
        apply(root) {
          root.player.maxEnergy += 1;
          root.log("Collected balloons: +1 Energy");
        },
      },
      {
        id: "ignore_balloons",
        text: "Ignore them (heal 12 HP)",
        quote:
          "Hardships often prepare ordinary people for an extraordinary destiny.",
        icon: "assets/card-art/heart.png",
        risk: "none",
        apply(root) {
          root.player.hp = Math.min(root.player.maxHp, root.player.hp + 12);
          root.log("Focused on rest: +12 HP");
        },
      },
    ],
  },
];

function toEventSnapshot(eventDefinition) {
  return {
    id: eventDefinition.id,
    title: eventDefinition.title,
    text: eventDefinition.text,
    artwork: eventDefinition.artwork,
    choices: eventDefinition.choices.map((choice) => ({
      id: choice.id,
      text: choice.text,
      quote: choice.quote,
      icon: choice.icon,
      risk: choice.risk,
    })),
  };
}

function getEventDefinition(eventId) {
  return EVENT_DEFINITIONS.find((event) => event.id === eventId) || null;
}

export function ensureCurrentEvent(root) {
  if (root.currentEvent) {
    return;
  }

  const eventDefinition =
    EVENT_DEFINITIONS[Math.floor(Math.random() * EVENT_DEFINITIONS.length)];
  root.currentEvent = toEventSnapshot(eventDefinition);
}

export function applyEventChoice(root, choiceIndex) {
  const currentEvent = root.currentEvent;
  if (!currentEvent) {
    return false;
  }

  const eventDefinition = getEventDefinition(currentEvent.id);
  const choice = eventDefinition?.choices?.[choiceIndex];
  if (!choice) {
    return false;
  }

  choice.apply(root);
  return true;
}
