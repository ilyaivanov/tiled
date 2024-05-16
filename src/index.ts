import { ctx, fillRect } from "./ui/canvas";
import { lastTime, start } from "./ui/framework";
import { div, input, setElemPosition, setElemSize, span } from "./ui/html";
import { V2, add, addAll, addScalar, diff, divide, mult, roundV2, vec } from "./ui/vec";
import "./grid.css";
import { youtubeIframeId } from "./youtubePlayer";
import { moonIcon, sunIcon } from "./ui/icons";
import {
    getGridProps,
    getIsDark,
    getOffset,
    getSelectedBoard,
    loadPanelStateForBoard,
    saveGridProps,
    saveOffset,
    savePanelState,
    setIsDark,
    setSelectedBoard,
} from "./localStorage";
import { Board, boards } from "./data.new";
import { ytPlaylist } from "./panels";

//also defined in CSS
const headerHeight = 58;

let screen = vec(window.innerWidth, window.innerHeight);
const scale = 1;
let mouse = { x: 0, y: 0 };
const gridProps = getGridProps();
let cellSize = gridProps.size;
let gap = gridProps.gap;
let shift = vec(gap, gap + headerHeight);

let isSpaceDown = false;
let isBlack = false;

let mousePosMoving = { x: 0, y: 0 };
let mouseDeltaDuringResize = { x: 0, y: 0 };
let panelMovingShadowPos = { x: 0, y: 0 };
let panelMoving: Panel | undefined = undefined;
let panelResizing: Panel | undefined = undefined;

const darkColors = {
    background: "#000000",
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
    setIsDark(isBlack);
    applyTheme();
}

function applyTheme() {
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
    if (e.code == "Space") {
        if (!document.body.style.cursor) document.body.style.cursor = "grab";
        isSpaceDown = true;
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => {
    if (e.code == "Space") {
        if (isSpaceDown) saveOffset(shift, boardName);
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

window.addEventListener("resize", () => {
    shift.x += (window.innerWidth - screen.x) / 2;
    updatePosition();
    screen = vec(window.innerWidth, window.innerHeight);
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

export function startMoving(panel: Panel) {
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

        if (boardName) savePanelState(panels, boardName);
        panelMoving = undefined;
    }
}

export function startResizing(panel: Panel) {
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

        if (boardName) savePanelState(panels, boardName);
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
        if (hideGridAt < lastTime) {
            isGridVisible = false;
            hideGridAt = Infinity;
        }

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

export type Track = {
    title: string;
    time: string;
    videoId: string;
    channelId?: string;
    channelName?: string;
};

export type Item = {
    year?: number;
    title: string;
    videoId: string;
    image?: string;
    playlistId?: string;
    channelId: string;
    channelName: string;
    tracks?: Track[];
};
export type Panel = {
    isYoutubePlaylist?: boolean;
    image?: string;
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

let boardName: string = getSelectedBoard() || "Country";
let panels: Panel[] = [];

function loadBoard(board: Board) {
    boardName = board.title;
    setSelectedBoard(board.title);
    shift = getOffset(board.title) || vec((window.innerWidth - 1000) / 2, gap + headerHeight);

    const savedProps = loadPanelStateForBoard(board.title) || [];

    for (const panel of board.panels) {
        const savedPanel = savedProps.find((p) => p.title == panel.title);
        if (savedPanel) {
            panel.gridPos = savedPanel.gridPos;
            panel.gridSpan = savedPanel.gridSpan;
        }
    }

    panels = board.panels.map((s, i) => {
        s.el = ytPlaylist(s);
        return s;
    });
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

const boardTabs = new WeakMap<Board, HTMLElement>();

function activate(board: Board) {
    activeTab?.classList.remove("active");
    activeTab = boardTabs.get(board);
    activeTab?.classList.add("active");
    loadBoard(board);
}

function navbarItem(board: Board) {
    return span({
        className: "navbar-item",
        onClick: () => activate(board),
        ref: (ref) => boardTabs.set(board, ref),
        children: [board.title],
    });
}

let gridSizeEl: HTMLInputElement;
let gridGapEl: HTMLInputElement;
let hideGridAt = Infinity;

function updateGridDimensions(newCellSize: number, newGap: number) {
    if (newCellSize >= 1 && newGap >= 1) {
        console.log(newCellSize, newGap);
        cellSize = newCellSize;
        gridSizeEl.value = cellSize + "";
        gap = newGap;
        gridGapEl.value = gap + "";

        updatePosition();
        isGridVisible = true;
        hideGridAt = lastTime + 1000;

        saveGridProps(cellSize, gap);
    }
}

document.body.append(
    div({
        className: "navbar",
        children: [
            ...boards.map(navbarItem),
            input({
                className: "reset-btn",
                type: "button",
                value: "Reset every change",
                onClick: () => {
                    localStorage.clear();
                    location.reload();
                },
            }),
            div({
                className: "group",
                children: [
                    div({ className: "group-title", children: ["Grid gap"] }),
                    div({
                        className: "group-controls",
                        children: [
                            input({
                                type: "button",
                                value: "-",
                                onClick: () => updateGridDimensions(cellSize, gap - 1),
                            }),
                            input({
                                className: "group-input",
                                type: "input",
                                value: gap + "",
                                ref: (ref) => (gridGapEl = ref),
                                onInput: function () {
                                    console.log(this);
                                    updateGridDimensions(cellSize, +this.value);
                                },
                            }),
                            input({
                                type: "button",
                                value: "+",
                                onClick: () => updateGridDimensions(cellSize, gap + 1),
                            }),
                        ],
                    }),
                ],
            }),
            div({
                className: "group",
                children: [
                    div({ className: "group-title", children: ["Grid size"] }),
                    div({
                        className: "group-controls",
                        children: [
                            input({
                                type: "button",
                                value: "-",
                                onClick: () => updateGridDimensions(cellSize - 1, gap),
                            }),
                            input({
                                className: "group-input",
                                type: "input",
                                ref: (ref) => (gridSizeEl = ref),
                                value: cellSize + "",
                                onInput: function () {
                                    updateGridDimensions(+this.value, gap);
                                },
                            }),
                            input({
                                type: "button",
                                value: "+",
                                onClick: () => updateGridDimensions(cellSize + 1, gap),
                            }),
                        ],
                    }),
                ],
            }),
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

export function insertPanel(newPanel: Panel) {
    panels.push(newPanel);

    if (newPanel.el) newPanel.el.remove();

    newPanel.el = ytPlaylist(newPanel);
    document.body.append(newPanel.el);
    updatePanel(newPanel);
    newPanel.el.animate(
        [
            { opacity: 0, translate: "-10px 0px" },
            { opacity: 1, translate: "0px 0px" },
        ],
        { duration: 200, easing: "ease-in" }
    );
}

const savedIsDark = getIsDark();
if (
    typeof savedIsDark == "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
) {
    toggleBlackMode();
} else if (savedIsDark) toggleBlackMode();
else applyTheme();

const boardToActivate = getSelectedBoard();
if (boardToActivate) {
    const b = boards.find((b) => b.title == boardToActivate);
    if (b) activate(b);
    else activate(boards[0]);
} else activate(boards[0]);
