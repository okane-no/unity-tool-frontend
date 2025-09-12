const LOCAL_UNITY_API = '/api/unity'; // hits SvelteKit server, which forwards to .NET

function getBearer(): string {
  const token = localStorage.getItem('unity_access_token');
  if (!token) throw new Error('Access token not found in localStorage');
  return token;
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${getBearer()}`,
    ...(extra ?? {})
  };
}

async function call(op: string, init: RequestInit) {
  const url = `${LOCAL_UNITY_API}?op=${encodeURIComponent(op)}`;
  const res = await fetch(url, { ...init, headers: authHeaders(init.headers) });
  return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMyOrganizerProfile(): Promise<any> {
  const res = await call('organizer.profile', { method: 'GET' });
  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch organizer profile');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAllEvents(): Promise<any[]> {
  const res = await call('events.all', { method: 'GET' });
  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch events');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMyEvents(): Promise<any[]> {
  const res = await call('events.me', { method: 'GET' });
  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch events');
  const data = await res.json();
  return data.results;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getEventsNeedingResults(): Promise<any[]> {
  const res = await call('events.needing', { method: 'GET' });
  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch events needing results');
  return res.json();
}

export async function createUnityEvent(eventData: {
  name: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  format: string;
  category: string;
  url?: string;
  description?: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
  const res = await call('events.create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  if (!res.ok) throw new Error(await res.text() || 'Failed to create event');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadUnityResults(eventUrl: string, results: any[]) {
  const res = await call('results.upload', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventUrl, results })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload results: ${res.status} - ${err}`);
  }
}