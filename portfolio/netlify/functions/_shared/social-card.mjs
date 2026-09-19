import { Resvg } from '@resvg/resvg-js';

export function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function wrapTitle(value, maxChars = 24, maxLines = 3) {
  const words = String(value).trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
  const chunks = words.flatMap((word) => {
    if (word.length <= maxChars) return [word];
    const parts = [];
    for (let index = 0; index < word.length; index += maxChars) {
      parts.push(word.slice(index, index + maxChars));
    }
    return parts;
  });
  const lines = [];
  let current = '';
  let omitted = false;

  for (const chunk of chunks) {
    const next = current ? `${current} ${chunk}` : chunk;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = chunk;
    if (lines.length === maxLines) {
      omitted = true;
      break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length < chunks.length && lines.length === maxLines) omitted = true;

  if (omitted && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, maxChars - 1).trimEnd()}…`;
  }
  return lines.slice(0, maxLines);
}

export function socialRevision(updatedAt) {
  return String(updatedAt).replace(/[:.]/g, '-');
}

export function renderCardSvg(template, input) {
  const lines = wrapTitle(input.title);
  const titleLines = lines
    .map((line, index) => `<tspan x="76" dy="${index === 0 ? 0 : 70}">${escapeXml(line)}</tspan>`)
    .join('');
  return template
    .replace('{{LABEL}}', escapeXml(input.label.trim().replace(/\s+/g, ' ').toUpperCase()))
    .replace('{{TITLE_LINES}}', titleLines)
    .replace('{{FOOTER}}', escapeXml(input.footer.trim().replace(/\s+/g, ' ')));
}

export function renderCardPng(svg, fontPaths = []) {
  const rendered = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { fontFiles: fontPaths, loadSystemFonts: false },
  }).render();
  return rendered.asPng();
}
