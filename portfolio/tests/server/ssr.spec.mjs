import { describe, expect, it } from 'vitest';

describe('SSR function', () => {
  it('uses Node SSR without intercepting static files or dedicated functions', async () => {
    let ssrModule;
    try {
      ssrModule = await import('../../netlify/functions/ssr.mjs');
    } catch {
      ssrModule = undefined;
    }

    expect(ssrModule).toBeDefined();
    expect(ssrModule.config).toMatchObject({
      path: '/*',
      excludedPath: ['/sitemap.xml', '/api/og/*'],
      preferStatic: true,
      includedFiles: ['../../dist/portfolio-v2/server/**'],
    });
  });

  it('returns the response produced by the compiled Angular handler', async () => {
    let ssrModule;
    try {
      ssrModule = await import('../../netlify/functions/ssr.mjs');
    } catch {
      ssrModule = undefined;
    }
    expect(ssrModule).toBeDefined();

    const { createSsrHandler } = ssrModule;
    const expected = new Response('<html>rendered</html>', {
      headers: { 'Content-Type': 'text/html' },
    });
    const request = new Request('https://salimalmersally.com/blog/example');
    const handler = createSsrHandler(async () => ({
      netlifyAppEngineHandler: async (receivedRequest) => {
        expect(receivedRequest).toBe(request);
        return expected;
      },
    }));

    expect(await handler(request)).toBe(expected);
  });
});
