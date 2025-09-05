/**
 * InputManager - Centralized event handling for Birthday Spire
 * 
 * This class consolidates ALL event listeners from the render functions
 * into one place while maintaining exact same functionality.
 * 
 * Following Nystrom's Input Handling patterns from Game Programming Patterns
 */

import { PlayCardCommand } from '../commands/PlayCardCommand.js';
import { EndTurnCommand } from '../commands/EndTurnCommand.js';
import { MapMoveCommand } from '../commands/MapMoveCommand.js';
import { RewardPickCommand } from '../commands/RewardPickCommand.js';
import { RestActionCommand } from '../commands/RestActionCommand.js';

export class InputManager {
    constructor(gameRoot) {
        this.root = gameRoot;
        this.activeHandlers = new Map(); // Track active event listeners for cleanup
        this.globalHandlers = new Set(); // Track global document listeners
        
        // Bind methods to preserve 'this' context
        this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
    }

    /**
     * Initialize global event listeners (always active)
     */
    initGlobalListeners() {
        // Global keyboard handling
        document.addEventListener('keydown', this.handleGlobalKeydown);
        this.globalHandlers.add('keydown');
        
        // Global click handling for data attributes
        document.addEventListener('click', this.handleGlobalClick);
        this.globalHandlers.add('click');
    }

    /**
     * Global keyboard event handler
     */
    handleGlobalKeydown(event) {
        // Handle Escape key for modals
        if (event.key === 'Escape') {
            this.handleEscapeKey(event);
        }
        
        // Add other global shortcuts here as needed
    }

    /**
     * Global click handler using event delegation
     */
    handleGlobalClick(event) {
        const target = event.target;
        
        // Event delegation for game interactions
        
        // Handle clicks on elements with data attributes (check both direct and parent elements)
        
        // Check for card play (battle-card with data-play)
        const cardElement = target.closest('[data-play]');
        if (cardElement) {
            this.handleCardPlay(cardElement, event);
            return; // Early return to avoid duplicate handling
        }
        
        // Check for other interactive elements (using closest to handle child elements)
        const actionElement = target.closest('[data-action]');
        if (actionElement) {
            this.handleActionButton(actionElement, event);
            return;
        }
        
        const actElement = target.closest('[data-act]');
        if (actElement) {
            this.handleRestAction(actElement, event);
            return;
        }
        
        const pickElement = target.closest('[data-pick]');
        if (pickElement) {
            this.handleRewardPick(pickElement, event);
            return;
        }
        
        const choiceElement = target.closest('[data-choice]');
        if (choiceElement) {
            this.handleEventChoice(choiceElement, event);
            return;
        }
        
        const upgradeElement = target.closest('[data-upgrade]');
        if (upgradeElement) {
            this.handleCardUpgrade(upgradeElement, event);
            return;
        }
        
        const buyCardElement = target.closest('[data-buy-card]');
        if (buyCardElement) {
            this.handleShopCardBuy(buyCardElement, event);
            return;
        }
        
        const relicElement = target.closest('[data-relic]');
        if (relicElement) {
            this.handleRelicSelection(relicElement, event);
            return;
        }
        
        // Check for direct data attributes on target (fallback)
        if (target.dataset.node !== undefined) {
            this.handleMapNodeClick(target, event);
        }
        
        // Handle spire node clicks (check if clicked element is inside a spire-node)
        const spireNode = target.closest('.spire-node');
        if (spireNode && spireNode.dataset.node) {
            this.handleMapNodeClick(spireNode, event);
        }
        
        // Handle other specific buttons
        this.handleSpecificButtons(target, event);
    }

    /**
     * Handle card play clicks
     */
    handleCardPlay(element, event) {
        if (!element.classList.contains('playable')) return;
        
        const index = parseInt(element.dataset.play, 10);
        const card = this.root.player.hand[index];
        
        if (!card) return;
        if (this.root.player.energy < card.cost) return;
        
        try {
            // Play sound
            this.playSound('played-card.mp3');
            
            // Create and execute PlayCardCommand
            const command = new PlayCardCommand(this.root, index);
            const success = this.root.commandInvoker.execute(command);
            
            if (success) {
                // Clear card selection
                this.root.selectedCardIndex = null;
                if (window.gameModules?.render?.updateCardSelection) {
                    window.gameModules.render.updateCardSelection(this.root);
                }
            }
        } catch (error) {
            console.error('Error playing card:', error);
        }
    }

