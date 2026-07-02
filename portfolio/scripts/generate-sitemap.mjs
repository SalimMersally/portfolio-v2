import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = createClient({
  projectId: '46kdlm0d',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const posts = await client.fetch(
  `*[_type == "post" && defined(slug.current)] { "slug": slug.current, publishedAt }`,
);

const BASE = 'https://salimalmersally.com';
const today = new Date().toISOString().split('T')[0];

const urls = [
  `<url><loc>${BASE}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`,
  `<url><loc>${BASE}/blog</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
  ...posts.map(({ slug, publishedAt }) => {
    const lastmod = publishedAt ? publishedAt.split('T')[0] : today;
    return `<url><loc>${BASE}/blog/${slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
  }),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n  ')}
</urlset>
`;

writeFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), xml);
console.log(`✔  sitemap.xml — ${posts.length} blog post(s) added`);
