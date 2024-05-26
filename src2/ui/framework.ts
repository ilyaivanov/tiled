type Options = {
    draw: (deltaTime: number) => void;
};

export let lastTime = 0;
let ignoreNextFrame = false;
let draw: (deltaTime: number) => void;

function onTick(time: number) {
    const deltaTime = lastTime == 0 ? 0 : time - lastTime;

    if (ignoreNextFrame) ignoreNextFrame = false;
    else draw(deltaTime);

    lastTime = time;
    requestAnimationFrame(onTick);
}

export function start(options: Options) {
    draw = options.draw;
    requestAnimationFrame(onTick);
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) ignoreNextFrame = true;
});
