import { div, img, input, setElemPosition, setElemSize } from "./ui/html";
import {
    V2,
    add,
    addAll,
    addScalar,
    addX,
    diff,
    diffScalar,
    divide,
    mult,
    roundV2,
    vec,
} from "./ui/vec";
import { GRID_GAP, GRID_SIZE, isSpaceDown, mouse, pos, scale } from "./index";

import "./panel.css";
import { getChannelPlaylists, getPlaylistVideos } from "./api";
import { savePanelState } from "./localStorage";

export type PanelItem = {
    title: string;
    itemId: string;
    itemImage?: string;
    type: "video" | "playlist";
};
export type Panel = {
    gridPos: V2;
    gridSpan: V2;
    title: string;
    type: "channel" | "playlist";
    itemId: string;
    selectedSection: "Videos" | "Playlists";
    image: string;

    allVideosPlaylistId: string;
    allVideos: PanelItem[];
    playlists: PanelItem[];

    el: HTMLElement;
};

export let panelDragging: Panel | undefined;
export let panelResizing: Panel | undefined;

let panelDraggingPosition = vec(0, 0);
export let panelMovingShadowPos = vec(0, 0);
export let mouseDeltaDuringResize = vec(0, 0);
let mousePosDuringResize = vec(0, 0);

// this is bullshit, need to figure out when I need  scale and when not
export const gridToAbs = (v: V2) => mult(v, (GRID_SIZE + GRID_GAP) * scale);
export const gridToAbs2 = (v: V2) => mult(v, GRID_SIZE + GRID_GAP);
export const absToGrid = (v: V2) =>
    roundV2(divide(v, (GRID_SIZE + GRID_GAP) * scale));
export const absToGrid2 = (v: V2) => roundV2(divide(v, GRID_SIZE + GRID_GAP));

function startMovingPanel(e: Event, panel: Panel) {
    if (!isSpaceDown) {
        panelDragging = panel;
        panelDragging.el.classList.add("panel-repositioned");
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
        panelDragging.el.classList.remove("panel-repositioned");
        panelDragging.gridPos = { ...panelMovingShadowPos };
        panelDragging = undefined;
        panelMovingShadowPos = vec(0, 0);
        panelDraggingPosition = vec(0, 0);
        updatePanels();
        savePanelState(panels, "main");
    }
}

function onPanelStartResize(e: MouseEvent, panel: Panel) {
    panelResizing = panel;
    panelResizing.el.classList.add("panel-repositioned");
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
        panelResizing.el.classList.remove("panel-repositioned");
        panelResizing = undefined;
        updatePanels();
        savePanelState(panels, "main");
    }
}

document.addEventListener("mouseup", () => {
    endMovingPanel();
    onPanelEndResize();
});

function panelTabButton(panel: Panel, title: Panel["selectedSection"]) {
    const res = div({
        className: "panel-tab",
        children: [title],
        onMouseDown: (e) => e.stopPropagation(),
        onClick: () => togglePanelSection(panel, title),
    });
    return res;
}

function togglePanelSection(panel: Panel, section: Panel["selectedSection"]) {
    panel.selectedSection = section;
    for (const panelTab of panel.el.getElementsByClassName("panel-tab")) {
        const tab = panelTab as HTMLElement;
        const isActive = tab.innerText == panel.selectedSection;
        tab.classList.toggle("active", isActive);
    }
    loadPanelItems(panel);
}

async function loadPanelItems(panel: Panel) {
    const panelBody = panel.el.getElementsByClassName("panel-body")[0];
    let items =
        panel.selectedSection == "Videos" ? panel.allVideos : panel.playlists;

    if (items.length == 0) {
        if (panel.type == "channel") {
            if (panel.selectedSection == "Videos") {
                items = panel.allVideos = await getPlaylistVideos(
                    panel.allVideosPlaylistId
                );
            } else {
                items = panel.playlists = await getChannelPlaylists(
                    panel.itemId
                );
            }
        } else {
            items = panel.allVideos = await getPlaylistVideos(panel.itemId);
        }
        savePanelState(panels, "main");
    }

    panelBody.replaceChildren(
        ...items.map((p) =>
            div({
                className: "panel-item",
                onClick: () => {
                    if (p.type == "playlist") {
                        const gridPos = addX(panel.gridPos, panel.gridSpan.x);

                        addPanel({
                            gridPos,
                            gridSpan: { ...panel.gridSpan },
                            type: p.type,
                            itemId: p.itemId,
                            image:
                                p.itemImage ||
                                `https://i.ytimg.com/vi/${p.itemId}/mqdefault.jpg`,
                            title: p.title,
                            selectedSection: "Videos",

                            allVideosPlaylistId: panel.allVideosPlaylistId,
                            allVideos: [],
                            playlists: [],
                            el: undefined!,
                        });
                    }
                },
                children: [
                    img({
                        src:
                            p.itemImage ||
                            `https://i.ytimg.com/vi/${p.itemId}/mqdefault.jpg`,
                    }),
                    p.title,
                ],
            })
        )
    );
}

function removePanel(panel: Panel) {
    panels = panels.filter((p) => p != panel);
    panel.el.remove();
    savePanelState(panels, "main");
}

