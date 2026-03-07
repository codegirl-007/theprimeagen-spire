import { renderMapScreen } from "./mapMarkup.js";
import { attachMapTooltipHandlers } from "./mapTooltip.js";

export async function renderMap(root) {
    const { CARDS } = await import("../../data/cards.js");
    const { ENEMIES } = await import("../../data/enemies.js");
    const { RELICS } = await import("../../data/relics.js");
    const { getAllMessages } = await import("../../data/messages.js");
    const { MAPS } = await import("../../data/maps.js");
    const map = root.map;
    const currentId = root.nodeId;
    const currentNode = map.nodes.find((node) => node.id === currentId);
    const nextIds = currentNode ? currentNode.next : [];
    root.app.innerHTML = renderMapScreen(root, {
        CARDS,
        ENEMIES,
        RELICS,
        MAPS,
        messageCount: getAllMessages().length,
        map,
        currentId,
        nextIds
    });

    attachMapTooltipHandlers(root);
}
