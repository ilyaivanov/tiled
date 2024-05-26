import { V2 } from "./vec";

const canvas = document.createElement("canvas");
export const ctx = canvas.getContext("2d")!;
document.body.appendChild(canvas);

let screenWidth = 0;
let screenHeight = 0;
let scale = 0;

export function onResize() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    scale = window.devicePixelRatio || 1;

    canvas.style.width = `${screenWidth}px`;
    canvas.style.height = `${screenHeight}px`;
    canvas.width = Math.floor(screenWidth * scale);
    canvas.height = Math.floor(screenHeight * scale);
    ctx.scale(scale, scale);

    ctx.font = "500 60px Segoe UI";
}
onResize();
window.addEventListener("resize", onResize);

export function fillRect(topLeft: V2, size: V2) {
    ctx.fillRect(topLeft.x, topLeft.y, size.x, size.y);
}
