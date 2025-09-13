// src/routes/eventlink-proxy/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { API_KEY_EVENTLINK} from '$env/static/private';


const ROUTES: Record<string, { method: 'GET'|'POST'|'PATCH'|'PUT'|'DELETE'; backend: string }> = {
  'calendar':      { method: 'GET',  backend: '/calendar' },
  'event.details': { method: 'GET',  backend: '/event/details' },
  'verify':        { method: 'GET',  backend: '/verify' }
};

function tid() { return Math.random().toString(36).slice(2, 10); }

async function forward(request: Request, url: URL): Promise<Response> {
  const apiBase = "http://unity-tool-scraper.unity-tool-prod.svc.cluster.local:80"
  const apiKey = (API_KEY_EVENTLINK ?? '').trim();
  if (!apiKey) {
    console.error('[eventlink-proxy] WARNING: API_KEY_EVENTLINK is empty');
  }

  const op = url.searchParams.get('op');
  if (!op) return new Response('Missing ?op=', { status: 400 });

  const conf = ROUTES[op];
  if (!conf) return new Response('Not found', { status: 404 });
  if (request.method !== conf.method) return new Response('Method Not Allowed', { status: 405 });

  const search = new URLSearchParams(url.searchParams);
  search.delete('op');
  const qs   = search.toString();
  const path = conf.backend + (qs ? `?${qs}` : '');
  const target = new URL(path, apiBase).toString();

  const headers = new Headers();
  if (apiKey) headers.set('X-Api-Key', apiKey);
  const auth = request.headers.get('authorization'); if (auth) headers.set('authorization', auth);
  const cookiesHdr = request.headers.get('x-eventlink-cookies'); if (cookiesHdr) headers.set('x-eventlink-cookies', cookiesHdr);
  const hasBody = conf.method !== 'GET';
  if (hasBody) headers.set('content-type', request.headers.get('content-type') ?? 'application/json');

  const t = tid(); const t0 = Date.now();
  console.error(`[eventlink-proxy] start op=${op} method=${conf.method} target-url=${target} trace=${t}`);

  try {
    const resp = await fetch(target, {
      method: conf.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: 'no-store',
      redirect: 'manual'
    });

    const ms = Date.now() - t0;
    console.error(`[eventlink-proxy] done  op=${op} status=${resp.status} ms=${ms} trace=${t}`);

    const text = await resp.text();
    const out = new Response(text, {
      status: resp.status,
      headers: { 'content-type': resp.headers.get('content-type') ?? 'application/json' }
    });
    out.headers.set('X-Proxy','sveltekit');
    out.headers.set('X-Proxy-Trace', t);
    out.headers.set('X-Proxy-Op', op);
    out.headers.set('X-Proxy-Duration', String(ms));
    out.headers.set('Cache-Control', 'no-store');
    return out;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
  const ms = Date.now() - t0;
  const code = err?.code || err?.cause?.code || 'unknown';
  console.error(`[eventlink-proxy] error op=${op} ms=${ms} trace=${t} code=${code} msg=${err?.message} target-url=${target}`);
  return new Response(JSON.stringify({ error:'Upstream fetch failed', trace:t, code, message:String(err?.message||err) }), {
    status: 502, headers: { 'content-type':'application/json' }
        });
    }
}

export const GET: RequestHandler    = ({ request, url }) => forward(request, url);
export const POST: RequestHandler   = ({ request, url }) => forward(request, url);
export const PATCH: RequestHandler  = ({ request, url }) => forward(request, url);
export const PUT: RequestHandler    = ({ request, url }) => forward(request, url);
export const DELETE: RequestHandler = ({ request, url }) => forward(request, url);