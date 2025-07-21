const API_BASE = 'http://localhost:5278/api/unity';

function getAuthHeaders(): HeadersInit {
	const token = localStorage.getItem('unity_access_token');
	if (!token) throw new Error('Access token not found in localStorage');

	return {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json'
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMyOrganizerProfile(): Promise<any> {
	const res = await fetch(`${API_BASE}/organizer/profile`, {
		method: 'GET',
		headers: getAuthHeaders()
	});
	if (!res.ok) throw new Error('Failed to fetch organizer profile');
	return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAllEvents(): Promise<any[]> {
	const res = await fetch(`${API_BASE}/events`, {
		method: 'GET',
		headers: getAuthHeaders()
	});
	if (!res.ok) throw new Error('Failed to fetch events');
	return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMyEvents(): Promise<any[]> {
	const res = await fetch(`${API_BASE}/events/me`, {
		method: 'GET',
		headers: getAuthHeaders()
	});
	if (!res.ok) throw new Error('Failed to fetch events');
	const data = await res.json();
	return data.results; 
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getEventsNeedingResults(): Promise<any[]> {
	const res = await fetch(`${API_BASE}/events-needing-results`, {
		method: 'GET',
		headers: getAuthHeaders()
	});
	if (!res.ok) throw new Error('Failed to fetch events needing results');
	return res.json();
}

export async function createUnityEvent(eventData: {
	name: string;
	date: string;
	start_time: string;
	end_time: string;
	format: string;
	category: string;
	url: string;
	description: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
	const res = await fetch(`${API_BASE}/create-event`, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify(eventData)
	});
	if (!res.ok) throw new Error('Failed to create event');
	return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadUnityResults(eventUrl: string, results: any[]) {
	const token = localStorage.getItem('unity_access_token');
	if (!token) throw new Error('No Unity access token found');

	const response = await fetch('http://localhost:5278/api/unity/upload-results', {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			eventUrl,
			results
		})
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`Failed to upload results: ${response.status} - ${err}`);
	}
}