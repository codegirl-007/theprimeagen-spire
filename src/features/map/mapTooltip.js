export function attachMapTooltipHandlers() {
    window.showTooltip = function showTooltip(event) {
        const tooltip = document.getElementById("custom-tooltip");
        const node = event.target.closest(".spire-node");
        const content = node.dataset.tooltip;
        const avatarPath = node.dataset.avatar;

        let tooltipHTML = "";
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
        tooltip.style.display = "block";

        const rect = node.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 15}px`;
        tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;

        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = `${rect.left - tooltip.offsetWidth - 15}px`;
        }
        if (tooltipRect.top < 0) {
            tooltip.style.top = "10px";
        }
        if (tooltipRect.bottom > window.innerHeight) {
            tooltip.style.top = `${window.innerHeight - tooltip.offsetHeight - 10}px`;
        }
    };

    window.hideTooltip = function hideTooltip() {
        const tooltip = document.getElementById("custom-tooltip");
        tooltip.style.display = "none";
    };
}
