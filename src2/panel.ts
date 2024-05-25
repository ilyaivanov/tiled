// import { boardElectro } from "../src/data.electro";
import {
    foldingIdeasPlaylists,
    greatFilter,
    kurzgesagtPlaylist,
} from "../src/d.yt";
import { Item } from "../src/index";
import { div, img, setElemPosition, setElemSize } from "../src/ui/html";
import {
    V2,
    add,
    addAll,
    addScalar,
    diff,
    diffScalar,
    divide,
    mult,
    roundV2,
    vec,
} from "../src/ui/vec";
import { GRID_GAP, GRID_SIZE, isSpaceDown, mouse, pos, scale } from "./index";

import "./panel.css";

type Panel = {
    gridPos: V2;
    gridSpan: V2;
    el: HTMLElement;
    selectedSection: string;

    sections: Record<string, Item[]>;
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
    }

    onPanelEndResize();
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
    }
}

document.addEventListener("mouseup", endMovingPanel);

type PanelProps = {
    type: "channel" | "playlist";
    itemId: string;
    image: string;
    title: string;
};

function panelTabButton(panel: Panel, title: string) {
    const res = div({
        className: "panel-tab",
        children: [title],
        onMouseDown: (e) => e.stopPropagation(),
        onClick: () => togglePanelSection(panel, title),
    });
    return res;
}

function togglePanelSection(panel: Panel, section: string) {
    panel.selectedSection = section.toLocaleLowerCase();
    for (const panelTab of panel.el.getElementsByClassName("panel-tab")) {
        const tab = panelTab as HTMLElement;
        const isActive =
            tab.innerText.toLocaleLowerCase() == panel.selectedSection;
        tab.classList.toggle("active", isActive);
    }
    loadPanelItems(panel);
}

function loadPanelItems(panel: Panel) {
    const panelBody = panel.el.getElementsByClassName("panel-body")[0];
    const items =
        panel.selectedSection == "videos" ? greatFilter : kurzgesagtPlaylist;

    panelBody.replaceChildren(
        ...items
            .map((p) => ({
                title: p.snippet.title,
                image: p.snippet.thumbnails.medium.url,
                type: panel.selectedSection == "videos" ? "video" : "playlist",
            }))
            .map((p) =>
                div({
                    className: "panel-item",
                    onClick: () => {
                        if (p.type == "playlist") {
                            const pos = vec(
                                panel.gridPos.x + panel.gridSpan.x,
                                panel.gridPos.y
                            );
                            const span = vec(
                                panel.gridSpan.x,
                                panel.gridSpan.y
                            );
                            const newPanel = panelAt(pos, span, {
                                type: p.type,
                                itemId: "foo",
                                image: p.image,
                                title: p.title,
                            });

                            panels.push(newPanel);

                            document.body.children[0].insertAdjacentElement(
                                "afterend",
                                newPanel.el
                            );
                            updatePanels();
                        }
                    },
                    children: [img({ src: p.image }), p.title],
                })
            )
    );
}

const panelAt = (gridPos: V2, gridSpan: V2, props: PanelProps) => {
    const res: Panel = {
        gridPos,
        gridSpan,
        selectedSection: "videos",
        sections: {},
        el: undefined!,
    };
    const el = div({
        className: "panel",
        onMouseDown: (e) => startMovingPanel(e, res),
        children: [
            props.type == "playlist"
                ? div({
                      className: "playlist-youtube-title",
                      style: { backgroundImage: `url(${props.image})` },
                      children: [
                          div({
                              className: "playlist-youtube-title-text",
                              children: [props.title],
                          }),
                      ],
                  })
                : div({
                      className: "panel-title",
                      children: [
                          img({
                              className: "panel-title-channel-image",
                              src: props.image,
                          }),
                          props.title,
                      ],
                  }),
            props.type == "channel" &&
                div({
                    className: "panel-tabs",
                    children: [
                        panelTabButton(res, "Videos"),
                        panelTabButton(res, "Playlists"),
                    ],
                }),
            div({
                className: "panel-body",
                onMouseDown: (e) => e.stopPropagation(),
            }),
            div({
                className: "panel-dragger",
                onMouseDown: (e) => onPanelStartResize(e, res),
            }),
        ],
    });
    res.el = el;
    togglePanelSection(res, res.selectedSection);
    return res;
};

export let panels: Panel[] = [
    // panelAt(vec(2, 2), vec(2, 2), {
    //     type: "channel",
    //     image: "https://yt3.googleusercontent.com/ytc/AIdro_mpYedipdXUXCKkwjQEeFrepFlDHZ0LiczqWeKyG0YmJvA=s176-c-k-c0x00ffffff-no-rj",
    //     title: "Vsauce",
    // }),
    panelAt(vec(2, 2), vec(2, 4), {
        type: "channel",
        itemId: "UCsXVk37bltHxD1rDPwtNM8Q",
        image: "https://yt3.googleusercontent.com/ytc/AIdro_nVQf8Psqlpa_dTYOWy0WESNzpzzJDUUv2LhGEMt8jQrvs=s176-c-k-c0x00ffffff-no-rj",
        title: "Kurzgesagt – In a Nutshell",
    }),
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
];

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
