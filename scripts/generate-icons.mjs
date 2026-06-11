import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const svg = readFileSync("public/icons/icon.svg", "utf-8");

const pathMatch = svg.match(/<path[^>]*\/>/);
if (!pathMatch) throw new Error("Could not extract path from icon.svg");
const pathElement = pathMatch[0];

const sizes = [128, 48, 16];

for (const size of sizes) {
  let renderSvg = svg;

  if (size === 128) {
    // Chrome Web Store requires 128x128 icon with content at 96x96 + 16px padding.
    // The droplet's bounding box is ~(16,16)-(112,128), center ~(64,72).
    // Scale by 96/112 ≈ 0.857 to fit height within 96px, then center.
    renderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <g transform="translate(9.15, 2.3) scale(0.857)">
    ${pathElement}
  </g>
</svg>`;
  }

  const resvg = new Resvg(renderSvg, {
    fitTo: { mode: "width", value: size },
    background: "transparent",
  });

  const png = resvg.render().asPng();
  writeFileSync(`public/icons/icon${size}.png`, png);
  console.log(`Generated icon${size}.png (${size}x${size})`);
}
