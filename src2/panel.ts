import { div, setElemPosition, setElemSize } from "../src/ui/html";
import {
    V2,
    add,
    addAll,
    addScalar,
    diff,
    diffScalar,
    divide,
    mult,
    roundV2,
    vec,
} from "../src/ui/vec";
import { GRID_GAP, GRID_SIZE, isSpaceDown, mouse, pos, scale } from "./index";

import "./panel.css";

type Panel = {
    gridPos: V2;
    gridSpan: V2;
    el: HTMLElement;
};

export let panelDragging: Panel | undefined;
export let panelResizing: Panel | undefined;

let panelDraggingPosition = vec(0, 0);
export let panelMovingShadowPos = vec(0, 0);
export let mouseDeltaDuringResize = vec(0, 0);
let mousePosDuringResize = vec(0, 0);

export const gridToAbs = (v: V2) => mult(v, (GRID_SIZE + GRID_GAP) * scale);
export const gridToAbs2 = (v: V2) => mult(v, GRID_SIZE + GRID_GAP);
export const absToGrid = (v: V2) =>
    roundV2(divide(v, (GRID_SIZE + GRID_GAP) * scale));
export const absToGrid2 = (v: V2) => roundV2(divide(v, GRID_SIZE + GRID_GAP));

function startMovingPanel(e: Event, panel: Panel) {
    if (!isSpaceDown) {
        panelDragging = panel;
        //to set position of the shadow elem
        movePanel(vec(0, 0));
        e.stopPropagation();
    }
}

export function movePanel(delta: V2) {
    const step = GRID_SIZE + GRID_GAP;

    if (panelDragging) {
        panelDraggingPosition = add(panelDraggingPosition, delta);

        const snappedGridPosition = roundV2(
            absToGrid(
                add(gridToAbs(panelDragging.gridPos), panelDraggingPosition)
            )
        );

        panelMovingShadowPos = { ...snappedGridPosition };

        const panelPos = addAll(
            mult(panelDragging.gridPos, step * scale),
            pos,
            panelDraggingPosition
        );
        setElemPosition(panelDragging.el, panelPos);
    }
}

function endMovingPanel() {
    if (panelDragging) {
        panelDragging.gridPos = { ...panelMovingShadowPos };
        panelDragging = undefined;
        panelMovingShadowPos = vec(0, 0);
        panelDraggingPosition = vec(0, 0);
        updatePanels();
    }

    onPanelEndResize();
}

function onPanelStartResize(e: MouseEvent, panel: Panel) {
    panelResizing = panel;
    const panelBottomRightCorner = addScalar(
        mult(
            add(panelResizing.gridPos, panelResizing.gridSpan),
            GRID_SIZE + GRID_GAP
        ),
        -GRID_GAP
    );

    mouseDeltaDuringResize = diff(panelBottomRightCorner, add(mouse, pos));
    mousePosDuringResize = mouse;

    e.stopPropagation();
}
export function onPanelResizing(delta: V2) {
    if (panelResizing) {
        mousePosDuringResize = add(
            mousePosDuringResize,
            mult(delta, 1 / scale)
        );
        const size = diff(
            addAll(mousePosDuringResize, mouseDeltaDuringResize, pos),
            gridToAbs2(panelResizing.gridPos)
        );

        panelResizing.gridSpan = absToGrid2(size);
        setElemSize(panelResizing.el, size);
    }
}
function onPanelEndResize() {
    if (panelResizing) {
        panelResizing = undefined;
        updatePanels();
    }
}

document.addEventListener("mouseup", endMovingPanel);

const panelAt = (gridPos: V2, gridSpan: V2) => {
    const res: Panel = {
        gridPos,
        gridSpan,
        el: div({
            className: "panel",
            onMouseDown: (e) => startMovingPanel(e, res),
            children: [
                div({
                    className: "panel-dragger",
                    onMouseDown: (e) => onPanelStartResize(e, res),
                }),
            ],
        }),
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
