import { describe, expect, it, vi } from 'vitest';
import { createOgImageHandler } from '../../netlify/functions/og-image.mjs';

const post = {
  title: 'Authentication that lasts',
  tags: ['Authentication'],
  _updatedAt: '2026-09-17T10:20:30.456Z',
};
const png = Uint8Array.from([137, 80, 78, 71]);

function handler(overrides = {}) {
  return createOgImageHandler({
    getPost: vi.fn().mockResolvedValue(post),
    makePng: vi.fn().mockResolvedValue(png),
    getFallbackPng: vi.fn().mockResolvedValue(png),
    ...overrides,
  });
}

describe('OG image endpoint', () => {
  it('returns 404 for malformed paths', async () => {
    const response = await handler()(new Request('https://example.com/api/og/nope.png'));
    expect(response.status).toBe(404);
  });

  it('returns a short-lived fallback for unknown posts', async () => {
    const response = await handler({ getPost: vi.fn().mockResolvedValue(null) })(
      new Request('https://example.com/api/og/blog/unknown/revision.png'),
    );
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe('public, max-age=300');
  });

  it('returns a no-store fallback when Sanity fails', async () => {
    const response = await handler({ getPost: vi.fn().mockRejectedValue(new Error('secret')) })(
      new Request('https://example.com/api/og/blog/article/revision.png'),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).not.toContain('secret');
  });

  it('redirects stale revisions to the current immutable URL', async () => {
    const response = await handler()(
      new Request('https://example.com/api/og/blog/article/stale.png'),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(
      '/api/og/blog/article/2026-09-17T10-20-30-456Z.png',
    );
  });

  it('returns an immutable PNG for the current revision', async () => {
    const response = await handler()(
      new Request('https://example.com/api/og/blog/article/2026-09-17T10-20-30-456Z.png'),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
  });
});
