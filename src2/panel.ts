import { div, setElemPosition, setElemSize } from "../src/ui/html";
import { V2, add, addAll, diff, diffScalar, mult, vec } from "../src/ui/vec";
import { GRID_GAP, GRID_SIZE, pos, scale } from "./index";

import "./panel.css";

type Panel = {
    gridPos: V2;
    gridSpan: V2;
    el: HTMLElement;
};

let panelDragging: Panel | undefined;
let panelDraggingPosition = vec(0, 0);

export function onMouseMove(delta: V2) {
    const step = GRID_SIZE + GRID_GAP;

    if (panelDragging) {
        panelDraggingPosition = add(panelDraggingPosition, delta);
        const panelPos = addAll(
            mult(panelDragging.gridPos, step * scale),
            pos,
            panelDraggingPosition
        );
        console.log(panelPos);
        setElemPosition(panelDragging.el, panelPos);
    }
}

function onPanelMouseDown(e: Event, panel: Panel) {
    panelDragging = panel;
    e.stopPropagation();
}

document.addEventListener("mouseup", () => {
    panelDragging = undefined;
    panelDraggingPosition = vec(0, 0);
});

const panelAt = (gridPos: V2, gridSpan: V2) => {
    const res: Panel = {
        gridPos,
        gridSpan,
        el: div({ className: "panel", onMouseDown: (e) => onPanelMouseDown(e, res) }),
    };
    return res;
};

export let panels: Panel[] = [
    panelAt(vec(2, 2), vec(2, 2)),
    panelAt(vec(4, 2), vec(2, 4)),
    panelAt(vec(6, 2), vec(2, 6)),
];

export function updatePanels() {
    const step = GRID_SIZE + GRID_GAP;

    for (const panel of panels) {
        const panelPos = add(mult(panel.gridPos, step * scale), pos);
        setElemPosition(panel.el, panelPos);

        const panelSize = diffScalar(mult(panel.gridSpan, step), GRID_GAP);
        setElemSize(panel.el, panelSize);

        panel.el.style.transform = `scale(${scale.toFixed(3)})`;
    }
}
