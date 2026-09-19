import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCardPng, renderCardSvg } from '../netlify/functions/_shared/social-card.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const template = await readFile(
  resolve(root, 'netlify/functions/_shared/social-card-template.svg'),
  'utf8',
);
const fonts = [
  resolve(root, 'public/fonts/IBMPlexMono-Bold.ttf'),
  resolve(root, 'public/fonts/InterVariable.ttf'),
];
const outputDirectory = resolve(root, 'public/og');
const footer = 'SALIM AL MERSALLY · LEBANON';
const cards = [
  ['home.png', 'HOME', 'Websites, apps & reliable software.'],
  ['work.png', 'WORK', 'Experience, projects & technical craft.'],
  ['blog.png', 'BLOG', 'Notes on building reliable software.'],
  ['fallback.png', 'BUILT BY SALIM', 'Websites, apps & reliable software.'],
];

await mkdir(outputDirectory, { recursive: true });
for (const [file, label, title] of cards) {
  const svg = renderCardSvg(template, { label, title, footer });
  await writeFile(resolve(outputDirectory, file), renderCardPng(svg, fonts));
}
