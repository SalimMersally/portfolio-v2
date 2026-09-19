import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPublishedPost } from './_shared/sanity.mjs';
import { renderCardPng, renderCardSvg, socialRevision } from './_shared/social-card.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const templatePath = resolve(here, '_shared/social-card-template.svg');
const fontPaths = [
  resolve(root, 'public/fonts/IBMPlexMono-Bold.ttf'),
  resolve(root, 'public/fonts/InterVariable.ttf'),
];
const fallbackPath = resolve(root, 'public/og/fallback.png');
const footer = 'SALIM AL MERSALLY · LEBANON';

const defaultDependencies = {
  getPost: getPublishedPost,
  makePng: async (post) => {
    const template = await readFile(templatePath, 'utf8');
    const svg = renderCardSvg(template, {
      label: post.seriesTitle || post.tags?.[0] || 'BLOG',
      title: post.title,
      footer,
    });
    return renderCardPng(svg, fontPaths);
  },
  getFallbackPng: () => readFile(fallbackPath),
};

function pngResponse(body, cacheControl) {
  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': cacheControl,
    },
  });
}

export function createOgImageHandler({ getPost, makePng, getFallbackPng }) {
  return async function handleOgImage(request) {
    const match = new URL(request.url).pathname.match(/^\/api\/og\/blog\/([^/]+)\/([^/]+)\.png$/);
    if (!match) return new Response('Not found', { status: 404 });

    const slug = decodeURIComponent(match[1]);
    const revision = match[2];
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[A-Za-z0-9-]+$/.test(revision)) {
      return new Response('Not found', { status: 404 });
    }

    try {
      const post = await getPost(slug);
      if (!post) {
        return pngResponse(await getFallbackPng(), 'public, max-age=300');
      }

      const currentRevision = socialRevision(post._updatedAt);
      if (revision !== currentRevision) {
        const location = `/api/og/blog/${encodeURIComponent(slug)}/${currentRevision}.png`;
        return new Response(null, { status: 302, headers: { Location: location } });
      }

      return pngResponse(await makePng(post), 'public, max-age=31536000, immutable');
    } catch {
      return pngResponse(await getFallbackPng(), 'no-store');
    }
  };
}

export default createOgImageHandler(defaultDependencies);

export const config = { path: '/api/og/blog/:slug/:revision.png' };
