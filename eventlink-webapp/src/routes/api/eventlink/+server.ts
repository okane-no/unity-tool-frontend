import type { RequestHandler } from '@sveltejs/kit';
import { API_BASE_EVENTLINK, API_KEY_EVENTLINK } from '$env/static/private';

const ROUTES: Record<string, { method: 'GET'|'POST'|'PATCH'|'PUT'|'DELETE'; backend: string }> = {
  'calendar':      { method: 'GET', backend: '/calendar' },
  'event.details': { method: 'GET', backend: '/event/details' },
  'verify':        { method: 'GET', backend: '/verify' },
};

async function forward(request: Request, url: URL): Promise<Response> {
  const op = url.searchParams.get('op');
  if (!op) return new Response('Missing ?op=', { status: 400 });
  const conf = ROUTES[op];
  if (!conf) return new Response('Not found', { status: 404 });
  if (request.method !== conf.method) return new Response('Method Not Allowed', { status: 405 });

  const sp = new URLSearchParams(url.searchParams);
  sp.delete('op'); 
  const qs = sp.toString();
  const target = `${API_BASE_EVENTLINK}${conf.backend}${qs ? `?${qs}` : ''}`;

  const headers = new Headers();
  headers.set('X-Api-Key', API_KEY_EVENTLINK);
  const cookiesHdr = request.headers.get('x-eventlink-cookies');
  if (cookiesHdr) headers.set('x-eventlink-cookies', cookiesHdr);
  const ct = request.headers.get('content-type');
  if (ct) headers.set('content-type', ct);

  const resp = await fetch(target, { method: conf.method, headers });
  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { 'content-type': resp.headers.get('content-type') ?? 'application/json' }
  });
}

export const GET: RequestHandler = ({ request, url }) => forward(request, url);
export const POST: RequestHandler = ({ request, url }) => forward(request, url);
export const PATCH: RequestHandler = ({ request, url }) => forward(request, url);
export const PUT: RequestHandler = ({ request, url }) => forward(request, url);
export const DELETE: RequestHandler = ({ request, url }) => forward(request, url);