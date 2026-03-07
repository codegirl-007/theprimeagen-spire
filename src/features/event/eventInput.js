export async function handleEventChoice(manager, element) {
    const index = parseInt(element.dataset.choice, 10);

    if (manager.root.currentEvent && manager.root.currentEvent.choices[index]) {
        manager.root.currentEvent.choices[index].effect();
        await manager.root.afterNode();
    }
}
