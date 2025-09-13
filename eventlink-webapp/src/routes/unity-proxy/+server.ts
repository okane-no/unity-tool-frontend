
import type { RequestHandler } from '@sveltejs/kit';
import { API_BASE_UNITY, API_KEY_UNITY } from '$env/static/private';

const ROUTES: Record<string, { method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; backend: string }> = {
  'organizer.profile': { method: 'GET',  backend: '/api/unity/organizer/profile' },
  'events.all':        { method: 'GET',  backend: '/api/unity/events' },
  'events.me':         { method: 'GET',  backend: '/api/unity/events/me' },
  'events.needing':    { method: 'GET',  backend: '/api/unity/events-needing-results' },
  'events.create':     { method: 'POST', backend: '/api/unity/create-event' },
  'results.upload':    { method: 'PATCH',backend: '/api/unity/upload-results' },
  'oauth.exchange':    { method: 'POST', backend: '/api/unity-oauth/exchange-code' },
  'oauth.verify':      { method: 'POST', backend: '/api/unity-oauth/verify' }
};

function traceId() {
  return Math.random().toString(36).slice(2, 8);
}

async function forward(request: Request, url: URL): Promise<Response> {
  const basetest="http://unity-tool-backend.unity-tool-prod.svc.cluster.local:80";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sds = API_BASE_UNITY;
  const op = url.searchParams.get('op');
  if (!op) return new Response('Missing ?op=', { status: 400 });

  const conf = ROUTES[op];
  if (!conf) return new Response('Not found', { status: 404 });

  if (request.method !== conf.method) return new Response('Method Not Allowed', { status: 405 });

  // build path + query (without op)
  const search = new URLSearchParams(url.searchParams);
  search.delete('op');
  const qs = search.toString();
  const path = conf.backend + (qs ? `?${qs}` : '');

  // server-side headers (NEVER log API_KEY_UNITY)
  const headers = new Headers({ 'X-Api-Key': API_KEY_UNITY });
  const auth = request.headers.get('authorization');
  if (auth) headers.set('authorization', auth);
  const hasBody = conf.method !== 'GET';
  if (hasBody) headers.set('content-type', request.headers.get('content-type') ?? 'application/json');

  const target = `${basetest}${path}`;
  const t = traceId();
  const t0 = Date.now();

  // Use stderr so logs show up in k8s by default
  console.error(`[unity-proxy] start op=${op} method=${conf.method} target=${path} trace=${t}`);

  try {
    const resp = await fetch(target, {
      method: conf.method,
      headers,
      body: hasBody ? await request.text() : undefined
    });
    

    const ms = Date.now() - t0;
    console.error(`[unity-proxy] done  op=${op} status=${resp.status} ms=${ms} trace=${t}`);

    const text = await resp.text();
    const out = new Response(text, {
      status: resp.status,
      headers: {
        'content-type': resp.headers.get('content-type') ?? 'application/json'
      }
    });

    // Stamp helpful headers for debugging in the browser
    out.headers.set('X-Proxy-Trace', t);
    out.headers.set('X-Proxy-Op', op);
    out.headers.set('X-Proxy-Duration', `${ms}`);
    out.headers.set('Cache-Control', 'no-store');

    return out;
  } catch (err: unknown) {
    const ms = Date.now() - t0;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[unity-proxy] error op=${op} ms=${ms} trace=${t} err=${msg}`);

    // 502 makes it obvious it's a proxy/backend connectivity issue
    return new Response(JSON.stringify({ error: 'Upstream fetch failed', trace: t, message: msg }), {
      status: 502,
      headers: { 'content-type': 'application/json', 'X-Proxy-Trace': t, 'X-Proxy-Duration': `${ms}` }
    });
  }
}

export const GET: RequestHandler    = ({ request, url }) => forward(request, url);
export const POST: RequestHandler   = ({ request, url }) => forward(request, url);
export const PATCH: RequestHandler  = ({ request, url }) => forward(request, url);
export const PUT: RequestHandler    = ({ request, url }) => forward(request, url);
export const DELETE: RequestHandler = ({ request, url }) => forward(request, url);
