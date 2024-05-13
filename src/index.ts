import { ctx, fillRect } from "./ui/canvas";
import { start } from "./ui/framework";
import { div, img, setElemPosition, setElemSize, span } from "./ui/html";
import { V2, add, addAll, addScalar, diff, divide, lerp, mult, roundV2, vec } from "./ui/vec";

// import { anjunadeep, deepHouse, globalUndergroundItems, xeniaPlaylist } from "./data";

import "./grid.css";
import { country } from "./data.boards";
import { play, youtubeIframeId } from "./youtubePlayer";
import { moonIcon, sunIcon } from "./ui/icons";

//also defined in CSS
const headerHeight = 58;

const scale = 1;
let mouse = { x: 0, y: 0 };
const cellSize = 100;
const gap = 10;
let shift = vec(gap, gap + headerHeight);

let isSpaceDown = false;
let isBlack = false;

let mousePosMoving = { x: 0, y: 0 };
let mouseDeltaDuringResize = { x: 0, y: 0 };
let panelMovingShadowPos = { x: 0, y: 0 };
let panelMoving: Panel | undefined = undefined;
let panelResizing: Panel | undefined = undefined;

const darkColors = {
    background: "#2f3b50",
    panel: "#3f4b60",
    panelPlaceholder: "rgb(10, 30, 40)",
};

const lightColors = {
    background: "#F5F5FA",
    panel: "#FFFFFF",
    panelPlaceholder: "grey",
};
let colors = lightColors;
let themeToggler: HTMLElement;

const gridToAbs = (v: V2) => mult(v, cellSize + gap);
const absToGrid = (v: V2) => roundV2(divide(v, cellSize + gap));

function toggleBlackMode() {
    isBlack = !isBlack;

    document.body.classList.toggle("dark", isBlack);

    if (isBlack) {
        colors = darkColors;
        themeToggler.replaceChildren(sunIcon());
    } else {
        colors = lightColors;
        themeToggler.replaceChildren(moonIcon());
    }
}

window.addEventListener("keydown", (e) => {
    if (e.code == "KeyB" && e.ctrlKey) toggleBlackMode();

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
    showGrid();
    panelMoving = panel;
    panelMovingShadowPos = { ...panel.gridPos };

    panel.el.classList.add("panel-grabbing");
    mousePosMoving = { ...mouse };
}

function onMoving() {
    if (panelMoving) {
        const snappedGridPosition = absToGrid(
            diff(add(gridToAbs(panelMoving.gridPos), mouse), mousePosMoving)
        );

        panelMovingShadowPos = { ...snappedGridPosition };

        setElemPosition(
            panelMoving.el,
            addAll(diff(mouse, mousePosMoving), shift, gridToAbs(panelMoving.gridPos))
        );
    }
}

function stopMoving() {
    if (panelMoving) {
        hideGrid();
        panelMoving.gridPos = { ...panelMovingShadowPos };
        panelMoving.el.classList.remove("panel-grabbing");
        updatePanel(panelMoving);

        panelMoving = undefined;
    }
}

function startResizing(panel: Panel) {
    panelResizing = panel;
    showGrid();
    const panelBottomRightCorner = addScalar(
        mult(add(panelResizing.gridPos, panelResizing.gridSpan), cellSize + gap),
        -gap
    );

    mouseDeltaDuringResize = diff(panelBottomRightCorner, add(mouse, shift));

    panel.el.classList.add("panel-resizing");
    onResizing();
}

function onResizing() {
    if (panelResizing) {
        const size = diff(
            addAll(mouse, mouseDeltaDuringResize, shift),
            gridToAbs(panelResizing.gridPos)
        );

        panelResizing.gridSpan = absToGrid(size);
        setElemSize(panelResizing.el, size);
    }
}

function stopResizing() {
    if (panelResizing) {
        hideGrid();
        panelResizing.el.classList.remove("panel-resizing");
        updatePanel(panelResizing);

        panelResizing = undefined;
    }
}

let isGridVisible = false;
function showGrid() {
    isGridVisible = true;
}
function hideGrid() {
    isGridVisible = false;
}

function draw() {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, 20000, 20000);

    if (isGridVisible) {
        ctx.fillStyle = colors.panel;

        for (let x = -20; x < 20; x++) {
            for (let y = -20; y < 20; y++) {
                const pos = add(shift, gridToAbs({ x, y }));
                fillRect(pos, vec(cellSize, cellSize));
            }
        }
    }

    ctx.fillStyle = colors.panelPlaceholder;
    if (panelMoving) {
        const pos = add(shift, gridToAbs(panelMovingShadowPos));
        const size = addScalar(gridToAbs(panelMoving.gridSpan), -gap);
        fillRect(pos, size);
    }

    if (panelResizing) {
        const pos = add(shift, gridToAbs(panelResizing.gridPos));
        const size = addScalar(gridToAbs(panelResizing.gridSpan), -gap);
        fillRect(pos, size);
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
                            onClick: () => play(i.videoId),
                        })
                    ),
                ],
            }),
            div({ className: "panel-dragger", onMouseDown: () => startResizing(panel) }),
        ],
    });
    return panelEl;
}
type Item = { title: string; videoId: string };
type Panel = {
    title: string;
    gridPos: V2;
    gridSpan: V2;
    data: Item[];
    el: HTMLElement;
};

