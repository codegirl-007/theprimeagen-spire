# Birthday Spire Test Suite

This directory contains comprehensive tests for all card mechanics in Birthday Spire.

## Files

- **`card-tests.js`** - Complete test suite with all card tests
- **`run-tests.js`** - Node.js command-line test runner
- **`test-runner.html`** - Browser-based test runner with UI
- **`README.md`** - This documentation

## Running Tests

### Command Line (Node.js)

```bash
# Run all tests
npm test

# Run tests with verbose output
npm run test:verbose

# Check test coverage
npm run test:coverage

# Test a specific card
npm run test:card strike

# Or directly with node
node tests/run-tests.js
node tests/run-tests.js --verbose
node tests/run-tests.js --coverage
node tests/run-tests.js --card=strike
```

### Browser

1. Start the development server:
   ```bash
   npm run serve
   ```

2. Open `http://localhost:8002/tests/test-runner.html` in your browser

3. Use the interactive test runner:
   - **Run All Tests** - Executes sample test suite
   - **Check Coverage** - Shows test coverage statistics
   - **Test Specific Card** - Test any card by ID
   - **Clear Output** - Clears the test output

## Test Structure

Each test follows this pattern:

```javascript
testCard('cardId', setupFn, assertionFn)
```

- **`cardId`** - The card to test
- **`setupFn(ctx)`** - Optional setup function to modify test context
- **`assertionFn(result, ctx)`** - Function to verify the test results

### Example Test

```javascript
strike: () => testCard('strike', null, (result) => {
    if (result.finalState.enemyHp !== 94) {
        throw new Error(`Expected enemy HP 94, got ${result.finalState.enemyHp}`);
    }
})
```

## Test Context

The test context provides a mock battle environment:

```javascript
{
    player: { hp, maxHp, energy, block, hand, deck, draw, discard, ... },
    enemy: { hp, maxHp, block, weak, vuln, intent, ... },
    flags: { skipThisTurn, nextCardFree, doubleNextCard, ... },
    logs: [], // Captured log messages
    
    // Available functions:
    deal(target, amount),
    draw(n),
    applyWeak(target, amount),
    applyVulnerable(target, amount),
    intentIsAttack(),
    scalarFromWeak(base),
    forceEndTurn(),
    promptExhaust(count),
    moveFromDiscardToHand(cardId),
    countCardType(type),
    replayCard(card)
}
```

## Adding New Tests

To add a test for a new card:

1. Add the test to the `tests` object in `run-tests.js`:

```javascript
my_new_card: () => testCard('my_new_card', 
    (ctx) => {
        // Setup test conditions
        ctx.player.hp = 30;
        ctx.enemy.block = 5;
    },
    (result, ctx) => {
        // Assert expected results
        if (result.finalState.enemyHp !== expectedHp) {
            throw new Error(`Expected enemy HP ${expectedHp}, got ${result.finalState.enemyHp}`);
        }
    }
)
```

## Test Coverage

Current test coverage includes:

- ✅ Basic attack/skill cards (strike, defend, etc.)
- ✅ Energy manipulation cards (coffee_rush, etc.)
- ✅ Complex effect cards (macro, segfault, etc.)
- ✅ Flag-based cards (just_one_game, pair_programming, etc.)
- ✅ Advanced mechanics (ctrl_z, npm_audit, infinite_loop, etc.)
- ✅ Healing cards (stack_trace, refactor, etc.)
- ✅ Multi-hit cards (merge_conflict, etc.)
- ✅ Self-damage cards (production_deploy, etc.)

Run `npm run test:coverage` to see detailed coverage statistics.

## Debugging Tests

For debugging failed tests:

1. Use `--verbose` flag to see detailed logs
2. Test specific cards with `--card=cardId`
3. Check the browser test runner for interactive debugging
4. Examine the test context setup and assertions

## Integration with CI/CD

The test suite returns appropriate exit codes:
- `0` - All tests passed
- `1` - One or more tests failed

This makes it suitable for continuous integration systems.

## Extending Tests

To test more complex scenarios:

- **Multi-card combos**: Set up multiple cards in hand/play sequence
- **Relic interactions**: Add relic states to context
- **Status effect combinations**: Test weak/vulnerable interactions
- **Edge cases**: Test with 0 energy, full hand, empty deck, etc.

The test framework is designed to be flexible and extensible for any card mechanics you add to the game.
