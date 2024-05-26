import { V2 } from "./vec";

type Props<T> = {
    id?: string;
    className?: string;
    classMap?: { [key: string]: boolean };
    style?: {};
    children?: (DocumentFragment | HTMLElement | string | undefined | false)[];
    ref?: (elem: T) => void;
    onClick?: (this: HTMLElement, mouse: MouseEvent) => void;
    onMouseDown?: (this: HTMLElement, mouse: MouseEvent) => void;
    // onInput?: (this: HTMLElement, ev: Event & { currentTarget: HTMLElement }) => void;
};

type InputProps<T> = Props<T> & {
    onInput?: (this: T) => void;
    from?: number;
    to?: number;
    step?: number;
    type?: string;
    value?: string;
};

export const input = (props: InputProps<HTMLInputElement>) => {
    const res = assignHtmlElementProps(document.createElement("input"), props);
    if (props.type) res.type = props.type;
    if (props.value) res.value = props.value;
    if (props.onInput) res.addEventListener("input", props.onInput);
    return res;
};

export const div = (props: Props<HTMLDivElement>) =>
    assignHtmlElementProps(document.createElement("div"), props);

export const ol = (props: Props<HTMLOListElement>) =>
    assignHtmlElementProps(document.createElement("ol"), props);

export const li = (props: Props<HTMLLIElement>) =>
    assignHtmlElementProps(document.createElement("li"), props);

export const span = (props: Props<HTMLSpanElement>) =>
    assignHtmlElementProps(document.createElement("span"), props);

export const img = (props: Props<HTMLImageElement> & { src?: string }) => {
    const res = assignHtmlElementProps(document.createElement("img"), props);

    if (props.src) res.src = props.src;
    return res;
};

export const fragment = (...children: (HTMLElement | undefined)[]) => {
    const res = document.createDocumentFragment();

    for (const child of children) if (child) res.appendChild(child);

    //ugly typecast, but I'm adding this as children to nodes, which might be wrong
    return res as unknown as HTMLElement;
};

function assignHtmlElementProps<T extends HTMLElement>(
    elem: T,
    props: Props<T>
): T {
    if (props.id) elem.id = props.id;

    if (props.className) elem.className = props.className;

    if (props.style) Object.assign(elem.style, props.style);

    if (props.classMap) {
        for (const classKey in props.classMap) {
            if (props.classMap[classKey]) elem.classList.add(classKey);
        }
    }

    if (props.children) {
        for (const child of props.children) {
            if (child) elem.append(child);
        }
    }

    if (props.onClick) elem.addEventListener("click", props.onClick);
    if (props.onMouseDown)
        elem.addEventListener("mousedown", props.onMouseDown);

    if (props.ref) props.ref(elem);

    return elem;
}

export const insertAfter = (elem: HTMLElement, elemToInsert: HTMLElement) => {
    elem.insertAdjacentElement("afterend", elemToInsert);
};

export function setElemPosition(elem: HTMLElement, pos: V2) {
    Object.assign(elem.style, {
        left: pos.x + "px",
        top: pos.y + "px",
    });
}

export function setElemSize(elem: HTMLElement, size: V2) {
    Object.assign(elem.style, {
        width: size.x + "px",
        height: size.y + "px",
    });
}

export function findParentOrCurrent(
    elem: HTMLElement,
    predicate: (elem: HTMLElement) => boolean
): HTMLElement | undefined {
    while (elem.parentElement) {
        if (predicate(elem)) return elem;

        elem = elem.parentElement;
    }

    return undefined;
}