    /**
     * Handle map node clicks
     */
    handleMapNodeClick(element, event) {
        if (!element.dataset.node) return;
        
        try {
            // Create and execute MapMoveCommand
            const command = new MapMoveCommand(this.root, element.dataset.node);
            this.root.commandInvoker.execute(command);
        } catch (error) {
            console.error('Error moving on map:', error);
        }
    }

    /**
     * Handle reward card picks
     */
    handleRewardPick(element, event) {
        const idx = parseInt(element.dataset.pick, 10);
        
        try {
            // Create and execute RewardPickCommand
            const command = new RewardPickCommand(this.root, idx);
            this.root.commandInvoker.execute(command);
        } catch (error) {
            console.error('Error picking reward:', error);
        }
    }

    /**
     * Handle event choice clicks
     */
    handleEventChoice(element, event) {
        const idx = parseInt(element.dataset.choice, 10);
        // Get the current event from the root (this will need to be accessible)
        if (this.root.currentEvent && this.root.currentEvent.choices[idx]) {
            this.root.currentEvent.choices[idx].effect();
            this.root.afterNode();
        }
    }

    /**
     * Handle card upgrade clicks
     */
    handleCardUpgrade(element, event) {
        const deckIndex = parseInt(element.dataset.upgrade, 10);
        const oldCardId = this.root.player.deck[deckIndex];
        
        // Find the upgraded version and replace it
        const { CARDS } = window.gameModules?.cards || {};
        if (CARDS && CARDS[oldCardId]?.upgrades) {
            this.root.player.deck[deckIndex] = CARDS[oldCardId].upgrades;
            this.root.log(`Upgraded ${CARDS[oldCardId].name} to ${CARDS[CARDS[oldCardId].upgrades].name}`);
            this.root.afterNode();
        }
    }

    /**
     * Handle shop card purchases
     */
    handleShopCardBuy(element, event) {
        const idx = parseInt(element.dataset.buyCard, 10);
        // This will need access to the current shop cards
        if (this.root.currentShopCards && this.root.currentShopCards[idx]) {
            const card = this.root.currentShopCards[idx];
            if (this.root.player.gold >= 50) {
                this.root.player.gold -= 50;
                this.root.player.deck.push(card.id);
                this.root.log(`Bought ${card.name} for 50 gold.`);
                element.disabled = true;
                element.textContent = "SOLD";
                
                // Update gold display
                const goldDisplay = this.root.app.querySelector('.gold-amount');
                if (goldDisplay) {
                    goldDisplay.textContent = this.root.player.gold;
                }
            } else {
                this.root.log("Not enough gold!");
            }
        }
    }

    /**
     * Handle relic selection
     */
    handleRelicSelection(element, event) {
        const relicId = element.dataset.relic;
        this.root.selectStartingRelic(relicId);
    }

