// import { canvas, ctx } from "../src/ui/canvas";
import { V2, diff, mult, vec } from "../src/ui/vec";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.body.appendChild(canvas);

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

// const baseScale = 1;
const baseScale = window.devicePixelRatio || 1;

let mouse = vec(0, 0);
var scale = 1; // current scale
let pos = { x: 0, y: 0 }; // current position of origin
// const canvasScale = window.devicePixelRatio || 1;

canvas.style.width = `${screenWidth}px`;
canvas.style.height = `${screenHeight}px`;
canvas.width = Math.floor(screenWidth * baseScale);
canvas.height = Math.floor(screenHeight * baseScale);

document.addEventListener(
    "mousewheel",
    function onmousewheel(event: Event) {
        var e = event as WheelEvent;
        const scaleFactor = 1.3;
        const newScale = e.deltaY > 0 ? 1 / scaleFactor : scaleFactor;
        scaleBy(vec(e.offsetX, e.offsetY), newScale);
        e.preventDefault();
    },
    { passive: false }
);
document.addEventListener("dblclick", (event: Event) => {
    const e = event as MouseEvent;
    setScale(vec(e.offsetX, e.offsetY), 1);
});

window.addEventListener("mousemove", (e) => {
    const newMousePos = { x: e.clientX, y: e.clientY };

    const isPrimaryButtonDown = e.buttons & 1;
    if (isPrimaryButtonDown) {
        pos.x += newMousePos.x - mouse.x;
        pos.y += newMousePos.y - mouse.y;
    }

    mouse = newMousePos;
});

function scaleBy(at: V2, amount: number) {
    scale *= amount;
    // pos = diff(at, mult(diff(at, pos), amount));
    pos.x = at.x - (at.x - pos.x) * amount;
    pos.y = at.y - (at.y - pos.y) * amount;
}

function setScale(at: V2, newScale: number) {
    pos.x = at.x - (at.x - pos.x) * (newScale / scale);
    pos.y = at.y - (at.y - pos.y) * (newScale / scale);
    scale = newScale;
}

//
// Drawing
//
//

function drawCanvas() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.scale(baseScale, baseScale);
    ctx.translate(pos.x, pos.y);
    ctx.scale(scale, scale);
    // apply(); // set the 2D context transform to the view

    const squareSize = 50;
    const gap = 10;
    for (let x = -50; x < 50; x++) {
        for (let y = -50; y < 50; y++) {
            let color = "hsl(0, 50%, 60%)";
            if ((x + y) % 5 == 0) color = "hsl(40, 50%, 60%)";
            else if ((x + y) % 15 == 0) color = "hsl(80, 50%, 60%)";
            else if ((x + y) % 2 == 0) color = "hsl(120, 50%, 60%)";

            ctx.fillStyle = color;

            const step = squareSize + gap;
            ctx.fillRect(x * step, y * step, squareSize, squareSize);
        }
    }

    ctx.font = "36px Segoe UI";
    ctx.fillStyle = "black";
    ctx.fillText("Hello there from heaven", 200, 200);

    requestAnimationFrame(drawCanvas);
}

requestAnimationFrame(drawCanvas);
