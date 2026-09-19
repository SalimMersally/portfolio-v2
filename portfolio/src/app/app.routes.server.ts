import { RenderMode, ServerRoute } from '@angular/ssr';

const documentHeaders = { 'Cache-Control': 'no-cache' };

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
    headers: documentHeaders,
  },
  {
    path: 'work',
    renderMode: RenderMode.Server,
    headers: documentHeaders,
  },
  {
    path: 'blog',
    renderMode: RenderMode.Server,
    headers: documentHeaders,
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Server,
    headers: documentHeaders,
  },
  {
    path: 'error',
    renderMode: RenderMode.Server,
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  },
];
