import { renderImage } from "../../ui/shared/renderShared.js";

export function renderEvent(root) {
  const events = [
    {
      title: "Birthday Cake",
      text: "You find a delicious birthday cake! But it looks suspicious...",
      artwork: "assets/card-art/bread.png",
      choices: [
        {
          text: "Eat the whole cake (+15 HP, gain Sugar Crash curse)",
          quote:
            "The great thing, if one can, is to stop regarding all the unpleasant things as interruptions of one’s own or real life. The truth is of course that what one calls the interruptions are precisely one’s real life.",
          icon: "assets/card-art/apple.png",
          risk: "high",
          effect: () => {
            const oldHp = root.player.hp;
            root.player.hp += 15;
            if (root.player.hp > root.player.maxHp) {
              root.player.maxHp = root.player.hp;
            }
            root.player.deck.push("sugar_crash");
            root.log(
              `Ate cake: +15 HP (${oldHp} → ${root.player.hp}), added Sugar Crash curse`,
            );
          },
        },
        {
          text: "Take a small bite (+8 HP)",
          quote:
            "Courage is not simply one of the virtues, but the form of every virtue at the testing point.",
          icon: "assets/card-art/heart.png",
          risk: "low",
          effect: () => {
            root.player.maxHp += 8;
            if (root.player.hp > root.player.maxHp) {
              root.player.maxHp = root.player.hp;
            }
            root.log("Small bite: +8 HP");
          },
        },
        {
          text: "Leave it alone (gain 25 gold)",
          quote:
            "You can’t go back and change the beginning, but you can start where you are and change the ending.",
          icon: "assets/card-art/bag_of_gold.png",
          risk: "none",
          effect: () => {
            root.player.gold += 25;
            root.log("Resisted temptation: +25 gold");
          },
        },
      ],
    },
    {
      title: "Birthday Present",
      text: "A mysterious gift box sits before you. What could be inside?",
      artwork: "assets/card-art/chest_closed.png",
      choices: [
        {
          text: "Open it eagerly (Random card or lose 10 HP)",
          quote: "Hardship often leaves an extraordinary destiny.",
          icon: "assets/card-art/key.png",
          risk: "high",
          effect: () => {
            if (Math.random() < 0.7) {
              import("../../../data/cards.js").then(({ CARDS, CARD_POOL }) => {
                const randomCard =
                  CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
                root.player.deck.push(randomCard);
                root.log(`Found ${CARDS[randomCard].name}!`);
              });
            } else {
              root.player.hp = Math.max(1, root.player.hp - 10);
              root.log("It was a trap! -10 HP");
            }
          },
        },
        {
          text: "Open it carefully (+5 Max HP)",
          quote: "We are what we believe we are.",
          icon: "assets/card-art/potion_heal.png",
          risk: "low",
          effect: () => {
            root.player.maxHp += 5;
            root.player.hp += 5;
            root.log("Careful approach: +5 Max HP");
          },
        },
        {
          text: "Don't touch it (gain 30 gold)",
          quote:
            "Experience: that most brutal of teachers. But you learn, my God do you learn.",
          icon: "assets/card-art/bag_of_gold.png",
          risk: "none",
          effect: () => {
            root.player.gold += 30;
            root.log("Played it safe: +30 gold");
          },
        },
      ],
    },
    {
      title: "Birthday Balloons",
      text: "Colorful balloons float by. One has a note attached: 'Pop me for a surprise!'",
      artwork: "assets/card-art/feather.png",
      choices: [
        {
          text: "Pop the balloon (Remove a random basic card from deck)",
          quote:
            "There are far, far better things ahead than any we leave behind.",
          icon: "assets/card-art/scroll.png",
          risk: "medium",
          effect: () => {
            const basicCards = root.player.deck.filter(
              (id) => id === "strike" || id === "defend",
            );
            if (basicCards.length > 0) {
              const toRemove = basicCards[0];
              const index = root.player.deck.indexOf(toRemove);
              root.player.deck.splice(index, 1);
              root.log(`Removed ${toRemove} from deck`);
            } else {
              root.log("No basic cards to remove");
            }
          },
        },
        {
          text: "Collect the balloons (+1 Energy)",
          quote:
            "Isn’t it funny how day by day nothing changes, but when you look back, everything is different?",
          icon: "assets/card-art/magic_sphere.png",
          risk: "low",
          effect: () => {
            root.player.maxEnergy += 1;
            root.log("Collected balloons: +1 Energy");
          },
        },
        {
          text: "Ignore them (heal 12 HP)",
          quote:
            "Hardships often prepare ordinary people for an extraordinary destiny.",
          icon: "assets/card-art/heart.png",
          risk: "none",
          effect: () => {
            root.player.hp = Math.min(root.player.maxHp, root.player.hp + 12);
            root.log("Focused on rest: +12 HP");
          },
        },
      ],
    },
  ];

  const event = events[Math.floor(Math.random() * events.length)];
  root.currentEvent = event;

  root.app.innerHTML = `
    <div class="event-screen">
      <div class="event-header">
        <h1>${event.title}</h1>
        <p>A birthday adventure awaits your decision</p>
        <div class="player-status-inline">
          <div class="status-item">
            ${renderImage("assets/card-art/heart.png", "Health", "status-icon-img")}
            <span>${root.player.hp}/${root.player.maxHp} HP</span>
          </div>
          <div class="status-item">
            ${renderImage("assets/card-art/bag_of_gold.png", "Gold", "status-icon-img")}
            <span>${root.player.gold || 0} Gold</span>
          </div>
        </div>
      </div>

      <div class="event-content">
        <div class="event-story">
          <div class="event-artwork">
            ${renderImage(event.artwork, "Event", "event-artwork-img")}
          </div>
          <div class="event-description">
      <p>${event.text}</p>
    </div>
        </div>

        <div class="event-choices">
          <h3>Choose your action:</h3>
          <div class="choices-grid">
      ${event.choices
        .map(
          (choice, idx) => `
              <div class="event-choice ${choice.risk}-risk" data-choice="${idx}">
                <div class="choice-icon">
                  ${renderImage(choice.icon, "Choice", "choice-icon-img")}
                </div>
                <div class="choice-content">
                  <div class="choice-text">${choice.text}</div>
                  ${choice.quote ? `<div class="choice-quote">"${choice.quote}"</div>` : ""}
                  <div class="choice-risk-badge ${choice.risk}">
                    ${choice.risk === "high" ? "High Risk" : choice.risk === "medium" ? "Medium Risk" : choice.risk === "low" ? "Low Risk" : "Safe"}
                  </div>
                </div>
              </div>
      `,
        )
        .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}
