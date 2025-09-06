/**
 * Centralized event handling system for Birthday Spire
 * Manages all user interactions, keyboard shortcuts, and UI events
 */

export class EventHandler {
    constructor(root) {
        this.root = root;
        this.listeners = new Map(); // Track active listeners for cleanup
        this.keyHandlers = new Map(); // Track keyboard shortcuts
        this.globalHandlers = new Set(); // Track global event handlers
        this.currentScreen = null;

        this.setupGlobalEvents();
    }

    /**
     * Setup global event handlers that persist across screens
     */
    setupGlobalEvents() {
        // Global keyboard handler
        this.globalKeyHandler = (e) => {
            const handler = this.keyHandlers.get(e.key.toLowerCase());
            if (handler) {
                e.preventDefault();
                handler(e);
            }
        };

        document.addEventListener('keydown', this.globalKeyHandler);
        this.globalHandlers.add('keydown');

        // Global escape handler for modals
        this.globalEscapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        };

        document.addEventListener('keydown', this.globalEscapeHandler);
        this.globalHandlers.add('escape');
    }

    /**
     * Switch to a new screen and cleanup old events
     */
    switchScreen(screenName) {
        this.cleanup();
        this.currentScreen = screenName;
        this.keyHandlers.clear();
    }

    /**
     * Add event listener with automatic tracking for cleanup
     */
    on(element, event, handler, options = {}) {
        if (!element) return;

        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error(`Event handler error (${event}):`, error);
            }
        };

        element.addEventListener(event, wrappedHandler, options);

        // Track for cleanup
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        this.listeners.get(element).push({ event, handler: wrappedHandler, options });
    }

    /**
     * Add keyboard shortcut
     */
    addKeyHandler(key, handler, description = '') {
        this.keyHandlers.set(key.toLowerCase(), handler);
    }

    /**
     * Remove keyboard shortcut
     */
    removeKeyHandler(key) {
        this.keyHandlers.delete(key.toLowerCase());
    }

    /**
     * Battle screen event handlers
     */
    setupBattleEvents() {
        this.switchScreen('battle');

        // Card play events
        this.root.app.querySelectorAll("[data-play]").forEach(btn => {
            this.on(btn, "mouseenter", () => {
                if (btn.classList.contains('playable')) {
                    this.playSound('swipe.mp3');
                    this.root.selectedCardIndex = null;
                    this.updateCardSelection();
                }
            });

            this.on(btn, "click", () => {
                const index = parseInt(btn.dataset.play, 10);
                const card = this.root.player.hand[index];
                if (this.root.player.energy >= card.cost) {
                    this.playSound('played-card.mp3');
                    this.root.play(index);
                    this.root.selectedCardIndex = null;
                    this.updateCardSelection();
                }
            });
        });

        // End turn button
        const endTurnBtn = this.root.app.querySelector("[data-action='end']");
        if (endTurnBtn) {
            this.on(endTurnBtn, "click", () => {
                try {
                    this.root.end();
                } catch (error) {
                    console.error("Error ending turn:", error);
                }
            });
        }

        // Keyboard shortcuts for battle
        this.addKeyHandler('e', () => {
            try {
                this.root.end();
            } catch (error) {
                console.error("Error ending turn via keyboard:", error);
            }
        }, 'End Turn');

        // Number keys for card selection and play
        for (let i = 1; i <= 9; i++) {
            this.addKeyHandler(i.toString(), (e) => {
                const cardIndex = i - 1;
                const hand = this.root.player.hand;

                if (cardIndex >= hand.length) return;

                const card = hand[cardIndex];

                if (this.root.selectedCardIndex === cardIndex) {
                    // Second press - play the card
                    if (this.root.player.energy >= card.cost) {
                        this.root.play(cardIndex);
                        this.root.selectedCardIndex = null;
                        this.updateCardSelection();
                    }
                } else {
                    // First press - select the card
                    this.root.selectedCardIndex = cardIndex;
                    this.updateCardSelection();
                    this.playSound('swipe.mp3');
                }
            }, `Select/Play Card ${i}`);
        }
    }

    /**
     * Map screen event handlers
     */
    setupMapEvents() {
        this.switchScreen('map');

        // Node navigation
        this.root.app.querySelectorAll("[data-node]").forEach(el => {
            if (!el.dataset.node) return;

            this.on(el, "click", () => this.root.go(el.dataset.node));
        });

        // Tooltip handling for all nodes (including non-clickable ones)
        this.root.app.querySelectorAll(".spire-node").forEach(el => {
            this.on(el, "mouseenter", (e) => this.showTooltip(e));
            this.on(el, "mouseleave", () => this.hideTooltip());
        });

        // Messages button
        const messagesBtn = this.root.app.querySelector("[data-action='show-messages']");
        if (messagesBtn) {
            this.on(messagesBtn, "click", () => this.showMessagesModal());
        }

        // Reset button
        const resetBtn = this.root.app.querySelector("[data-reset]");
        if (resetBtn) {
            this.on(resetBtn, "click", () => {
                this.root.clearSave();
                this.root.reset();
            });
        }

        // Keyboard shortcut for messages
        this.addKeyHandler('m', () => this.showMessagesModal(), 'Show Messages');
    }

    /**
     * Reward screen event handlers
     */
    setupRewardEvents(choices) {
        this.switchScreen('reward');

        this.root.app.querySelectorAll("[data-pick]").forEach(btn => {
            this.on(btn, "click", () => {
                const idx = parseInt(btn.dataset.pick, 10);
                this.root.takeReward(idx);
            });
        });

        const skipBtn = this.root.app.querySelector("[data-skip]");
        if (skipBtn) {
            this.on(skipBtn, "click", () => this.root.skipReward());
        }

        // Keyboard shortcuts for reward selection
        for (let i = 1; i <= choices.length; i++) {
            this.addKeyHandler(i.toString(), () => {
                this.root.takeReward(i - 1);
            }, `Select Reward ${i}`);
        }

        this.addKeyHandler('s', () => this.root.skipReward(), 'Skip Reward');
    }

    /**
     * Rest screen event handlers
     */
    setupRestEvents() {
        this.switchScreen('rest');

        const healBtn = this.root.app.querySelector("[data-act='heal']");
        const upgradeBtn = this.root.app.querySelector("[data-act='upgrade']");

        if (healBtn) {
            this.on(healBtn, "click", () => {
                const heal = Math.floor(this.root.player.maxHp * 0.2);
                this.root.player.hp = Math.min(this.root.player.maxHp, this.root.player.hp + heal);
                this.root.log(`Rested: +${heal} HP`);
                this.root.afterNode();
            });
        }

        if (upgradeBtn) {
            this.on(upgradeBtn, "click", () => {
                // Import and call renderUpgrade
                import("../ui/render.js").then(({ renderUpgrade }) => {
                    renderUpgrade(this.root);
                });
            });
        }

        // Keyboard shortcuts
        this.addKeyHandler('h', () => healBtn?.click(), 'Heal');
        this.addKeyHandler('u', () => upgradeBtn?.click(), 'Upgrade');
    }

    /**
     * Shop screen event handlers
     */
    setupShopEvents(shopCards = [], shopRelic = null) {
        this.switchScreen('shop');

        // Card purchase events
        this.root.app.querySelectorAll("[data-buy-card]").forEach(btn => {
            this.on(btn, "click", () => {
                const idx = parseInt(btn.dataset.buyCard, 10);
                const card = shopCards[idx];
                if (this.root.player.gold >= 50) {
                    this.root.player.gold -= 50;
                    this.root.player.deck.push(card.id);
                    this.root.log(`Bought ${card.name} for 50 gold.`);
                    btn.disabled = true;
                    btn.textContent = "SOLD";

                    this.updateGoldDisplay();
                    this.updateShopAffordability();
                } else {
                    this.root.log("Not enough gold!");
                }
            });
        });

        // Relic purchase
        if (shopRelic) {
            const relicBtn = this.root.app.querySelector("[data-buy-relic]");
            if (relicBtn) {
                this.on(relicBtn, "click", async () => {
                    if (this.root.player.gold >= 100) {
                        this.root.player.gold -= 100;
                        this.root.log(`Bought ${shopRelic.name} for 100 gold.`);

                        const { attachRelics } = await import("../engine/battle.js");
                        const currentRelicIds = this.root.relicStates.map(r => r.id);
                        const newRelicIds = [...currentRelicIds, shopRelic.id];
                        attachRelics(this.root, newRelicIds);

                        relicBtn.disabled = true;
                        relicBtn.textContent = "SOLD";

                        this.updateGoldDisplay();
                        this.updateShopAffordability();
                    } else {
                        this.root.log("Not enough gold!");
                    }
                });
            }
        }

        // Leave shop
        const leaveBtn = this.root.app.querySelector("[data-leave]");
        if (leaveBtn) {
            this.on(leaveBtn, "click", () => this.root.afterNode());
        }

        // Keyboard shortcuts
        this.addKeyHandler('escape', () => this.root.afterNode(), 'Leave Shop');
        this.addKeyHandler('l', () => this.root.afterNode(), 'Leave Shop');
    }

    /**
     * Event screen event handlers
     */
    setupEventEvents(event) {
        this.switchScreen('event');

        this.root.app.querySelectorAll("[data-choice]").forEach(btn => {
            this.on(btn, "click", () => {
                const idx = parseInt(btn.dataset.choice, 10);
                event.choices[idx].effect();
                this.root.afterNode();
            });
        });

        // Keyboard shortcuts for event choices
        for (let i = 1; i <= event.choices.length; i++) {
            this.addKeyHandler(i.toString(), () => {
                event.choices[i - 1].effect();
                this.root.afterNode();
            }, `Event Choice ${i}`);
        }
    }

    /**
     * Relic selection event handlers
     */
    setupRelicSelectionEvents(relicChoices) {
        this.switchScreen('relic-selection');

        this.root.app.querySelectorAll("[data-relic]").forEach(btn => {
            this.on(btn, "click", () => {
                const relicId = btn.dataset.relic;
                this.root.selectStartingRelic(relicId);
            });
        });

        // Messages button
        const messagesBtn = this.root.app.querySelector("[data-action='show-messages']");
        if (messagesBtn) {
            this.on(messagesBtn, "click", () => this.showMessagesModal());
        }

        // Keyboard shortcuts
        for (let i = 1; i <= relicChoices.length; i++) {
            this.addKeyHandler(i.toString(), () => {
                const relicBtn = this.root.app.querySelector(`[data-relic="${relicChoices[i - 1]}"]`);
                relicBtn?.click();
            }, `Select Relic ${i}`);
        }

        this.addKeyHandler('m', () => this.showMessagesModal(), 'Show Messages');
    }

    /**
     * Win/Lose screen event handlers
     */
    setupEndGameEvents() {
        this.switchScreen('endgame');

        const replayBtn = this.root.app.querySelector("[data-replay]");
        const restartAct2Btn = this.root.app.querySelector("[data-restart-act2]");
        const menuBtn = this.root.app.querySelector("[data-menu]");

        if (replayBtn) {
            this.on(replayBtn, "click", () => this.root.reset());
        }

        if (restartAct2Btn) {
            this.on(restartAct2Btn, "click", async () => {
                if (this.root.loadAct2Checkpoint()) {
                    const { renderMap } = await import("../ui/render.js");
                    await renderMap(this.root);
                } else {
                    this.root.reset();
                }
            });
        }

        if (menuBtn) {
            this.on(menuBtn, "click", () => this.root.reset());
        }

        // Keyboard shortcuts
        this.addKeyHandler('r', () => replayBtn?.click(), 'Replay');
        this.addKeyHandler('2', () => restartAct2Btn?.click(), 'Restart Act 2');
        this.addKeyHandler('m', () => menuBtn?.click(), 'Main Menu');
    }

    /**
     * Utility methods
     */
    updateCardSelection() {
        // Remove selection from all cards
        this.root.app.querySelectorAll('.battle-card').forEach(card => {
            card.classList.remove('card-selected');
        });

        // Add selection to currently selected card
        if (this.root.selectedCardIndex !== null) {
            const selectedCard = this.root.app.querySelector(`[data-play="${this.root.selectedCardIndex}"]`);
            if (selectedCard) {
                selectedCard.classList.add('card-selected');
            }
        }
    }

    updateGoldDisplay() {
        const goldDisplay = this.root.app.querySelector('.gold-amount');
        if (goldDisplay) {
            goldDisplay.textContent = this.root.player.gold;
        }
    }

    updateShopAffordability() {
        // Implementation would go here - update visual affordability indicators
        // This would need to be implemented based on the current shop logic
    }

    playSound(soundFile) {
        try {
            const audio = new Audio(`assets/sounds/${soundFile}`);
            audio.volume = 0.3;
            audio.play().catch(e => console.log(e));
        } catch (e) {
            // Silently fail if audio not available
        }
    }

    showTooltip(event) {
        const tooltip = document.getElementById('custom-tooltip');
        if (!tooltip) return;

        const node = event.target.closest('.spire-node');
        if (!node) return;

        const content = node.dataset.tooltip;
        const avatarPath = node.dataset.avatar;

        let tooltipHTML = '';
        if (avatarPath) {
            tooltipHTML = `
                <div class="tooltip-with-avatar">
                    <div class="tooltip-avatar">
                        <img src="${avatarPath}" alt="Enemy Avatar" class="tooltip-avatar-img" 
                             onerror="this.style.display='none';">
                    </div>
                    <div class="tooltip-content">${content}</div>
                </div>
            `;
        } else {
            tooltipHTML = content;
        }

        tooltip.innerHTML = tooltipHTML;
        tooltip.style.display = 'block';

        // Position tooltip
        const rect = node.getBoundingClientRect();
        tooltip.style.left = (rect.right + 15) + 'px';
        tooltip.style.top = (rect.top + rect.height / 2 - tooltip.offsetHeight / 2) + 'px';

        // Keep tooltip in viewport
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = (rect.left - tooltip.offsetWidth - 15) + 'px';
        }
        if (tooltipRect.top < 0) {
            tooltip.style.top = '10px';
        }
        if (tooltipRect.bottom > window.innerHeight) {
            tooltip.style.top = (window.innerHeight - tooltip.offsetHeight - 10) + 'px';
        }
    }

    hideTooltip() {
        const tooltip = document.getElementById('custom-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    async showMessagesModal() {
        const { getAllMessages } = await import("../data/messages.js");
        const messages = getAllMessages();

        const modal = document.createElement('div');
        modal.className = 'messages-modal-overlay';
        modal.innerHTML = `
            <div class="messages-modal">
                <div class="messages-modal-header">
                    <h2>Inbox</h2>
                    <button class="messages-close-btn" aria-label="Close">×</button>
                </div>
                <div class="messages-modal-content">
                    ${messages.length > 0 ? messages.map((msg, index) => `
                        <div class="message-item">
                            <div class="message-from">From: ${msg.from}</div>
                            <div class="message-text">${msg.message}</div>
                        </div>
                    `).join('') : `
                        <div class="no-messages-placeholder">
                            <p>No messages added yet!</p>
                            <p>Add your birthday messages to <code>src/data/messages.js</code></p>
                        </div>
                    `}
                </div>
            </div>
        `;

        const closeModal = () => {
            modal.remove();
        };

        // Setup modal events
        const closeBtn = modal.querySelector('.messages-close-btn');
        this.on(closeBtn, 'click', closeModal);
        this.on(modal, 'click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.body.appendChild(modal);
    }

    closeTopModal() {
        const modal = document.querySelector('.messages-modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Cleanup all event listeners
     */
    cleanup() {
        // Remove tracked listeners
        for (const [element, handlers] of this.listeners) {
            for (const { event, handler, options } of handlers) {
                element.removeEventListener(event, handler, options);
            }
        }
        this.listeners.clear();

        // Clear keyboard handlers
        this.keyHandlers.clear();
    }

    /**
     * Complete cleanup on destroy
     */
    destroy() {
        this.cleanup();

        // Remove global handlers
        if (this.globalHandlers.has('keydown')) {
            document.removeEventListener('keydown', this.globalKeyHandler);
        }
        if (this.globalHandlers.has('escape')) {
            document.removeEventListener('keydown', this.globalEscapeHandler);
        }

        this.globalHandlers.clear();
    }
}
