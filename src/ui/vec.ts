export type Point = { x: number; y: number };

export function normalize(p: Point) {
    const length = Math.sqrt(p.x * p.x + p.y * p.y);
    if (length == 0) return { x: 0, y: 0 };

    return { x: p.x / length, y: p.y / length };
}

export function distance(p1: Point, p2: Point) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function length(p: Point): number {
    return Math.sqrt(p.x * p.x + p.y * p.y);
}

export function diff(p1: Point, p2: Point) {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
}

export function add(p1: Point, p2: Point) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

export function mult(p1: Point, scale: number) {
    return { x: p1.x * scale, y: p1.y * scale };
}

export function div(p1: Point, scale: number) {
    return { x: p1.x / scale, y: p1.y / scale };
}

export function vec(x: number, y: number) {
    return { x, y };
}

export function randomUnitVector() {
    const angle = Math.random() * 2 * Math.PI;

    return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function moveVecInRandomDirectionBy(v: Point, by: number) {
    return add(v, mult(randomUnitVector(), by));
}

export function setMag(p: Point, mag: number): Point {
    const { x, y } = normalize(p);
    return { x: x * mag, y: y * mag };
}

export function clampMag(p: Point, mag: number): Point {
    if (length(p) > mag) return setMag(p, mag);
    return p;
}

export function clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
}
