function svgWithPath(className: string, viewBox: string, pathS: string) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox);

    svg.classList.add(className);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathS);
    svg.appendChild(path);
    return svg;
}

const chevronPath =
    "M244.7 116.7c6.2-6.2 16.4-6.2 22.6 0l192 192c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L256 150.6 75.3 331.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l192-192z";
const chevronSvg = svgWithPath("chevron", "0 0 512 512", chevronPath);
export const chevronIcon = () => chevronSvg.cloneNode(true) as HTMLElement;

//
//
//

const playSvg = svgWithPath("item-icon", "0 0 384 512", "M384 256L0 32V480L384 256z");
export const playIcon = () => playSvg.cloneNode(true) as HTMLElement;

const pauseSvg = svgWithPath(
    "item-icon",
    "0 0 320 512",
    "M128 64H0V448H128V64zm192 0H192V448H320V64z"
);
export const pauseIcon = () => pauseSvg.cloneNode(true) as HTMLElement;

const profileSvg = svgWithPath(
    "item-icon",
    "0 0 448 512",
    "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
);
export const profileIcon = () => profileSvg.cloneNode(true) as HTMLElement;

const playlistSvg = svgWithPath(
    "item-icon",
    "0 0 320 512",
    "M64 288h96c53 0 96-43 96-96s-43-96-96-96H64V288zM0 352V320 288 96 64 32H32 64h96c88.4 0 160 71.6 160 160s-71.6 160-160 160H64v96 32H0V448 352z"
);
export const playlistIcon = () => playlistSvg.cloneNode(true) as HTMLElement;

// ▲›✓⏸

const sunSvg = svgWithPath(
    "sun-icon",
    "0 0 512 512",
    "M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"
);
export const sunIcon = () => sunSvg.cloneNode(true) as HTMLElement;

const moonSvg = svgWithPath(
    "moon-icon",
    "0 0 384 512",
    "M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"
);
export const moonIcon = () => moonSvg.cloneNode(true) as HTMLElement;
