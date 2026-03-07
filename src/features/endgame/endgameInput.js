export function handleSkip(manager) {
    if (manager.root.currentRewardChoices) {
        manager.root.skipReward();
        return;
    }

    manager.root.afterNode();
}

export function handleReset(manager) {
    manager.root.clearSave();
    manager.root.reset();
}

export function handleReplay(manager) {
    manager.root.reset();
}

export function handleMenu(manager) {
    manager.root.reset();
}

export function handleRestartAct2(manager) {
    if (manager.root.loadAct2Checkpoint) {
        Promise.resolve(manager.root.loadAct2Checkpoint()).then(() => {
            if (manager.root.ui?.renderMap) {
                manager.root.ui.renderMap(manager.root);
            }
        });
    }
}
