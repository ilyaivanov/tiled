import type { Panel } from "./index";
import { play } from "./youtubePlayer";

let panel: Panel | undefined;
let currentVideoId: string | undefined;
export function playItem(videoId: string, p: Panel) {
    panel = p;
    currentVideoId = videoId;
    play(videoId);
}

document.addEventListener("video-ended", () => {
    if (panel && currentVideoId) {
        const index = panel.data.findIndex((i) => i.videoId == currentVideoId);
        if (index < panel.data.length - 1) {
            playItem(panel.data[index + 1].videoId, panel);
        }
    }
});
