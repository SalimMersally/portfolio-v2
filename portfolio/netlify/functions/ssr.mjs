const loadAngularServer = () => import('../../dist/portfolio-v2/server/server.mjs');

export function createSsrHandler(loadRenderer = loadAngularServer) {
  return async function handleSsr(request) {
    const { netlifyAppEngineHandler } = await loadRenderer();
    return netlifyAppEngineHandler(request);
  };
}

export default createSsrHandler();

export const config = {
  path: '/*',
  excludedPath: ['/sitemap.xml', '/api/og/*'],
  preferStatic: true,
  includedFiles: ['../../dist/portfolio-v2/server/**'],
};
