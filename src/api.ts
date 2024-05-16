import { key } from "./data.key";
import { Item } from "./index";

export async function getPlaylistVideos(playlistId: string): Promise<Item[]> {
    const base = `https://www.googleapis.com/youtube/v3/playlistItems`;
    const params = {
        key,
        playlistId,
        part: "contentDetails, snippet",
        maxResults: 50,
    };
    const res = await fetch(`${base}?${formatParams(params)}`);
    const json = await res.json();

    return json.items.map((i: any) => ({
        title: i.snippet.title,
        videoId: i.snippet.resourceId.videoId,
        channelId: i.snippet.channelId,
        channelName: i.snippet.channelTitle,
    }));
}

const formatParams = (obj: any) => {
    return Object.keys(obj)
        .filter((key) => typeof obj[key] !== "undefined")
        .map((key) => `${key}=${obj[key]}`)
        .join("&");
};
