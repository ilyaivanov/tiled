import { div, fragment, img, span } from "./ui/html";
import { Panel, startMoving, startResizing } from "./index";
import { playItem } from "./player";

import "./panels.css";

const ytImage = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

export function ytPlaylist(panel: Panel) {
    const panelEl = div({
        className: "panel",
        children: [
            div({
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
                                    span({
                                        className: "playlist-item-year",
                                        children: [i.year + ""],
                                    }),
                                    img({
                                        className: "playlist-item-image",
                                        src: ytImage(i.videoId),
                                    }),
                                    i.title,
                                ],
                                onClick: () => playItem(i.videoId, panel),
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
