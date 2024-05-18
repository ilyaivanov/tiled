// import { canvas, ctx } from "../src/ui/canvas";
import { div } from "../src/ui/html";
import { V2, diff, mult, vec } from "../src/ui/vec";
import "./index.css";

var img1 = new Image();
img1.src = "https://i.ytimg.com/vi/1hBvXu6uZGQ/hqdefault.jpg";

const el = div({
    className: "foo",
    children: [
        img1,
        div({
            className: "foo-footer",
            children: [
                //
                div({ children: ["One"] }),
                div({ children: ["Two"] }),
                div({ children: ["Three"] }),
            ],
        }),
    ],
});

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.body.appendChild(canvas);

document.body.appendChild(el);

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let baseScale = window.devicePixelRatio || 1;

let mouse = vec(0, 0);
var scale = 1;
let pos = { x: 0, y: 0 };

let panelX = 0;
let panelY = 0;

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
assignAstyles();

document.addEventListener(
    "mousewheel",
    function onmousewheel(event: Event) {
        var e = event as WheelEvent;
        const scaleFactor = 1.3;
        const newScale = e.deltaY > 0 ? 1 / scaleFactor : scaleFactor;
        scaleBy(vec(e.clientX, e.clientY), newScale);
        e.preventDefault();
    },
    { passive: false }
);

document.addEventListener("dblclick", (event: Event) => {
    const e = event as MouseEvent;
    setScale(vec(e.clientX, e.clientY), 1);
});

window.addEventListener("mousemove", (e) => {
    const newMousePos = { x: e.clientX, y: e.clientY };

    const isPrimaryButtonDown = e.buttons & 1;
    if (isPrimaryButtonDown) {
        pos.x += newMousePos.x - mouse.x;
        pos.y += newMousePos.y - mouse.y;

        console.log(pos);
        assignAstyles();
    }

    mouse = newMousePos;
});

function scaleBy(at: V2, amount: number) {
    setScale(at, scale * amount);

    assignAstyles();
}

function setScale(at: V2, newScale: number) {
    pos.x = at.x - (at.x - pos.x) * (newScale / scale);
    pos.y = at.y - (at.y - pos.y) * (newScale / scale);
    scale = newScale;

    assignAstyles();
}

//
// Drawing
//
//

function assignAstyles() {
    console.log(panelX + pos.x.toFixed(1) + "px", scale.toFixed(3));
    Object.assign(el.style, {
        left: (panelX + pos.x).toFixed(1) + "px",
        top: (panelY + pos.y).toFixed(1) + "px",
        transform: `scale(${scale.toFixed(3)}) `,
        transformOrigin: "top left",
    });
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.scale(baseScale, baseScale);
    ctx.translate(pos.x, pos.y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "white";
    ctx.fillRect(screenWidth / 2, 0, 2, screenHeight);

    ctx.lineWidth = 10;
    ctx.strokeStyle = "hsl(0, 100%, 60%)";
    ctx.strokeRect(0, 0, screenWidth, screenHeight);

    ctx.fillStyle = "white";
    ctx.fillRect(screenWidth - 200, 100, 100, 100);

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
