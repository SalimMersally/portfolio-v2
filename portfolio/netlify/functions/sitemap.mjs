import { getPublishedPosts } from './_shared/sanity.mjs';

const siteUrl = 'https://salimalmersally.com';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(path, lastmod) {
  const modified = lastmod ? `<lastmod>${escapeXml(lastmod.slice(0, 10))}</lastmod>` : '';
  return `<url><loc>${escapeXml(`${siteUrl}${path}`)}</loc>${modified}</url>`;
}

export function createSitemapHandler({ getPosts }) {
  return async function handleSitemap() {
    try {
      const posts = await getPosts();
      const urls = [urlEntry('/'), urlEntry('/work'), urlEntry('/blog')];
      for (const post of posts) {
        if (!post?.slug || !post?._updatedAt) continue;
        urls.push(urlEntry(`/blog/${encodeURIComponent(post.slug)}`, post._updatedAt));
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
    } catch {
      return new Response('Sitemap temporarily unavailable', {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
  };
}

export default createSitemapHandler({ getPosts: getPublishedPosts });

export const config = { path: '/sitemap.xml' };
