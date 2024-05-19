import { diffScalar, mult } from "../src/ui/vec";
import { GRID_GAP, GRID_SIZE, pos, scale } from "./index";
import { panels } from "./panel";

import "./minimap.css";

const canvas = document.createElement("canvas");
canvas.className = "minimap";
const ctx = canvas.getContext("2d")!;
document.body.appendChild(canvas);

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let baseScale = window.devicePixelRatio || 1;

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

const minimapSize = 300;
const minimapScale = 35;
export function drawMinimap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(baseScale, baseScale);

    ctx.fillStyle = "rgb(60, 60, 60)";
    ctx.fillRect(0, screenHeight - minimapSize, minimapSize, minimapSize);

    const step = GRID_SIZE + GRID_GAP;
    for (const panel of panels) {
        ctx.fillStyle = "hsl(0, 40%, 40%)";
        const panelPos = mult(mult(panel.gridPos, step), 1 / minimapScale);

        const panelSize = mult(
            diffScalar(mult(panel.gridSpan, step), GRID_GAP),
            1 / minimapScale
        );

        ctx.fillRect(
            minimapSize / 2 + panelPos.x,
            screenHeight - minimapSize + minimapSize / 2 + panelPos.y,
            panelSize.x,
            panelSize.y
        );
    }

    ctx.fillStyle = "rgba(200, 200, 200, 0.3)";
    ctx.fillRect(
        minimapSize / 2 - pos.x / minimapScale / scale,
        screenHeight -
            minimapSize +
            minimapSize / 2 -
            pos.y / minimapScale / scale,
        screenWidth / minimapScale / scale,
        screenHeight / minimapScale / scale
    );
}

window.addEventListener("resize", onResize);

export const minimapCanvas = canvas;
