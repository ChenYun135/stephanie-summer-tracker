import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'public', 'icon.svg');
const outDir = path.join(root, 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svg = await readFile(svgPath);

await mkdir(outDir, { recursive: true });

for (const size of sizes) {
  const outPath = path.join(outDir, `icon-${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(outPath);
  console.log(`Generated ${outPath}`);
}

const maskablePath = path.join(outDir, 'icon-maskable-512.png');
await sharp(svg)
  .resize(512, 512)
  .extend({
    top: 64,
    bottom: 64,
    left: 64,
    right: 64,
    background: { r: 59, g: 130, b: 246, alpha: 1 },
  })
  .resize(512, 512)
  .png()
  .toFile(maskablePath);

console.log(`Generated ${maskablePath}`);