function panelAt(
    gridX: number,
    gridY: number,
    gridSpanRow: number,
    gridSpanCol: number,
    title: string,
    data: Item[]
) {
    const panel: Panel = {
        gridPos: vec(gridX, gridY),
        gridSpan: vec(gridSpanRow, gridSpanCol),
        title,
        data,
        el: undefined!,
    };
    panel.el = ytPlaylist(panel);
    return panel;
}

let panels: Panel[] = [];

function loadBoard(title: string) {
    if (title == "Country") {
        const panelObjects: Panel[] = [
            //
            panelAt(0, 0, 3, 8, "", []),
            panelAt(3, 0, 3, 2, "", []),
            panelAt(6, 0, 3, 7, "", []),
            panelAt(3, 2, 3, 3, "", []),
        ];
        panels = country[0].panels.map((s, i) => {
            const p = panelObjects[i];
            p.data = s.items.map((item) => ({ title: item.name, videoId: item.videoId }));
            p.title = s.name;
            p.el = ytPlaylist(p);
            return p;
        });
    } else if (title == "Meditation") {
        const panelObjects: Panel[] = [
            //
            panelAt(0, 0, 3, 7, "", []),
            panelAt(3, 2, 2, 1, "", []),
            panelAt(3, 0, 2, 2, "", []),
            panelAt(3, 3, 3, 4, "", []),
            panelAt(5, 0, 4, 3, "", []),
        ];
        panels = country[1].panels.map((s, i) => {
            const p = panelObjects[i];
            p.data = s.items.map((item) => ({ title: item.name, videoId: item.videoId }));
            p.title = s.name;
            p.el = ytPlaylist(p);
            return p;
        });
    } else if (title == "Blues") {
        const panelObjects: Panel[] = [
            panelAt(0, 0, 2, 2, "", []),
            panelAt(4, 0, 2, 2, "", []),
            panelAt(0, 2, 2, 2, "", []),
            panelAt(2, 0, 2, 2, "", []),
        ];
        panels = country[2].panels.map((s, i) => {
            const p = panelObjects[i];
            p.data = s.items.map((item) => ({ title: item.name, videoId: item.videoId }));
            p.title = s.name;
            p.el = ytPlaylist(p);
            return p;
        });
    }
    rebuildPanels();
    updatePosition();
}

function updatePanel(panel: Panel) {
    setElemSize(panel.el, addScalar(mult(panel.gridSpan, cellSize + gap), -gap));
    setElemPosition(panel.el, addAll(shift, mult(panel.gridPos, cellSize + gap)));
}

function updatePosition() {
    for (const panel of panels) updatePanel(panel);
}

function rebuildPanels() {
    for (const el of Array.from(document.getElementsByClassName("panel"))) {
        console.log(el);
        el.remove();
    }

    document.body.append(...panels.map((p) => p.el));
}

let activeTab: HTMLElement | undefined;

function activate(this: HTMLElement, title: string) {
    activeTab?.classList.remove("active");
    activeTab = this;
    activeTab.classList.add("active");
    loadBoard(title);
}

function navbarItem(title: string, isActive = false) {
    const res = span({
        className: "navbar-item",
        onClick: function () {
            activate.call(this, title);
        },
        children: [title],
    });
    if (isActive) activate.call(res, title);

    return res;
}

const tabs = ["Country", "Meditation", "Blues"];

document.body.append(
    div({
        className: "navbar",
        children: [
            ...tabs.map((t, i) => navbarItem(t, i == 0)),
            div({
                className: "theme-toggler",
                onClick: toggleBlackMode,
                ref: (ref) => (themeToggler = ref),
                children: [sunIcon()],
            }),
        ],
    }),
    div({ id: youtubeIframeId, className: "mini-player" }),
    ...panels.map((p) => p.el)
);

if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    toggleBlackMode();
}
