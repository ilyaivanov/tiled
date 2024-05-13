export type V2 = { x: number; y: number };

export function normalize(p: V2) {
    const length = Math.sqrt(p.x * p.x + p.y * p.y);
    if (length == 0) return { x: 0, y: 0 };

    return { x: p.x / length, y: p.y / length };
}

export function distance(p1: V2, p2: V2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function length(p: V2): number {
    return Math.sqrt(p.x * p.x + p.y * p.y);
}

export function diff(p1: V2, p2: V2) {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
}

export function add(p1: V2, p2: V2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

export function addScalar(p1: V2, v: number) {
    return { x: p1.x + v, y: p1.y + v };
}

export function addAll(...ps: V2[]) {
    return ps.reduce(
        (ac, p) => {
            ac.x += p.x;
            ac.y += p.y;
            return ac;
        },
        { x: 0, y: 0 }
    );
}

export function roundV2(v: V2) {
    return { x: Math.round(v.x), y: Math.round(v.y) };
}

export function mult(p1: V2, scale: number) {
    return { x: p1.x * scale, y: p1.y * scale };
}

export function divide(p1: V2, scale: number) {
    return { x: p1.x / scale, y: p1.y / scale };
}

export function vec(x: number, y: number) {
    return { x, y };
}

export function randomUnitVector() {
    const angle = Math.random() * 2 * Math.PI;

    return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function moveVecInRandomDirectionBy(v: V2, by: number) {
    return add(v, mult(randomUnitVector(), by));
}

export function setMag(p: V2, mag: number): V2 {
    const { x, y } = normalize(p);
    return { x: x * mag, y: y * mag };
}

export function clampMag(p: V2, mag: number): V2 {
    if (length(p) > mag) return setMag(p, mag);
    return p;
}

export function clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
}

export function lerp(from: number, to: number, t: number) {
    return from * (1 - t) + to * t;
}
