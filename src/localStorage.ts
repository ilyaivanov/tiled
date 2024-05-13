import type { Panel } from "./index";
import { V2 } from "./ui/vec";

function replacer(key: string, value: any) {
    if (key == "el") return undefined;
    return value;
}

export function savePanelState(panels: Panel[], boardName: string) {
    localStorage.setItem(boardName + " - BOARD", JSON.stringify(panels, replacer));
}

export function loadPanelStateForBoard(boardName: string): Panel[] | undefined {
    const res = localStorage.getItem(boardName + " - BOARD");
    if (res) return JSON.parse(res);
    return undefined;
}

export function setSelectedBoard(boardName: string) {
    localStorage.setItem("SELECTED_BOARD", boardName);
}

export function getSelectedBoard(): string | undefined {
    return localStorage.getItem("SELECTED_BOARD") || undefined;
}

//yes, serialize boolean into "0" or "1" string, you can kill me later
export function setIsDark(isDark: boolean) {
    localStorage.setItem("IS_DARK", isDark ? "1" : "0");
}

export function getIsDark(): boolean | undefined {
    const isDark = localStorage.getItem("IS_DARK");
    if (typeof isDark != "string") return undefined;
    else return isDark == "1";
}

export function saveOffset(shift: V2, boardName: string) {
    localStorage.setItem(boardName + " - OFFSET", JSON.stringify(shift));
}

export function getOffset(boardName: string): V2 | undefined {
    const saved = localStorage.getItem(boardName + " - OFFSET");
    if (saved) return JSON.parse(saved);
    return undefined;
}
