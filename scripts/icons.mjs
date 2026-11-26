// Genera le icone PNG della PWA da public/icon.svg (npm run icons). Richiede sharp (già presente con Next).
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync('public/icon.svg');
const bleed = Buffer.from(svg.toString().replaceAll('rx="228"', 'rx="0"')); // senza angoli: iOS e maskable li ritagliano da soli
const out = (buf, size, name, pad = 0) =>
  sharp(buf, { density: 72 }).resize(size - pad * 2, size - pad * 2).extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#0A1230' }).png().toFile('public/' + name);

await out(svg, 192, 'icon-192.png');
await out(svg, 512, 'icon-512.png');
await out(bleed, 512, 'icon-maskable-512.png', 0);
await out(bleed, 180, 'apple-touch-icon.png');
console.log('icone ok');
