import { renderImage } from "../../ui/shared/renderShared.js";

export function renderEvent(root) {
  const event = root.currentEvent;
  if (!event) {
    root.app.innerHTML = `
      <div class="event-screen">
        <div class="event-header">
          <h1>Event Missing</h1>
          <p>No event is available right now.</p>
        </div>
      </div>
    `;
    return;
  }

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
