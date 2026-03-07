/**
 * InputManager - Centralized event handling for Birthday Spire
 * 
 * This class consolidates ALL event listeners from the render functions
 * into one place while maintaining exact same functionality.
 */

import { playSound } from '../systems/audio/playSound.js';
import {
    handleCardPlay,
    handleEndTurn,
    handleBattleCardShortcut,
    setupCardHoverSounds
} from '../features/battle/battleInput.js';
import { handleMapNodeClick } from '../features/map/mapInput.js';
import { handleRewardPick } from '../features/reward/rewardInput.js';
import { handleRestAction, handleCardUpgrade } from '../features/rest/restInput.js';
import { handleEventChoice } from '../features/event/eventInput.js';
import {
    handleShopCardBuy,
    handleShopRelicBuy,
    updateShopAffordability,
    handleLeaveShop
} from '../features/shop/shopInput.js';
import { handleRelicSelection } from '../features/relic-selection/relicSelectionInput.js';
import {
    handleSkip,
    handleReset,
    handleReplay,
    handleMenu,
    handleRestartAct2
} from '../features/endgame/endgameInput.js';

export class InputManager {
    constructor(gameRoot) {
        this.root = gameRoot;
        this.activeHandlers = new Map();
        this.globalHandlers = new Set(); // Track global document listeners

        // Bind methods to preserve 'this' context
        this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
        this.handleMessagesModalEvent = this.handleMessagesModalEvent.bind(this);
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

        document.addEventListener('show-messages-modal', this.handleMessagesModalEvent);
        this.globalHandlers.add('show-messages-modal');
    }

    /**
     * Global keyboard event handler
     */
    handleGlobalKeydown(event) {
        // Handle Escape key for modals
        if (event.key === 'Escape') {
            this.handleEscapeKey(event);
        }

        const currentStateName = this.root.stateMachine?.getCurrentStateName?.();
        if (currentStateName === 'BATTLE') {
            if (event.key.toLowerCase() === 'e') {
                event.preventDefault();
                this.handleEndTurn(null, event);
                return;
            }

            const cardNumber = parseInt(event.key, 10);
            if (cardNumber >= 1 && cardNumber <= this.root.player.hand.length) {
                event.preventDefault();
                this.handleBattleCardShortcut(cardNumber - 1);
                return;
            }
        }

        // Handle number keys for code review selection
        if (this.root._codeReviewCards && event.key >= '1' && event.key <= '3') {
            const selectedIndex = parseInt(event.key, 10) - 1;
            if (selectedIndex < this.root._codeReviewCards.length) {
                event.preventDefault();
                if (this.root._codeReviewCallback) {
                    this.root._codeReviewCallback(selectedIndex);
                    this.root._codeReviewCards = null;
                    this.root._codeReviewCallback = null;
                }
            }
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

        const buyRelicElement = target.closest('[data-buy-relic]');
        if (buyRelicElement) {
            this.handleShopRelicBuy(buyRelicElement, event);
            return;
        }

        const leaveElement = target.closest('[data-leave]');
        if (leaveElement) {
            this.handleLeaveShop(leaveElement, event);
            return;
        }

        const relicElement = target.closest('[data-relic]');
        if (relicElement) {
            this.handleRelicSelection(relicElement, event);
            return;
        }

        const codeReviewElement = target.closest('[data-code-review-pick]');
        if (codeReviewElement) {
            this.handleCodeReviewPick(codeReviewElement, event);
            return;
        }

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
        handleCardPlay(this, element, event);
    }

    /**
     * Handle map node clicks
     */
    handleMapNodeClick(element, event) {
        handleMapNodeClick(this, element, event);
    }

    /**
     * Handle reward card picks
     */
    handleRewardPick(element, event) {
        handleRewardPick(this, element, event);
    }

    /**
     * Handle event choice clicks
     */
    async handleEventChoice(element, event) {
        await handleEventChoice(this, element, event);
    }

    /**
     * Handle card upgrade clicks
     */
    handleCardUpgrade(element, event) {
        handleCardUpgrade(this, element, event);
    }

    /**
     * Handle shop card purchases
     */
    handleShopCardBuy(element, event) {
        handleShopCardBuy(this, element, event);
    }

    /**
     * Handle shop relic purchases
     */
    handleShopRelicBuy(element, event) {
        handleShopRelicBuy(this, element, event);
    }

    /**
     * Update shop item affordability
     */
    updateShopAffordability() {
        updateShopAffordability(this);
    }

    /**
     * Handle leaving the shop
     */
    handleLeaveShop(element, event) {
        handleLeaveShop(this, element, event);
    }

    /**
     * Handle relic selection
     */
    handleRelicSelection(element, event) {
        handleRelicSelection(this, element, event);
    }

    /**
     * Handle code review card selection
     */
    handleCodeReviewPick(element, event) {
        const selectedIndex = parseInt(element.dataset.codeReviewPick, 10);

        if (this.root._codeReviewCallback && this.root._codeReviewCards) {
            try {
                // Execute the callback with selected index
                this.root._codeReviewCallback(selectedIndex);

                this.root._codeReviewCards = null;
                this.root._codeReviewCallback = null;
            } catch (error) {
                console.error('Error handling code review selection:', error);
            }
        }
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
        handleRestAction(this, element, event);
    }

    /**
     * Handle end turn button
     */
    handleEndTurn(element, event) {
        handleEndTurn(this, element, event);
    }

    /**
     * Handle specific buttons that don't use data attributes
     */
    handleSpecificButtons(element, event) {
        // Skip reward button
        if (element.dataset.skip !== undefined) {
            handleSkip(this);
            return;
        }

        // Reset button
        if (element.dataset.reset !== undefined) {
            handleReset(this);
            return;
        }

        // Replay button
        if (element.dataset.replay !== undefined) {
            handleReplay(this);
            return;
        }

        // Menu button
        if (element.dataset.menu !== undefined) {
            handleMenu(this);
            return;
        }

        // Restart Act 2 button
        if (element.dataset.restartAct2 !== undefined) {
            handleRestartAct2(this);
            return;
        }

    }

    /**
     * Handle Escape key presses
     */
    handleEscapeKey(event) {
        // Handle code review modal cancellation
        if (this.root._codeReviewCards) {
            this.root._codeReviewCards = null;
            this.root._codeReviewCallback = null;
            // Return to battle without making a choice
            this.root.render();
            return;
        }

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
                        <h2>Messages</h2>
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

    handleMessagesModalEvent() {
        this.handleShowMessages();
    }

    /**
     * Setup card hover sound effects
     */
    setupCardHoverSounds() {
        setupCardHoverSounds(this);
    }

    handleBattleCardShortcut(cardIndex) {
        handleBattleCardShortcut(this, cardIndex);
    }

    /**
     * Play sound utility
     */
    playSound(soundFile) {
        playSound(soundFile);
    }

    cleanup() {
        // Remove global listeners
        if (this.globalHandlers.has('keydown')) {
            document.removeEventListener('keydown', this.handleGlobalKeydown);
        }
        if (this.globalHandlers.has('click')) {
            document.removeEventListener('click', this.handleGlobalClick);
        }
        if (this.globalHandlers.has('show-messages-modal')) {
            document.removeEventListener('show-messages-modal', this.handleMessagesModalEvent);
        }

        this.globalHandlers.clear();
        this.activeHandlers.clear();
    }
}
