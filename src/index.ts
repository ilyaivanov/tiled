import { ctx } from "./ui/canvas";
import { start } from "./ui/framework";
import { div, img } from "./ui/html";
import { Point, add, diff, mult, vec } from "./ui/vec";

import { anjunadeep, deepHouse, globalUndergroundItems, xeniaPlaylist } from "./data";

import "./grid.css";

let shift = vec(0, 0);
const scale = 1;
let mouse = { x: 0, y: 0 };
const cellSize = 100;
const gap = 10;

let isSpaceDown = false;
let mousePosMoving = { x: 0, y: 0 };
let mouseDeltaDuringResize = { x: 0, y: 0 };
const targetedGrid = { x: 0, y: 0 };
let panelMoving: Panel | undefined = undefined;
let panelResizing: Panel | undefined = undefined;

window.addEventListener("keydown", (e) => {
    if (e.code == "Space") {
        if (!document.body.style.cursor) document.body.style.cursor = "grab";
        isSpaceDown = true;
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => {
    if (e.code == "Space") {
        isSpaceDown = false;
        document.body.style.removeProperty("cursor");
    }
});

window.addEventListener("mousedown", (e) => {
    if (isSpaceDown && e.buttons & 1) {
        document.body.style.cursor = "grabbing";
    }
});

window.addEventListener("mouseup", (e) => {
    if (isSpaceDown) {
        document.body.style.cursor = "grab";
    }

    stopMoving();
    stopResizing();
});

window.addEventListener("mousemove", (e) => {
    const newMousePos = { x: e.clientX, y: e.clientY };

    const isPrimaryButtonDown = e.buttons & 1;
    if (isSpaceDown && isPrimaryButtonDown) {
        const shiftDelta = mult(diff(newMousePos, mouse), 1 / scale);
        shift = add(shift, shiftDelta);

        updatePosition();
    }

    mouse = newMousePos;

    onMoving();
    onResizing();
});

function startMoving(panel: Panel) {
    panelMoving = panel;
    targetedGrid.x = panel.gridX;
    targetedGrid.y = panel.gridY;

    panel.el.classList.add("panel-grabbing");
    mousePosMoving = { ...mouse };
}

function onMoving() {
    if (panelMoving) updatePanel(panelMoving, diff(mouse, mousePosMoving));
}

function stopMoving() {
    if (panelMoving) {
        panelMoving.gridX = targetedGrid.x;
        panelMoving.gridY = targetedGrid.y;
        panelMoving.el.classList.remove("panel-grabbing");
        updatePanel(panelMoving);

        panelMoving = undefined;
    }
}

function startResizing(panel: Panel) {
    panelResizing = panel;
    const panelWidth = (panelResizing.gridX + panelResizing.gridSpanRow) * (cellSize + gap) - gap;
    const panelHeight = (panelResizing.gridY + panelResizing.gridSpanCol) * (cellSize + gap) - gap;

    mouseDeltaDuringResize = {
        x: panelWidth - mouse.x + shift.x,
        y: panelHeight - mouse.y + shift.y,
    };

    panel.el.classList.add("panel-resizing");
    onResizing();
}

function onResizing() {
    if (panelResizing) {
        const width =
            mouse.x + mouseDeltaDuringResize.x - shift.x - panelResizing.gridX * (cellSize + gap);
        const height =
            mouse.y + mouseDeltaDuringResize.y - shift.y - panelResizing.gridY * (cellSize + gap);

        panelResizing.gridSpanRow = Math.round(width / (cellSize + gap));
        panelResizing.gridSpanCol = Math.round(height / (cellSize + gap));
        panelResizing.el.style.width = width + "px";
        panelResizing.el.style.height = height + "px";
    }
}

function stopResizing() {
    if (panelResizing) {
        panelResizing.el.classList.remove("panel-resizing");
        updatePanel(panelResizing);

        panelResizing = undefined;
    }
}

function draw() {
    ctx.fillStyle = "#F5F5FA";
    ctx.fillRect(0, 0, 20000, 20000);

    ctx.fillStyle = "#FCFCFC";

    for (let i = -20; i < 20; i++) {
        for (let j = -20; j < 20; j++) {
            ctx.fillRect(
                shift.x + i * (cellSize + gap),
                shift.y + j * (cellSize + gap),
                cellSize,
                cellSize
            );
        }
    }

    if (panelMoving) {
        ctx.fillStyle = "#E0E0E0";

        const p = panelMoving ? panelMoving : panelResizing!;
        const nearestGridX = Math.round(
            (p.gridX * (cellSize + gap) + mouse.x - mousePosMoving.x) / (cellSize + gap)
        );

        const nearestGridY = Math.round(
            (p.gridY * (cellSize + gap) + mouse.y - mousePosMoving.y) / (cellSize + gap)
        );

        targetedGrid.x = nearestGridX;
        targetedGrid.y = nearestGridY;
        ctx.fillRect(
            shift.x + nearestGridX * (cellSize + gap),
            shift.y + nearestGridY * (cellSize + gap),
            p.gridSpanRow * (cellSize + gap) - gap,
            p.gridSpanCol * (cellSize + gap) - gap
        );
    }

    if (panelResizing) {
        ctx.fillStyle = "#E0E0E0";

        const p = panelResizing;
        ctx.fillRect(
            shift.x + p.gridX * (cellSize + gap),
            shift.y + p.gridY * (cellSize + gap),
            p.gridSpanRow * (cellSize + gap) - gap,
            p.gridSpanCol * (cellSize + gap) - gap
        );
    }
}

start({ draw });

function ytPlaylist(panel: Panel) {
    const panelEl = div({
        className: "panel",
        children: [
            div({
                className: "playlist-title",
                children: [panel.title],
                onMouseDown: () => startMoving(panel),
            }),
            div({
                className: "panel-body",
                children: [
                    ...panel.data.map((i) =>
                        div({
                            className: "playlist-item",
                            children: [
                                img({
                                    className: "playlist-item-image",
                                    src: `https://i.ytimg.com/vi/${i.videoId}/mqdefault.jpg`,
                                }),
                                i.title,
                            ],
                        })
                    ),
                ],
            }),
            div({ className: "panel-dragger", onMouseDown: () => startResizing(panel) }),
        ],
    });
    return panelEl;
}
type Panel = {
    title: string;
    gridX: number;
    gridY: number;
    gridSpanRow: number;
    gridSpanCol: number;
    data: typeof xeniaPlaylist;
    el: HTMLElement;
};

function panelAt(
    gridX: number,
    gridY: number,
    gridSpanRow: number,
    gridSpanCol: number,
    title: string,
    data: typeof xeniaPlaylist
) {
    const panel: Panel = {
        gridX,
        gridY,
        gridSpanRow,
        gridSpanCol,
        title,
        data,
        el: undefined!,
    };
    panel.el = ytPlaylist(panel);
    return panel;
}

const panels = [
    panelAt(1, 1, 4, 4, "Anjunadeep Edition", anjunadeep),
    panelAt(1, 5, 4, 4, "Xenia UA", xeniaPlaylist),
    panelAt(5, 5, 3, 4, "Xenia UA", xeniaPlaylist),
    panelAt(8, 5, 2, 4, "Xenia UA", xeniaPlaylist),
    panelAt(5, 1, 4, 3, "Deep House", deepHouse),
    panelAt(9, 1, 4, 3, "Global Underground", globalUndergroundItems),
];

function updatePanel(panel: Panel, s?: Point) {
    const { gridX, gridY, gridSpanRow, gridSpanCol, el } = panel;
    Object.assign(el.style, {
        left: (s?.x || 0) + shift.x + gridX * (cellSize + gap) + "px",
        top: (s?.y || 0) + shift.y + gridY * (cellSize + gap) + "px",
        width: gridSpanRow * (cellSize + gap) - gap + "px",
        height: gridSpanCol * (cellSize + gap) - gap + "px",
    });
}

function updatePosition() {
    for (const panel of panels) updatePanel(panel);
}
updatePosition();

for (const { el } of panels) document.body.appendChild(el);
