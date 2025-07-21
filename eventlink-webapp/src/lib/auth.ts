// place files you want to import through the `$lib` alias in this folder.
import { browser } from '$app/environment';
import { generateCodeChallenge, generateCodeVerifier } from './pcke';


const EXTENSION_ID = 'bpddinkecmkkmmlnjnlgpmmkjbkfokdp';
export async function requestCookiesFromExtension(): Promise<chrome.cookies.Cookie[]> {
	return new Promise((resolve, reject) => {
		if (!browser || !chrome?.runtime?.sendMessage) {
			reject(new Error('Browser does not support extension messaging.'));
			return;
		}

		console.log('📡 Requesting cookies from extension...');

		chrome.runtime.sendMessage(EXTENSION_ID, { type: 'GET_COOKIES' }, (response) => {
			if (chrome.runtime.lastError) {
				reject(new Error('Extension error: ' + chrome.runtime.lastError.message));
				return;
			}

			if (!response) {
				reject(new Error('No response from extension.'));
				return;
			}

			console.log('🍪 Cookies received from extension:', response);
			resolve(response);
		});
	});
}

function extractClientAuthToken(cookies: chrome.cookies.Cookie[]): string {
	const cookie = cookies.find((c) => c.name === 'clientAuth');
	if (!cookie) {
		throw new Error('clientAuth cookie not found.');
	}
	return cookie.value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendTokenToBackend(token: string): Promise<any> {
	const response = await fetch('http://localhost:3000/api/auth/eventlink', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token })
	});

	if (!response.ok) {
		throw new Error(`Backend auth failed with status ${response.status}`);
	}

	const data = await response.json();
	console.log('✅ Authenticated user info:', data);
	return data;
}

export async function handleAuthFlow() {
	try {
		const cookies = await requestCookiesFromExtension();
		const token = extractClientAuthToken(cookies);
		const userInfo = await sendTokenToBackend(token);

		// Optionally store userInfo somewhere or emit event
		return userInfo;
	} catch (err) {
		console.error('❌ Auth flow failed:');
		throw err;
	}
}

export async function getStoreId() {
	try {
		const cookies = await requestCookiesFromExtension();

		const response = await fetch('http://localhost:3000/verify', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-eventlink-cookies': JSON.stringify(cookies)
			}
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`Auth verification failed: ${response.status} - ${errText}`);
		}

		const data = await response.json();
		console.log('✅ Auth verified:', data);

		localStorage.setItem('eventlink_store_id', data.storeId);

		return data.storeId;
	} catch (err) {
		console.error('❌ Auth flow failed:', err);
		throw err;
	}
}

export async function startUnityOAuthLogin() {
	const verifier = generateCodeVerifier();
	const challenge = await generateCodeChallenge(verifier);

	localStorage.setItem('unity_pkce_verifier', verifier);

	const params = new URLSearchParams({
		client_id: 'skCMSme75PCnF2wqePonMCk3UWoswiYkpOk2zFC1',
		response_type: 'code',
		redirect_uri: 'http://localhost:5173/callback',
		scope: 'read write',
		code_challenge: challenge,
		code_challenge_method: 'S256'
	});

	window.location.href = `https://unityleague.gg/o/authorize/?${params.toString()}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyUnityAccessToken(token: string): Promise<any> {
	const response = await fetch('http://localhost:5278/api/unity-oauth/verify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ accessToken: token })
	});

	if (!response.ok) throw new Error('Token verification failed');

	const data = await response.json();
	return data;
}
