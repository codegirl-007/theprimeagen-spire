export function handleRelicSelection(manager, element) {
    const relicId = element.dataset.relic;
    manager.root.selectStartingRelic(relicId);
}
