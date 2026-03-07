export function attachMapTooltipHandlers(root) {
    if (root._mapTooltipBound) {
        return;
    }

    root._mapTooltipBound = true;

    root.app.addEventListener("mouseover", (event) => {
        const node = event.target.closest(".spire-node");
        if (!node || !root.app.contains(node)) {
            return;
        }

        const related = event.relatedTarget;
        if (related && node.contains(related)) {
            return;
        }

        showTooltip(node);
    });

    root.app.addEventListener("mouseout", (event) => {
        const node = event.target.closest(".spire-node");
        if (!node || !root.app.contains(node)) {
            return;
        }

        const related = event.relatedTarget;
        if (related && node.contains(related)) {
            return;
        }

        hideTooltip();
    });
}

function showTooltip(node) {
    const tooltip = document.getElementById("custom-tooltip");
    if (!tooltip) {
        return;
    }

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
}

function hideTooltip() {
    const tooltip = document.getElementById("custom-tooltip");
    if (tooltip) {
        tooltip.style.display = "none";
    }
}
