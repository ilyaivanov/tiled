import { V2, add, diff, mult, vec } from "../src/ui/vec";
import {
    movePanel,
    onPanelResizing,
    panelDragging,
    panelMovingShadowPos,
    panelResizing,
    panels,
    updatePanels,
} from "./panel";

import "./index.css";
import { drawMinimap, minimapCanvas } from "./minimap";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let baseScale = window.devicePixelRatio || 1;

export let mouse = vec(0, 0);
export let scale = 1;
export let pos = vec(-200, -200);

export const GRID_SIZE = 100;
export const GRID_GAP = 10;

function onResize() {
    baseScale = window.devicePixelRatio || 1;
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;

    canvas.style.width = `${screenWidth}px`;
    canvas.style.height = `${screenHeight}px`;
    canvas.width = Math.floor(screenWidth * baseScale);
    canvas.height = Math.floor(screenHeight * baseScale);
}

onResize();

window.addEventListener("resize", onResize);

document.body.appendChild(canvas);
document.body.append(...panels.map((p) => p.el));
document.body.appendChild(minimapCanvas);

updatePanels();

export let isSpaceDown = false;
window.addEventListener("keydown", (e) => {
    if (e.code == "Space") {
        if (!document.body.style.cursor) document.body.style.cursor = "grab";
        isSpaceDown = true;
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => {
    if (e.code == "Space") {
        // if (isSpaceDown) saveOffset(shift, boardName);
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
    if (isSpaceDown) document.body.style.cursor = "grab";
});

document.addEventListener(
    "mousewheel",
    function onmousewheel(e: WheelEvent) {
        if (e.ctrlKey) {
            const scaleFactor = 1.3;
            const newScale = e.deltaY > 0 ? 1 / scaleFactor : scaleFactor;
            scaleBy(vec(e.clientX, e.clientY), newScale);
            e.preventDefault();
        } else {
            pos.y -= e.deltaY;
            updatePanels();
        }
    } as any,
    { passive: false }
);

document.addEventListener("dblclick", (e: MouseEvent) =>
    setScale(vec(e.clientX, e.clientY), 1)
);

window.addEventListener("mousemove", (e) => {
    const newMousePos = { x: e.clientX, y: e.clientY };

    const delta = diff(newMousePos, mouse);
    const isPrimaryButtonDown = e.buttons & 1;
    if (isPrimaryButtonDown && isSpaceDown) {
        pos = add(pos, diff(newMousePos, mouse));

        updatePanels();
    }

    movePanel(delta);

    onPanelResizing(delta);
    mouse = newMousePos;
});

function scaleBy(focal: V2, amount: number) {
    setScale(focal, scale * amount);

    updatePanels();
}

function setScale(focal: V2, newScale: number) {
    pos = diff(focal, mult(diff(focal, pos), newScale / scale));

    scale = newScale;

    updatePanels();
}

//
// Drawing
//
//

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgb(235, 237, 238)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.scale(baseScale, baseScale);
    ctx.translate(pos.x, pos.y);
    ctx.scale(scale, scale);

    const step = GRID_SIZE + GRID_GAP;
    ctx.fillStyle = "rgb(225, 227, 228)";
    for (let x = -20; x < 20; x++) {
        for (let y = -20; y < 20; y++) {
            ctx.fillRect(x * step, y * step, GRID_SIZE, GRID_SIZE);
        }
    }

    if (panelDragging) {
        ctx.fillStyle = "hsl(120 10% 80%)";
        ctx.fillRect(
            panelMovingShadowPos.x * step,
            panelMovingShadowPos.y * step,
            panelDragging.gridSpan.x * step - GRID_GAP,
            panelDragging.gridSpan.y * step - GRID_GAP
        );
    }

    if (panelResizing) {
        ctx.fillStyle = "hsl(120 10% 80%)";
        ctx.fillRect(
            panelResizing.gridPos.x * step,
            panelResizing.gridPos.y * step,
            panelResizing.gridSpan.x * step - GRID_GAP,
            panelResizing.gridSpan.y * step - GRID_GAP
        );
    }

    drawMinimap();

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
