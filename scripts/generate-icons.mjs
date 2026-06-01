import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const svg = readFileSync("public/icons/icon.svg", "utf-8");

const sizes = [128, 48, 16];

for (const size of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "transparent",
  });

  const png = resvg.render().asPng();
  writeFileSync(`public/icons/icon${size}.png`, png);
  console.log(`Generated icon${size}.png (${size}x${size})`);
}