    /**
     * Handle action buttons (like show-messages, end)
     */
    handleActionButton(element, event) {
        const action = element.dataset.action;
        
        switch (action) {
            case 'show-messages':
                this.handleShowMessages();
                break;
            case 'end':
                this.handleEndTurn(element, event);
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }

    /**
     * Handle rest screen actions
     */
    handleRestAction(element, event) {
        const action = element.dataset.act;
        
        try {
            // Create and execute RestActionCommand
            const command = new RestActionCommand(this.root, action);
            this.root.commandInvoker.execute(command);
        } catch (error) {
            console.error('Error with rest action:', error);
        }
    }

    /**
     * Handle end turn button
     */
    handleEndTurn(element, event) {
        try {
            // Create and execute EndTurnCommand
            const command = new EndTurnCommand(this.root);
            const success = this.root.commandInvoker.execute(command);
            
            if (success) {
                // Clear card selection
                this.root.selectedCardIndex = null;
                if (window.gameModules?.render?.updateCardSelection) {
                    window.gameModules.render.updateCardSelection(this.root);
                }
            }
        } catch (error) {
            console.error('Error ending turn:', error);
        }
    }

    /**
     * Handle specific buttons that don't use data attributes
     */
    handleSpecificButtons(element, event) {
        // Skip reward button
        if (element.dataset.skip !== undefined) {
            if (this.root._pendingChoices) {
                this.root.skipReward();
            } else {
                this.root.afterNode();
            }
            return;
        }

        // Reset button
        if (element.dataset.reset !== undefined) {
            this.root.clearSave();
            this.root.reset();
            return;
        }

        // Replay button
        if (element.dataset.replay !== undefined) {
            this.root.reset();
            return;
        }

        // Menu button
        if (element.dataset.menu !== undefined) {
            this.root.reset();
            return;
        }

        // Restart Act 2 button
        if (element.dataset.restartAct2 !== undefined) {
            if (this.root.loadAct2Checkpoint) {
                this.root.loadAct2Checkpoint().then(() => {
                    if (window.gameModules?.render?.renderMap) {
                        window.gameModules.render.renderMap(this.root);
                    }
                });
            }
            return;
        }

        // Buy relic button
        if (element.dataset.buyRelic !== undefined) {
            if (this.root.currentShopRelic && this.root.player.gold >= 100) {
                this.root.player.gold -= 100;
                this.root.log(`Bought ${this.root.currentShopRelic.name} for 100 gold.`);
                
                // Add relic logic here
                element.disabled = true;
                element.textContent = "SOLD";
            } else {
                this.root.log("Not enough gold!");
            }
            return;
        }

        // Leave shop button
        if (element.dataset.leave !== undefined) {
            this.root.afterNode();
            return;
        }
    }

    /**
     * Handle Escape key presses
     */
    handleEscapeKey(event) {
        // Close any open modals
        const modals = document.querySelectorAll('.messages-modal-overlay');
        modals.forEach(modal => modal.remove());
    }

    /**
     * Handle show messages action
     */
    async handleShowMessages() {
        try {
            const { getAllMessages } = await import("../data/messages.js");
            const messages = getAllMessages();

            const modal = document.createElement('div');
            modal.className = 'messages-modal-overlay';
            modal.innerHTML = `
                <div class="messages-modal">
                    <div class="messages-modal-header">
                        <h2>Messages for Prime</h2>
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

            // Close functionality
            const closeModal = () => modal.remove();
            
            const closeBtn = modal.querySelector('.messages-close-btn');
            closeBtn.addEventListener('click', closeModal);
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error showing messages:', error);
        }
    }

    /**
     * Setup card hover sound effects
     */
    setupCardHoverSounds() {
        // This will be called after battle screen renders
        this.root.app.querySelectorAll("[data-play]").forEach(btn => {
            if (!btn.dataset.hoverSetup) {
                btn.addEventListener("mouseenter", () => {
                    if (btn.classList.contains('playable')) {
                        this.playSound('swipe.mp3');
                    }
                });
                btn.dataset.hoverSetup = 'true';
            }
        });
    }

    /**
     * Play sound utility
     */
    playSound(soundFile) {
        try {
            const audio = new Audio(`assets/sounds/${soundFile}`);
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore audio play failures
        } catch (e) {
            // Ignore audio errors
        }
    }

    /**
     * Clean up all event listeners
     */
    cleanup() {
        // Remove global listeners
        if (this.globalHandlers.has('keydown')) {
            document.removeEventListener('keydown', this.handleGlobalKeydown);
        }
        if (this.globalHandlers.has('click')) {
            document.removeEventListener('click', this.handleGlobalClick);
        }
        
        this.globalHandlers.clear();
        this.activeHandlers.clear();
    }
}

// Simple audio utility function (moved from render.js)
function playSound(soundFile) {
    try {
        const audio = new Audio(`assets/sounds/${soundFile}`);
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore failures in restrictive environments
    } catch (e) {
        // Audio not supported or file missing, ignore
    }
}
