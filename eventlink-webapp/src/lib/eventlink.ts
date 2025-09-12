// const BACKEND_URL = 'http://localhost:3000'; // adjust if deployed

// /**
//  * Fetches the calendar for a given date and store.
//  */
// export async function fetchCalendarEvents(date: string, store: string, cookies: chrome.cookies.Cookie[]) {
// 	const response = await fetch(`${BACKEND_URL}/calendar?date=${encodeURIComponent(date)}&store=${encodeURIComponent(store)}`, {
// 		method: 'GET',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'x-eventlink-cookies': JSON.stringify(cookies)
// 		}
// 	});

// 	if (!response.ok) {
// 		const error = await response.json();
// 		throw new Error(error.error || 'Failed to fetch calendar events');
// 	}

// 	const data = await response.json();
// 	return data;
// }

// /**
//  * Fetches the event details (including standings) from a specific event page.
//  */
// export async function fetchEventDetails(eventUrl: string, store: string, cookies: chrome.cookies.Cookie[]) {
// 	const response = await fetch(`${BACKEND_URL}/event/details?url=${encodeURIComponent(eventUrl)}&store=${encodeURIComponent(store)}`, {
// 		method: 'GET',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'x-eventlink-cookies': JSON.stringify(cookies)
// 		}
// 	});

// 	if (!response.ok) {
// 		const error = await response.json();
// 		throw new Error(error.error || 'Failed to fetch event details');
// 	}

// 	const data = await response.json();
// 	return data;
// }

// go through SvelteKit (adds X-Api-Key)
const BACKEND_URL = '/api/eventlink'; 

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