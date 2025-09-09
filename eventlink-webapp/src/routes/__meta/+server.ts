import type { RequestHandler } from '@sveltejs/kit';
import { COMMIT_SHA, BUILD_TIME } from '$lib/build-meta';

export const GET: RequestHandler = () =>
  new Response(JSON.stringify({ sha: COMMIT_SHA, builtAt: BUILD_TIME }), {
    headers: { 'content-type': 'application/json' }
  });