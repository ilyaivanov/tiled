import { ctx, fillRect } from "../src/ui/canvas";
import { lastTime, start } from "../src/ui/framework";
import { div } from "../src/ui/html";
import { add, addY, diff, mult, vec } from "../src/ui/vec";

import "./index.css";

var img1 = new Image();
img1.src = "https://i.ytimg.com/vi/1hBvXu6uZGQ/hqdefault.jpg";
let loaded = false;
img1.addEventListener("load", () => {
    loaded = true;
});

let scale = 1;
let shift = vec(0, 0);
let mouse = vec(0, 0);
let screen = vec(window.innerWidth, window.innerHeight);
let isSpaceDown = false;

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

window.addEventListener("mousemove", (e) => {
    const newMousePos = { x: e.clientX, y: e.clientY };

    const isPrimaryButtonDown = e.buttons & 1;
    if (isSpaceDown && isPrimaryButtonDown) {
        const shiftDelta = diff(newMousePos, mouse);
        shift = add(shift, shiftDelta);
        assignAstyles();
    }
    console.log(newMousePos.x, shift);

    mouse = newMousePos;
});

function scaleTo(newScale: number) {
    newScale = Math.max(newScale, 0.05);

    // - shift.x * scale
    const focal = { x: mouse.x, y: mouse.y };

    const newShift = add(shift, mult(focal, scale - newScale));

    console.log(shift.x, newShift.x, scale, newScale);
    // shift = vec(newShift.x, newShift.y);
    shift = newShift;
    scale = newScale;

    assignAstyles();
}

window.addEventListener("keydown", (e) => {
    if (e.code.startsWith("Digit") && e.ctrlKey) {
        const targetScale = e.code.substring(5);
        scaleTo(1 - (+targetScale - 1) * 0.25);
        e.preventDefault();
    } else if (e.code.startsWith("Digit") && e.altKey) {
        const targetScale = e.code.substring(5);
        scaleTo(1 + (+targetScale - 1) * 0.25);
        e.preventDefault();
    }
});

document.addEventListener(
    "wheel",
    (e) => {
        mouse = vec(e.clientX, e.clientY);

        if (e.ctrlKey) scaleTo(scale - e.deltaY / 300);
        else {
            shift = addY(shift, -e.deltaY);
            assignAstyles();
        }
        e.preventDefault();
    },
    { passive: false }
);

const el = div({ className: "foo", children: [img1, "My Awesome Title"] });

const elWidth = 484;
const elHeight = 396;
function assignAstyles() {
    const startingPos = vec(screen.x - elWidth - 100, 200);
    const pos = add(mult(startingPos, scale), shift);

    Object.assign(el.style, {
        left: pos.x.toFixed(1) + "px",
        top: pos.y.toFixed(1) + "px",
        transform: `scale(${scale.toFixed(3)}) `,
        transformOrigin: "top left",
    });
}
document.body.appendChild(el);
assignAstyles();

// function strokeRect(x: number, y: number, w: number, h: number) {
//     ctx.strokeRect(x * scale, y * scale, w * scale, h * scale);
// }
// function fillRect(x: number, y: number, w: number, h: number) {
//     ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
// }
// function strokeRect(x: number, y: number, w: number, h: number) {
//     ctx.strokeRect(x, y, w, h);
// }
// function fillRect(x: number, y: number, w: number, h: number) {
//     ctx.fillRect(x, y, w, h);
// }

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(-20000, -200000, 400000, 400000);

    ctx.fillStyle = "yellow";
    ctx.fillRect(screen.x / 2, 0, 2, 2000);

    fillRect(diff(mouse, vec(5, 5)), vec(10, 10));

    ctx.save();
    ctx.translate(shift.x, shift.y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "white";
    ctx.fillRect(screen.x / 2, 0, 2, 2000);

    ctx.lineWidth = 10;
    ctx.strokeStyle = "hsl(0, 100%, 60%)";
    ctx.strokeRect(0, 0, screen.x, screen.y);

    // for (let i = 0; i < 360; i++) {
    //     ctx.fillStyle = `hsl(${i} 100% 50%)`;
    //     fillRect(200, 200 + i, 400, window.devicePixelRatio);
    // }

    ctx.fillStyle = "white";
    ctx.fillRect(screen.x - 200, 100, 100, 100);

    ctx.fillStyle = "white";
    ctx.fillRect(screen.x - elWidth - 100, elHeight + 200, 100, 100);

    // if (loaded) {
    //     ctx.drawImage(img1, 800, 20);
    // }

    ctx.restore();
}

start({ draw });
