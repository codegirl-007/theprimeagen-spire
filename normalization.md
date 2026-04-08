# Runtime State Normalization Plan

This document captures the next major refactor needed to make the game suitable for authoritative multiplayer/co-op.

## Why this refactor matters

The codebase is now structurally cleaner, but important runtime state still contains live JavaScript objects with functions attached.

Current examples:

- `player.hand` stores cloned card objects with `effect`
- `currentRewardChoices` stores full card objects
- `currentShopCards` stores full card objects
- relic runtime behavior depends on function-bearing hook data
- persistence currently needs `restoreCardEffects()` just to make saves work again

That works for local browser play, but it is a poor fit for:

- authoritative room state
- deterministic snapshots
- reconnects
- server validation
- clean save/load migration

The goal of this refactor is to make authoritative runtime state plain data only.

## Current problem areas

### `src/shared/engine/core.js`

- `draw()` clones full card objects and pushes them into `player.hand`
- `cloneCard()` copies the `effect` function into runtime state
- `endTurnDiscard()` converts hand objects back to IDs

### `src/shared/game/rewardFlow.js`

- reward choices are stored as `CARDS[id]` objects

### `src/shared/game/shop.js`

- shop inventory is stored as card/relic objects

### `src/client/app/localPersistence.js`

- `restoreCardEffects()` exists only because hand state is not truly serializable

### `src/shared/engine/battle.js`

- many paths assume hand entries are full card objects
- `pendingCodeReview` is improved, but still only part of the broader normalization story
- relic runtime still stores hook-bearing objects indirectly in active state

## Core target model

There are two levels of improvement:

- a partial normalization
- a correct long-term normalization

The recommended direction is the long-term one.

## Recommended target state shape

Use plain data only.

High-level shape:

```js
{
  version: 2,
  mode: "MAP" | "BATTLE" | "REWARD" | "SHOP" | ...,

  player: {
    hp,
    maxHp,
    block,
    energy,
    maxEnergy,
    weak,
    vuln,
    gold,
    deckCardIds: []
  },

  relicStates: [
    { id: "haskell", state: { used: false } }
  ],

  combat: null | {
    enemy: { id, hp, maxHp, block, weak, vuln, turn, intent: { type, value } },
    flags: {},
    lastPlayedCardInstanceId: null,

    cardInstances: {
      "ci_1": { instanceId: "ci_1", cardId: "strike", usedThisCombat: false },
      "ci_2": { instanceId: "ci_2", cardId: "macro", usedThisCombat: true }
    },

    drawPile: ["ci_1", "ci_2"],
    hand: ["ci_3", "ci_4"],
    discardPile: [],
    exhaustPile: [],

    pendingChoice: null
  },

  reward: null | {
    choices: [
      { offerId: "rw_1", cardId: "segfault" },
      { offerId: "rw_2", cardId: "macro" },
      { offerId: "rw_3", cardId: "refactor" }
    ]
  },

  shop: null | {
    cards: [
      { offerId: "shc_1", cardId: "macro", price: 50, sold: false },
      { offerId: "shc_2", cardId: "ctrl_z", price: 50, sold: false },
      { offerId: "shc_3", cardId: "refactor", price: 50, sold: false }
    ],
    relic: { offerId: "shr_1", relicId: "haskell", price: 100, sold: false } | null
  }
}
```

Key idea:

- permanent deck = card IDs
- combat zones = card instance IDs
- display data = derived from registries like `CARDS` and `RELICS`
- runtime mutable per-card state = stored on instance records, not on cloned card objects

## Why plain card IDs alone are not enough

If `player.hand` were changed from card objects to plain card IDs only, per-instance state would be lost:

- `_used` for once-per-fight cards
- ambiguity with duplicate cards
- reliable `lastCard`
- any future per-card runtime combat state

So the correct model is:

- combat zones store card instance IDs
- card definitions remain static under `CARDS`
- per-instance mutable state lives in combat instance records

## Recommended phased implementation

### Phase 1: Normalize reward and shop state first

This is the safest and most isolated first move.

#### Reward target

Current:

- `currentRewardChoices = [full card objects]`

Change to:

- `currentRewardChoices = [{ offerId, cardId }]`

or at minimum:

- `currentRewardChoiceIds = [cardId, cardId, cardId]`

Files to touch:

- `src/shared/game/rewardFlow.js`
- `src/client/features/reward/RewardState.js`
- `src/client/features/reward/rewardRender.js`

Recommended behavior:

- shared logic generates reward offers as plain IDs
- client render dereferences `CARDS[cardId]`
- pick action uses `offerId` or choice index against plain data

#### Shop target

Current:

- `currentShopCards = [full card objects]`
- `currentShopRelic = full relic object`

Change to:

- `shop.cards = [{ offerId, cardId, price, sold }]`
- `shop.relic = { offerId, relicId, price, sold } | null`

Files to touch:

- `src/shared/game/shop.js`
- `src/client/features/shop/ShopState.js`
- `src/client/features/shop/shopRender.js`
- `src/client/features/shop/shopInput.js`

Recommended behavior:

- generate offers as plain IDs
- render dereferences `CARDS` / `RELICS`
- purchase updates `sold` and grants item by ID

Why Phase 1 first:

