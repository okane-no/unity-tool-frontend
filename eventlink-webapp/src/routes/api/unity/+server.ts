import type { RequestHandler } from '@sveltejs/kit';
import { API_BASE_UNITY, API_KEY_UNITY } from '$env/static/private';

const ROUTES: Record<string, { method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; backend: string }> = {
  'organizer.profile': { method: 'GET',  backend: '/api/unity/organizer/profile' },
  'events.all':        { method: 'GET',  backend: '/api/unity/events' },
  'events.me':         { method: 'GET',  backend: '/api/unity/events/me' },
  'events.needing':    { method: 'GET',  backend: '/api/unity/events-needing-results' },
  'events.create':     { method: 'POST', backend: '/api/unity/create-event' },
  'results.upload':    { method: 'PATCH',backend: '/api/unity/upload-results' },
  'oauth.exchange': { method: 'POST', backend: '/api/unity-oauth/exchange-code' },
  'oauth.verify':   { method: 'POST', backend: '/api/unity-oauth/verify' },
};

async function forward(request: Request, url: URL): Promise<Response> {
  console.log('using the proxy')
  console.log("This is the API_KEY_UNITY", API_KEY_UNITY, 'this is base', API_BASE_UNITY)
  const op = url.searchParams.get('op');
  if (!op) return new Response('Missing ?op=', { status: 400 });

  const conf = ROUTES[op];
  if (!conf) return new Response('Not found', { status: 404 });

  if (request.method !== conf.method) return new Response('Method Not Allowed', { status: 405 });

  const search = new URLSearchParams(url.searchParams);
  search.delete('op');
  const qs = search.toString();
  const path = conf.backend + (qs ? `?${qs}` : '');
   console.log("This is the API_KEY_UNITY", API_KEY_UNITY)
  const headers = new Headers({ 'X-Api-Key': API_KEY_UNITY });
  const auth = request.headers.get('authorization');
  if (auth) headers.set('authorization', auth);

  const hasBody = conf.method !== 'GET';
  if (hasBody) headers.set('content-type', request.headers.get('content-type') ?? 'application/json');

  const resp = await fetch(`${API_BASE_UNITY}${path}`, {
    method: conf.method,
    headers,
    body: hasBody ? await request.text() : undefined
  });

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