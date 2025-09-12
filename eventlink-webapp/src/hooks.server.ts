// import type { Handle } from '@sveltejs/kit';
// import { COMMIT_SHA, BUILD_TIME } from '$lib/build-meta';

// console.log('[startup] hooks.server.ts loaded at', new Date().toISOString());

// export const handle: Handle = async ({ event, resolve }) => {
//   const res = await resolve(event);
//   res.headers.set('X-Commit-Sha', COMMIT_SHA);
//   if (BUILD_TIME) res.headers.set('X-Build-Time', BUILD_TIME);
//   return res;
// };

import type { Handle } from '@sveltejs/kit';
import { COMMIT_SHA, BUILD_TIME } from '$lib/build-meta';
import { dev } from '$app/environment';

// One-time startup signal (shows in `kubectl logs` on pod start)
console.log(
  `[startup] hooks.server.ts loaded @ ${new Date().toISOString()} | commit=${COMMIT_SHA}` +
  (BUILD_TIME ? ` | build=${BUILD_TIME}` : '') +
  ` | node=${process.version} | env=${process.env.NODE_ENV ?? 'development'}`
);

// Toggle noisy request logs with env var (REQUEST_LOG=1)
const shouldLog = process.env.REQUEST_LOG === '1' || dev;

export const handle: Handle = async ({ event, resolve }) => {
  if (shouldLog) {
    const xfwd = event.request.headers.get('x-forwarded-for') ?? '';
    const client =
      // prefer proxy chain first IP if behind ingress
      (xfwd.split(',')[0] || '').trim() ||
      // fall back to adapter-node (may be undefined on some adapters)
      (event.getClientAddress?.() ?? '');
    console.log(`[req] ${event.request.method} ${event.url.pathname} ← ${client}`);
  }

  const response = await resolve(event);

  // Your existing headers — preserved
  if (COMMIT_SHA) response.headers.set('X-Commit-Sha', COMMIT_SHA);
  if (BUILD_TIME) response.headers.set('X-Build-Time', BUILD_TIME);

  // Extra breadcrumbs that help validate server execution in k8s
  response.headers.set('X-Node-Pid', String(process.pid));
  response.headers.set('X-Env', process.env.NODE_ENV ?? 'development');

  return response;
};