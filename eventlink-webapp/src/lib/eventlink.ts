const BACKEND_URL = '/eventlink-proxy'; 

/** Fetch calendar for a given date and store */
export async function fetchCalendarEvents(date: string, store: string, cookies: chrome.cookies.Cookie[]) {
  const res = await fetch(`${BACKEND_URL}?op=calendar&date=${encodeURIComponent(date)}&store=${encodeURIComponent(store)}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'x-eventlink-cookies': JSON.stringify(cookies)
    }
  });

  const text = await res.text();
  if (!res.ok) throw new Error(tryErr(text));
  return parseJson(text);
}

/** Fetch event details (incl. standings) */
export async function fetchEventDetails(eventUrl: string, store: string, cookies: chrome.cookies.Cookie[]) {
  const res = await fetch(`${BACKEND_URL}?op=event.details&url=${encodeURIComponent(eventUrl)}&store=${encodeURIComponent(store)}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'x-eventlink-cookies': JSON.stringify(cookies)
    }
  });

  const text = await res.text();
  if (!res.ok) throw new Error(tryErr(text));
  return parseJson(text);
}

// helpers
function parseJson(t: string) { try { return JSON.parse(t); } catch { return t; } }
function tryErr(t: string) { try { return JSON.parse(t).error || t; } catch { return t; } }