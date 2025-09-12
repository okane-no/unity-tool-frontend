import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';

export const GET: RequestHandler = async (event) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const headers = Object.fromEntries(event.request.headers);
  return json({
    status: 'ok',
    message: 'SvelteKit +server.ts is executing',
    now: new Date().toISOString(),
    url: event.url.toString(),
    method: event.request.method,
    clientAddress: event.getClientAddress?.() ?? null,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      HOST: process.env.HOST,
      PORT: process.env.PORT
    },
    node: {
      pid: process.pid,
      version: process.version,
      platform: process.platform
    },
    sveltekit: { dev }
  });
};

export const POST: RequestHandler = async (event) => {
  const body = await event.request.text();
  return json({ received: body, now: new Date().toISOString() });
};