import { describe, expect, it, vi } from 'vitest';
import { createSitemapHandler } from '../../netlify/functions/sitemap.mjs';

describe('sitemap endpoint', () => {
  it('includes static routes and escaped published post URLs', async () => {
    const handler = createSitemapHandler({
      getPosts: vi.fn().mockResolvedValue([
        {
          slug: 'authentication-&-apis',
          publishedAt: '2026-09-17T00:00:00.000Z',
          _updatedAt: '2026-09-18T10:20:30.000Z',
        },
        { slug: '', _updatedAt: '2026-09-18T10:20:30.000Z' },
      ]),
    });

    const response = await handler();
    const xml = await response.text();
    expect(xml).toContain('<loc>https://salimalmersally.com/</loc>');
    expect(xml).toContain('<loc>https://salimalmersally.com/work</loc>');
    expect(xml).toContain('<loc>https://salimalmersally.com/blog</loc>');
    expect(xml).toContain('<loc>https://salimalmersally.com/blog/authentication-%26-apis</loc>');
    expect(xml).toContain('<lastmod>2026-09-18</lastmod>');
    expect(response.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    expect(response.headers.get('cache-control')).toBe(
      'public, s-maxage=300, stale-while-revalidate=60',
    );
  });

  it('returns a non-cacheable 503 when Sanity is unavailable', async () => {
    const handler = createSitemapHandler({
      getPosts: vi.fn().mockRejectedValue(new Error('offline')),
    });

    const response = await handler();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
