import type { Handle } from '@sveltejs/kit';
import { COMMIT_SHA, BUILD_TIME } from '$lib/build-meta';

export const handle: Handle = async ({ event, resolve }) => {
  const res = await resolve(event);
  res.headers.set('X-Commit-Sha', COMMIT_SHA);
  if (BUILD_TIME) res.headers.set('X-Build-Time', BUILD_TIME);
  return res;
};