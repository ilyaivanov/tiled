import { div, fragment, img, span } from "./ui/html";
import { Panel, insertPanel, startMoving, startResizing } from "./index";
import { playItem } from "./player";

import "./panels.css";
import { boards } from "./data.new";
import { add, vec } from "./ui/vec";
import { xeniaPlaylist } from "./data.xenia";
import { getPlaylistVideos } from "./api";

const ytImage = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

function ytTitle(panel: Panel) {
    const res = div({
        className: "playlist-youtube-title",
        children: [
            div({
                className: "playlist-youtube-title-text",
                children: [panel.title],
            }),
        ],
        onMouseDown: () => startMoving(panel),
    });

    if (panel.image) res.style.backgroundImage = `url(${panel.image})`;
    return res;
}

export function ytPlaylist(panel: Panel) {
    const panelEl = div({
        className: "panel",
        children: [
            panel.isYoutubePlaylist
                ? ytTitle(panel)
                : div({
                      className: "playlist-title",
                      children: [
                          img({ className: "playlist-title-image", src: panel.image }),
                          panel.title,
                      ],
                      onMouseDown: () => startMoving(panel),
                  }),
            div({
                className: "panel-body",
                children: [
                    ...panel.data.map((i) =>
                        fragment(
                            div({
                                className: "playlist-item",
                                children: [
                                    i.year
                                        ? span({
                                              className: "playlist-item-year",
                                              children: [i.year + ""],
                                          })
                                        : undefined,
                                    img({
                                        className: "playlist-item-image",
                                        src: i.image ? i.image : ytImage(i.videoId),
                                    }),
                                    i.title,
                                ],
                                onClick: async () => {
                                    console.log(i);
                                    if (i.videoId) playItem(i.videoId, panel);
                                    else if (i.playlistId) {
                                        const newP: Panel = {
                                            gridPos: add(panel.gridPos, {
                                                x: panel.gridSpan.x,
                                                y: 0,
                                            }),
                                            gridSpan: { ...panel.gridSpan },
                                            el: undefined!,
                                            image: i.image,
                                            title: i.title,
                                            isYoutubePlaylist: true,
                                            data: [],
                                        };
                                        newP.gridPos = add(panel.gridPos, {
                                            x: panel.gridSpan.x,
                                            y: 0,
                                        });
                                        newP.gridSpan = { ...panel.gridSpan };
                                        // insertPanel(newP);

                                        newP.data = await getPlaylistVideos(i.playlistId);
                                        insertPanel(newP);
                                    }
                                },
                            }),
                            i.tracks
                                ? div({
                                      className: "playlist-track-container",
                                      children: i.tracks.map((track, i) =>
                                          div({
                                              className: "playlist-track",
                                              onClick: () => playItem(track.videoId, panel),
                                              children: [
                                                  span({
                                                      className: "playlist-track-number",
                                                      children: [i + 1 + ""],
                                                  }),
                                                  track.title,
                                                  span({
                                                      className: "playlist-track-time",
                                                      children: [track.time],
                                                  }),
                                              ],
                                          })
                                      ),
                                  })
                                : undefined
                        )
                    ),
                ],
            }),
            div({ className: "panel-dragger", onMouseDown: () => startResizing(panel) }),
        ],
    });
    return panelEl;
}
