import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  escapeXml,
  renderCardPng,
  renderCardSvg,
  socialRevision,
  wrapTitle,
} from '../../netlify/functions/_shared/social-card.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const templatePath = resolve(here, '../../netlify/functions/_shared/social-card-template.svg');
const fonts = [
  resolve(here, '../../public/fonts/IBMPlexMono-Bold.ttf'),
  resolve(here, '../../public/fonts/InterVariable.ttf'),
];

describe('social card renderer', () => {
  it('escapes XML and normalizes title whitespace', () => {
    expect(escapeXml('A & <B> "C"')).toBe('A &amp; &lt;B&gt; &quot;C&quot;');
    expect(wrapTitle('  A   reliable   title  ')).toEqual(['A reliable title']);
  });

  it('wraps to three lines and ellipsizes omitted text', () => {
    const lines = wrapTitle('one two three four five six seven eight nine ten', 10, 3);
    expect(lines).toHaveLength(3);
    expect(lines[2]).toMatch(/…$/);
  });

  it('formats revisions consistently', () => {
    expect(socialRevision('2026-09-17T10:20:30.456Z')).toBe('2026-09-17T10-20-30-456Z');
  });

  it('fills every SVG token and renders a 1200 by 630 PNG', async () => {
    const template = await readFile(templatePath, 'utf8');
    const svg = renderCardSvg(template, {
      label: 'Testing',
      title: 'Authentication & reliable systems',
      footer: 'SALIM AL MERSALLY · LEBANON',
    });
    expect(svg).not.toContain('{{');

    const png = Buffer.from(renderCardPng(svg, fonts));
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