- immediate serialization wins
- low risk
- does not require battle internals to change yet

### Phase 2: Normalize relic runtime state

Current issue:

- `relicStates` contain runtime behavior indirectly tied to `RELICS`
- functions do not survive JSON save/load cleanly

Target:

- persist only `{ id, state }`
- never persist hooks
- always resolve hooks from `RELICS[id]` at runtime

Files to touch:

- `src/shared/engine/battle.js`
- `src/shared/data/relics.js`
- `src/client/app/localPersistence.js`

Recommended pattern:

- `attachRelics(root, relicIds)` should create pure `{ id, state }`
- all relic execution should resolve hooks with `RELICS[r.id].hooks`

### Phase 3: Normalize battle card state

Current combat model:

- `player.draw` = card IDs
- `player.hand` = cloned card objects
- `player.discard` = card IDs

Target combat model:

- build combat card instances at battle start
- all combat zones use instance IDs

Example:

- `player.deckCardIds = ["strike", "defend", "macro"]`
- battle creates:
  - `cardInstances = { ci_1: { cardId: "strike" }, ci_2: { cardId: "defend" } }`
- zones then use:
  - `drawPile = ["ci_1", "ci_2"]`
  - `hand = ["ci_3"]`
  - `discardPile = []`

Files to touch:

- `src/shared/engine/core.js`
- `src/shared/engine/battle.js`
- `src/shared/game/createInitialGameState.js`
- `src/client/features/battle/battleRender.js`
- `src/client/input/InputManager.js`
- `src/client/features/battle/battleInput.js`

New helpers to introduce:

- `createCardInstance(cardId)`
- `getCardDef(cardId)`
- `getCardInstance(root, instanceId)`
- `getCardView(root, instanceId)`
- `moveInstanceBetweenZones(...)`

Battle logic changes:

- `draw()` moves instance IDs into hand
- `endTurnDiscard()` moves instance IDs into discard pile
- `playCard()` resolves the definition from instance ID, then executes effect
- `lastCard` becomes `lastPlayedCardInstanceId`

### Phase 4: Refactor card effects that assume live objects

Cards to review carefully:

- `macro`
- `code_review`
- `stack_overflow`
- `ctrl_z`
- `infinite_loop`
- `git_push_force`

Reason:

- they search hand/discard by object or cloned-card shape
- they need to operate on `cardId`, `instanceId`, and zone arrays instead

Recommended rule:

- card definitions stay static in `src/shared/data/cards.js`
- card effects should call battle-context helpers instead of mutating runtime card objects directly

### Phase 5: Remove persistence rehydration hacks

Once hand/reward/shop/relic state are normalized:

- delete `restoreCardEffects()` from `src/client/app/localPersistence.js`

At that point save/load becomes cleaner because runtime state is actually serializable.

Also add:

- `save version`
- migration logic for older saves

Suggested approach:

- add `version: 2` to save data
- on load:
  - detect old save shape
  - convert old hand/reward/shop formats if needed
  - continue normally

### Phase 6: Stabilize command payloads

Current UI actions are still index-heavy:

- play card by hand index
- choose reward by index
- shop buy by index

Eventually authoritative commands should prefer stable IDs:

- `cardInstanceId`
- `offerId`
- `choiceId`

You do not need to switch the UI to full ID payloads immediately, but the normalized state should support it.

## Exact file-by-file impact

### Shared

- `src/shared/engine/core.js`
  - stop cloning cards into hand state
- `src/shared/engine/battle.js`
  - change combat zones to instance IDs
  - resolve card definitions at execution time
  - normalize relic use
- `src/shared/data/cards.js`
  - adapt effects to instance-based helpers
- `src/shared/data/relics.js`
  - remains mostly static, but runtime should stop storing hook-bearing behavior in state
- `src/shared/game/rewardFlow.js`
  - normalize reward offers
- `src/shared/game/shop.js`
  - normalize shop offers
- `src/shared/game/createInitialGameState.js`
  - update root state shape

### Client

- `src/client/features/battle/battleRender.js`
  - hand rendering must derive display cards from instance IDs
- `src/client/features/reward/rewardRender.js`
  - reward render dereferences card ID
- `src/client/features/shop/shopRender.js`
  - shop render dereferences offer IDs
- `src/client/features/shop/shopInput.js`
  - buy by offer data, not full object
- `src/client/input/InputManager.js`
  - gameplay actions should eventually align with normalized IDs
- `src/client/app/localPersistence.js`
  - remove rehydration hacks
  - add save migration

## Recommended implementation order

For the lowest-risk path:

1. normalize reward state
2. normalize shop state
3. normalize relic runtime state
4. add save versioning + migration scaffold
5. introduce combat card instances
6. update battle render/input
7. update tricky card effects
8. remove `restoreCardEffects()`

## Main risks

- combat card instance migration is easy to get subtly wrong
- duplicate cards make `cardId`-only logic ambiguous
- `oncePerFight` behavior must move to instance or combat state cleanly
- save/load migration must be explicit or old saves will break
- reward/shop restore ordering must not regenerate over saved data

## Recommended next step

Do reward + shop normalization first.

Why:

- high payoff
- low risk
- removes more object-heavy state quickly
- builds the pattern you will later use for battle state
