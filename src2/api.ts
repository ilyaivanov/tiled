import { key } from "../src/data.key";
import { PanelItem } from "./panel";

export type ChannelInfo = {
    title: string;
    id: string;
    handle: string;
    allVideosPlaylistId: string;
    image: string;
};

export async function getChannelInfo(idOrHandle: string): Promise<ChannelInfo> {
    const base = `https://www.googleapis.com/youtube/v3/channels`;
    const params: any = {
        key,
        part: "contentDetails,snippet",
        maxResults: 25,
    };
    if (idOrHandle.startsWith("@")) params.forHandle = idOrHandle;
    else params.id = idOrHandle;

    const res = await fetch(`${base}?${formatParams(params)}`);
    const json = await res.json();

    const resItem = json.items[0];

    if (!resItem) throw new Error();

    return {
        title: resItem.snippet.title,
        id: resItem.id,
        handle: resItem.snippet.customUrl,
        image: resItem.snippet.thumbnails.medium.url,
        allVideosPlaylistId: resItem.contentDetails.relatedPlaylists.uploads,
    };
}

export async function getPlaylistVideos(
    playlistId: string
): Promise<PanelItem[]> {
    const base = `https://www.googleapis.com/youtube/v3/playlistItems`;
    const params = {
        key,
        playlistId,
        part: "contentDetails, snippet",
        maxResults: 50,
    };
    const response = await fetch(`${base}?${formatParams(params)}`);
    const json = await response.json();

    const res: PanelItem[] = json.items.map((i: any) => ({
        title: i.snippet.title,
        itemId: i.snippet.resourceId.videoId,
        type: "video",
    }));

    return res;
}
export async function getChannelPlaylists(
    channelId: string
): Promise<PanelItem[]> {
    const base = `https://www.googleapis.com/youtube/v3/playlists`;
    const params = {
        key,
        channelId,
        part: "contentDetails, snippet",
        maxResults: 50,
    };
    const response = await fetch(`${base}?${formatParams(params)}`);
    const json = await response.json();

    const res = json.items.map((i: any) => {
        const panelItem: PanelItem = {
            title: i.snippet.localized.title,
            itemImage: i.snippet.thumbnails.medium.url,
            itemId: i.id,
            type: "playlist",
        };
        return panelItem;
    });

    return res;
}

const formatParams = (obj: any) => {
    return Object.keys(obj)
        .filter((key) => typeof obj[key] !== "undefined")
        .map((key) => `${key}=${obj[key]}`)
        .join("&");
};
