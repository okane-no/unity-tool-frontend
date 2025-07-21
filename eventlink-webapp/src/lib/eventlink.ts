const BACKEND_URL = 'http://localhost:3000'; // adjust if deployed

/**
 * Fetches the calendar for a given date and store.
 */
export async function fetchCalendarEvents(date: string, store: string, cookies: chrome.cookies.Cookie[]) {
	const response = await fetch(`${BACKEND_URL}/calendar?date=${encodeURIComponent(date)}&store=${encodeURIComponent(store)}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'x-eventlink-cookies': JSON.stringify(cookies)
		}
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch calendar events');
	}

	const data = await response.json();
	return data;
}

/**
 * Fetches the event details (including standings) from a specific event page.
 */
export async function fetchEventDetails(eventUrl: string, store: string, cookies: chrome.cookies.Cookie[]) {
	const response = await fetch(`${BACKEND_URL}/event/details?url=${encodeURIComponent(eventUrl)}&store=${encodeURIComponent(store)}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'x-eventlink-cookies': JSON.stringify(cookies)
		}
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch event details');
	}

	const data = await response.json();
	return data;
}