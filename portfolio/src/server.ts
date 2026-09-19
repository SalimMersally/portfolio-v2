import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const result = await angularAppEngine.handle(request);

  return result ?? new Response('Not found', { status: 404 });
}

/**
 * Request handler used by the Angular CLI during development and builds.
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