export const addPanel = (panel: Panel) => {
    const el = div({
        className: "panel",
        onMouseDown: (e) => startMovingPanel(e, panel),
        children: [
            panel.type == "playlist"
                ? div({
                      className: "playlist-youtube-title",
                      style: { backgroundImage: `url(${panel.image})` },
                      children: [
                          div({
                              className: "playlist-youtube-title-text",
                              children: [
                                  panel.title,
                                  input({
                                      className: "panel-remove",
                                      type: "button",
                                      value: "X",
                                      onClick: () => removePanel(panel),
                                  }),
                              ],
                          }),
                      ],
                  })
                : div({
                      className: "panel-title",
                      children: [
                          img({
                              className: "panel-title-channel-image",
                              src: panel.image,
                          }),
                          panel.title,
                          input({
                              className: "panel-remove",
                              type: "button",
                              value: "X",
                              onClick: () => removePanel(panel),
                          }),
                      ],
                  }),
            panel.type == "channel" &&
                div({
                    className: "panel-tabs",
                    children: [
                        panelTabButton(panel, "Videos"),
                        panelTabButton(panel, "Playlists"),
                    ],
                }),
            div({
                className: "panel-body",
                onMouseDown: (e) => e.stopPropagation(),
            }),
            div({
                className: "panel-dragger",
                onMouseDown: (e) => onPanelStartResize(e, panel),
            }),
        ],
    });
    panel.el = el;
    togglePanelSection(panel, panel.selectedSection);

    panels.push(panel);

    document.body.children[0].insertAdjacentElement("afterend", el);
    updatePanels();
};

export let panels: Panel[] = [];

// panelAt(vec(2, 2), vec(2, 2), {
//     type: "channel",
//     image: "https://yt3.googleusercontent.com/ytc/AIdro_mpYedipdXUXCKkwjQEeFrepFlDHZ0LiczqWeKyG0YmJvA=s176-c-k-c0x00ffffff-no-rj",
//     title: "Vsauce",
// }),
// panelAt(vec(2, 2), vec(2, 4), {
//     type: "channel",
//     itemId: "UCsXVk37bltHxD1rDPwtNM8Q",
//     image: "https://yt3.googleusercontent.com/ytc/AIdro_nVQf8Psqlpa_dTYOWy0WESNzpzzJDUUv2LhGEMt8jQrvs=s176-c-k-c0x00ffffff-no-rj",
//     title: "Kurzgesagt – In a Nutshell",
// }),
// panelAt(vec(4, 6), vec(2, 4), {
//     type: "playlist",
//     image: "https://i.ytimg.com/vi/UjtOGPJ0URM/mqdefault.jpg",
//     title: "Our Best Stuff",
//     items: greatFilter.map((p) => ({
//         title: p.snippet.title,
//         image: p.snippet.thumbnails.medium.url,
//     })),
// }),
// panelAt(vec(6, 8), vec(2, 4), {
//     type: "channel",
//     image: "https://yt3.googleusercontent.com/ytc/AIdro_kNzBhztgwPy3i0rF0P7jTRjKtqcIdSZaHgr8lpvUae_g=s176-c-k-c0x00ffffff-no-rj",
//     title: "Better Ideas",
// }),

// panelAt(vec(6, 2), vec(2, 6), {
//     type: "channel",
//     image: "https://yt3.googleusercontent.com/ytc/AIdro_k0Sw7jU_Mv6quyQPDsLv_Oh8ZHnZk9_E1ra8xZeQmMxAI=s176-c-k-c0x00ffffff-no-rj",
//     title: "Клятий раціоналіст",
// }),
// panelAt(vec(8, 2), vec(2, 6), {
//     type: "channel",
//     image: "https://yt3.googleusercontent.com/-TR5KJCAsxUFz5v5zNidpdK1xWBgi2mhj1u1tZVylVL91TmrKZ8r2OfU7wb49JYEzyz0MEF17A=s176-c-k-c0x00ffffff-no-rj",
//     title: "Cure Music",
// }),
// panelAt(vec(10, 2), vec(3, 6), {
//     type: "channel",
//     image: "https://yt3.googleusercontent.com/ytc/AIdro_nPkfGokIxWmwvboXDKzsAFUZ4Abr9bsqBVVcZ4JI2QUto=s176-c-k-c0x00ffffff-no-rj",
//     title: "Folding Ideas",
//     items: foldingIdeasPlaylists.map((p) => ({
//         title: p.snippet.title,
//         image: p.snippet.thumbnails.medium.url,
//     })),
// }),
//   panelAt(vec(13, 2), vec(2, 6), {
//     type: "channel",
//     image:
//       "https://yt3.googleusercontent.com/JDL33l_KHJICl39nBFgsiYfnJ2EZF_XjIUmwsGVNvJneur1lXYW4N3S7pI_s4rh54nnQIBopdJo=s176-c-k-c0x00ffffff-no-rj",
//     title: "Radio Intense",
//     items: boardElectro.panels[0].data.map((i) => ({
//       title: i.title,
//       image: i.image || "",
//     })),
//   }),
// ];

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
