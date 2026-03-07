import { getRelicArt } from "../../ui/shared/renderShared.js";

export function renderRelicSelection(root) {
  import("../../data/relics.js").then(({ RELICS, START_RELIC_CHOICES }) => {
    import("../../data/messages.js").then(({ getAllMessages }) => {
      const relicChoices = START_RELIC_CHOICES.slice(0, 3);

      root.app.innerHTML = `
            <div class="game-screen relic-select">
              <div class="game-header">
                <button class="messages-button" data-action="show-messages">
                  Inbox
                  <span class="message-count-badge">${getAllMessages().length}</span>
                </button>
                <div class="game-logo relic-title-logo">
                  <svg width="600" height="240" viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
                    <defs>

                      <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ff8c00;stop-opacity:1" />
                      </linearGradient>

                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>

                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                        <feOffset dx="1" dy="1" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    <text x="300" y="80" text-anchor="middle" font-family="'Kreon', serif" font-size="55" font-weight="700" fill="url(#textGradient)" filter="url(#glow)">
                      ThePrimeagen
                    </text>

                    <text x="300" y="170" text-anchor="middle" font-family="'Kreon', serif" font-size="85" font-weight="700" fill="url(#textGradient)" filter="url(#shadow) url(#glow)">
                      Spire
                    </text>
                  </svg>
                </div>
                    <p class="welcome-message">Welcome, Prime, to the Spire so tall,
It rises each year to honor it all.
At the base lie relics, both curious and true,
Each shaping the path that’s waiting for you.

Choose with care, let the journey unfold,
For dangers and laughter alike will take hold.
And before you depart, don’t fail to see,
Your Inbox holds something prepared secretly.</p>
                <h1>Choose a Starting Relic</h1>
                <p>Select one of the following relics to begin your run.</p>
              </div>

              <div class="relic-options">
                ${relicChoices
                  .map((relicId) => {
                    const relic = RELICS[relicId];
                    return `
                    <div class="relic-option" data-relic="${relicId}">
                      <div class="relic-portrait">
                        <div class="relic-icon">${getRelicArt(relicId, RELICS)}</div>
                      </div>
                      <div class="relic-info">
                        <div class="relic-name">${relic.name}</div>
                        <div class="relic-description">${relic.text}</div>
                      </div>
                    </div>
                  `;
                  })
                  .join("")}
              </div>

            </div>
            `;
    });
  });
}
