<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import {
		handleAuthFlow,
		startUnityOAuthLogin,
		verifyUnityAccessToken,
		getStoreId,
		requestCookiesFromExtension
	} from '$lib/auth';
	import { user, loggedIn } from '$lib/stores/auth';
	import {
		getMyOrganizerProfile,
		getAllEvents,
		getMyEvents,
		getEventsNeedingResults,
		createUnityEvent,
		uploadUnityResults
	} from '$lib/unity';
	import { fetchCalendarEvents, fetchEventDetails } from '$lib/eventlink';

	let organizerProfile: any = null;
	let allEvents: any[] = [];
	let myEvents: any[] = [];
	let needingResults: any[] = [];
	let createEventResult: any = null;
	let uploadSuccess = false;
	let cookies: any[] | null = null;
	let error: string | null = null;
	let userInfo: any;
	let userInfo2: any;
	let loggedInUnity = false;
	let loggedeventlink = false;
	let storeid: any | null = null;

	// Example dummy data
	const testEvent = {
		name: 'Test Event',
		date: '2025-07-21',
		start_time: '18:00:00',
		end_time: '21:00:00',
		format: 'MODERN',
		category: 'LOCAL',
		url: 'https://eventlink.wizards.com/events/123',
		description: 'A test event created from okane.'
	};

	const testResults = [
		{
			player: 'player1',
			win_count: 3,
			draw_count: 0,
			loss_count: 1,
			single_elimination_result: 1
		},
		{
			player: 'player2',
			win_count: 1,
			draw_count: 1,
			loss_count: 2,
			single_elimination_result: 2
		}
	];

	const REDIRECT_URI = 'http://localhost:5173/callback';


	function loginWithUnityLeague() {
		startUnityOAuthLogin();
	}

	async function loginWithEventlink() {
		try {
			userInfo2 = await handleAuthFlow();
		} catch (err: any) {
			error = err.message;
		}
	}

	function logoutWithUnityLeague() {
		localStorage.removeItem('unity_access_token');
		user.set(null);
		loggedIn.set(false);
		window.location.reload();
	}

	async function runAllTests() {
		try {
			error = null;
			organizerProfile = await getMyOrganizerProfile();
			myEvents = await getMyEvents();
			// allEvents = await getAllEvents();
			needingResults = await getEventsNeedingResults();
			createEventResult = await createUnityEvent(testEvent);

			console.log(myEvents);
			console.log(createEventResult);
			await uploadUnityResults(createEventResult?.api_url, testResults);
			uploadSuccess = true;
		} catch (err: any) {
			error = err.message;
			console.error(err);
		}
	}

	async function Checkeventlinkcookie() {
		try {
			error = null;
			storeid = await getStoreId();
			loggedeventlink = true;
		} catch (err: any) {
			error = err.message;
			console.error(err);
		}
	}

	async function getCalender() {
	try {
		const cookies = await requestCookiesFromExtension();
		const store = '12829';
		const date = '2025-07-09';

		const calendarData = await fetchCalendarEvents(date, store, cookies);
		console.log('📅 Events:', calendarData);

		if (calendarData.data.length > 0) {
			const eventUrl = calendarData.data[0].url;
			const eventDetails = await fetchEventDetails(eventUrl, store, cookies);
			console.log('📊 Event details:', eventDetails);
		}
	} catch (err) {
		console.error('❌ Error in EventLink flow:', err);
	}
}

	onMount(async () => {
		if (!browser) return;
		const tokenUnity = localStorage.getItem('unity_access_token');
		if (!tokenUnity) return;

		try {
			const result = await verifyUnityAccessToken(tokenUnity);
			loggedInUnity = true;
			userInfo = result;
			user.set(userInfo);
			loggedIn.set(true);
			console.log('✅ Verified login:', result);
		} catch (err) {
			error = 'Invalid or expired token';
			localStorage.removeItem('unity_access_token');
			user.set(null);
			loggedIn.set(false);
		}
	});

	onDestroy(() => {
		if (!browser) return;
	});

	let success: string | null = null;



</script>

<h1>🧪 Eventlink WebApp</h1>

{#if browser}
	<button on:click={loginWithEventlink}>Fetch Cookies eventlink</button>
	<button on:click={Checkeventlinkcookie}>Verify eventlink cookies</button>
	<button on:click={loginWithUnityLeague}>Login with UnityLeague</button>
	{#if loggedeventlink}
		<p>✅ You are logged in eventlink with store id:</p>
		<pre>{JSON.stringify(storeid, null, 2)}</pre>
		<button on:click={getCalender}>test eventlink</button>
	{/if}
	{#if loggedInUnity}
		<p>✅ You are logged in unity</p>
		<h1>🧪 Unity API Test Interface</h1>
		<pre>{JSON.stringify(userInfo, null, 2)}</pre>
		<button on:click={runAllTests}>Run Test Calls</button>

		{#if error}
			<p style="color: red;">❌ Error: {error}</p>
		{:else}
			{#if organizerProfile}
				<h2>👤 Organizer Profile:</h2>
				<pre>{JSON.stringify(organizerProfile, null, 2)}</pre>
			{/if}

			<!-- {#if allEvents.length}
		<h2>📅 My Events:</h2>
		<pre>{JSON.stringify(allEvents, null, 2)}</pre>
	{/if} -->

			{#if myEvents.length}
				<h2>📅 My Events:</h2>
				<pre>{JSON.stringify(myEvents, null, 2)}</pre>
			{/if}

			{#if needingResults.length}
				<h2>⏳ Events Needing Results:</h2>
				<pre>{JSON.stringify(needingResults, null, 2)}</pre>
			{/if}

			{#if createEventResult}
				<h2>✅ Created Event:</h2>
				<pre>{JSON.stringify(createEventResult, null, 2)}</pre>
			{/if}

			{#if uploadSuccess}
				<h2>📤 Results uploaded successfully!</h2>
			{/if}
		{/if}
		<button on:click={logoutWithUnityLeague}>Logout with UnityLeague</button>
	{:else if error}
		<p style="color: red;">{error}</p>
	{:else}
		<p>Not logged in.</p>
	{/if}

	{#if cookies}
		<h2>🍪 Cookies found:</h2>
		<pre>{JSON.stringify(cookies, null, 2)}</pre>
	{:else if error}
		<p style="color: red;">{error}</p>
	{/if}
{:else}
	<p>This page only works in the browser.</p>
{/if}
