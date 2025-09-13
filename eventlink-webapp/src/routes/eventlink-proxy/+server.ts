// src/routes/eventlink-proxy/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const ROUTES: Record<string, { method: 'GET'|'POST'|'PATCH'|'PUT'|'DELETE'; backend: string }> = {
  'calendar':      { method: 'GET',  backend: '/calendar' },
  'event.details': { method: 'GET',  backend: '/event/details' },
  'verify':        { method: 'GET',  backend: '/verify' }
};

function traceId() {
  return Math.random().toString(36).slice(2, 10);
}


async function forward(request: Request, url: URL): Promise<Response> {
  const apiBase = "https://unity-tool-scraper.unity-tool-prod.svc.cluster.local:80"
  const apiKey = (env.API_KEY_EVENTLINK ?? '').trim();
  if (!apiKey) {
    console.error('[eventlink-proxy] WARNING: API_KEY_EVENTLINK is empty');
  }

  const op = url.searchParams.get('op');
  if (!op) return new Response('Missing ?op=', { status: 400 });

  const conf = ROUTES[op];
  if (!conf) return new Response('Not found', { status: 404 });

  if (request.method !== conf.method) {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Build path + query (without op)
  const search = new URLSearchParams(url.searchParams);
  search.delete('op');
  const qs = search.toString();
  const path = conf.backend + (qs ? `?${qs}` : '');
  const target = new URL(path, apiBase).toString();

  // Server-side headers (never log the API key)
  const headers = new Headers();
  headers.set('X-Api-Key', apiKey);

  const auth = request.headers.get('authorization');
  if (auth) headers.set('authorization', auth);

  // Pass through this custom header if you use it for upstream cookie jar
  const cookiesHdr = request.headers.get('x-eventlink-cookies');
  if (cookiesHdr) headers.set('x-eventlink-cookies', cookiesHdr);

  const hasBody = conf.method !== 'GET';
  if (hasBody) {
    headers.set('content-type', request.headers.get('content-type') ?? 'application/json');
  }

  const t = traceId();
  const t0 = Date.now();
  console.error(`[eventlink-proxy] start op=${op} method=${conf.method} target-url=${target} trace=${t}`);

  try {
    const resp = await fetch(target, {
      method: conf.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      redirect: 'manual',
      cache: 'no-store'
    });

    const ms = Date.now() - t0;
    console.error(`[eventlink-proxy] done  op=${op} status=${resp.status} ms=${ms} trace=${t}`);

    const text = await resp.text();
    const out = new Response(text, {
      status: resp.status,
      headers: {
        'content-type': resp.headers.get('content-type') ?? 'application/json'
      }
    });

    // Helpful debug breadcrumbs visible in the browser
    out.headers.set('X-Proxy', 'sveltekit');
    out.headers.set('X-Proxy-Trace', t);
    out.headers.set('X-Proxy-Op', op);
    out.headers.set('X-Proxy-Duration', String(ms));
    out.headers.set('Cache-Control', 'no-store');

    return out;
  } catch (err: unknown) {
    const ms = Date.now() - t0;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[eventlink-proxy] error op=${op} ms=${ms} trace=${t} err=${msg} target-url=${target}`);
    return new Response(JSON.stringify({ error: 'Upstream fetch failed', trace: t, message: msg }), {
      status: 502,
      headers: {
        'content-type': 'application/json',
        'X-Proxy': 'sveltekit',
        'X-Proxy-Trace': t,
        'X-Proxy-Duration': String(ms)
      }
    });
  }
}

export const GET: RequestHandler    = ({ request, url }) => forward(request, url);
export const POST: RequestHandler   = ({ request, url }) => forward(request, url);
export const PATCH: RequestHandler  = ({ request, url }) => forward(request, url);
export const PUT: RequestHandler    = ({ request, url }) => forward(request, url);
export const DELETE: RequestHandler = ({ request, url }) => forward(request, url);