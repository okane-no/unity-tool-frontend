<script lang="ts">
	import { browser } from '$app/environment';
	import {
		getStoreId,
		requestCookiesFromExtension,
		startUnityOAuthLogin,
		verifyUnityAccessToken
	} from '$lib/auth';
	import { fetchCalendarEvents, fetchEventDetails } from '$lib/eventlink';
	import { createUnityEvent, uploadUnityResults } from '$lib/unity';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let unityLoggedIn = false;
	let unityUser: { username: any; } | null = null;
	let eventlinkCookies = null;
	let eventlinkStoreId: string | null = null;
	let eventlinkLoggedIn = false;
	let verifyingStore = false;
	let verifiedStore = false;
	let unityTarget = 'new';
	let unityFormats = ['STANDARD', 'MODERN', 'PIONEER', 'LEGACY', 'COMMANDER'];
	let unityCategories = ['LOCAL', 'REGIONAL', 'NATIONAL', 'ONLINE'];

	let isLoadingEvents = false;

	let selectedDate = '';
	let eventlinkEvents: any[] = [];
	let selectedEventlinkEvent: string = '';

	let unityEvents: any[] = [];
	let selectedUnityEvent: string = '';

	let selectedEventlinkDetails: any = null;
	let eventlinkStandings: any[] = [];

	let unityName = '';
	let unityDate = '';
	let unityStartTime = '18:00:00';
	let unityEndTime = '22:00:00';
	let unityFormat = 'STANDARD';
	let unityCategory = 'LOCAL';
	let unityUrl = '';
	let unityDescription = 'Synced from Eventlink';

	// Collapsed states
	let unityAuthDone = false;
	let eventlinkAuthDone = false;
	let uploadTargetDone = false;
	let eventSelected = false;

	// Check login status
	onMount(async () => {
		if (!browser) return;
		// Check Unity
		const token = localStorage.getItem('unity_access_token');
		if (token) {
			try {
				const user = await verifyUnityAccessToken(token);
				unityLoggedIn = true;
				unityUser = user;
			} catch {
				localStorage.removeItem('unity_access_token');
			}
		}

		// Check Eventlink
		try {
			eventlinkCookies = await requestCookiesFromExtension();
			eventlinkLoggedIn = !!eventlinkCookies.find((c) => c.name === 'clientAuth');

			// Optional: load storeId from localStorage
			eventlinkStoreId = localStorage.getItem('eventlink_store_id');
		} catch {
			eventlinkLoggedIn = false;
		}
	});

	async function handleUnityLogin() {
		await startUnityOAuthLogin(); // This should redirect to auth
	}

	async function handleVerifyStore() {
		verifyingStore = true;
		try {
			eventlinkStoreId = await getStoreId();
		} catch (err) {
			console.error('Failed to verify store:', err);
		} finally {
			verifyingStore = false;
			verifiedStore = true;
		}
	}

	async function fetchEventlinkEvents() {
		// call your Node backend `/calendar` with x-eventlink-cookies and selectedDateisLoadingEvents = true;
		const results = await fetchCalendarEvents(selectedDate, eventlinkStoreId!, eventlinkCookies!);
		eventlinkEvents = results.data;
		console.log(eventlinkEvents);
	}

	async function loadMyUnityEvents() {
		// call your Unity backend `/events/me`
	}

	$: if (selectedEventlinkEvent) {
		fetchEventDetails2(selectedEventlinkEvent);
		selectedEventlinkDetails = selectedEventlinkEvent;
	}

	async function fetchEventDetails2(eventUrl: string) {
		const results = await fetchEventDetails(eventUrl, eventlinkStoreId!, eventlinkCookies!);
		console.log(results);
		if (results?.data?.[0]?.[0]) {
			eventlinkStandings = results.data[0][0].map((entry: any) => {
				const [wins, losses, draws] = entry.record.split('/').map((s: string) => parseInt(s, 10));
				return {
					player: entry.name,
					win_count: wins ?? 0,
					draw_count: draws ?? 0,
					loss_count: losses ?? 0,
					single_elimination_result: null
				};
			});
		}
	}

	async function handlePushToUnity() {
		try {
			const token = localStorage.getItem('unity_access_token');
			if (!token) throw new Error('Unity access token missing');

			if (unityTarget === 'new') {
				// 1. Create Unity event using frontend helper
				const eventData = {
					name: unityName,
					date: unityDate,
					start_time: unityStartTime,
					end_time: unityEndTime,
					format: unityFormat,
					category: unityCategory,
					url: unityUrl,
					description: unityDescription
				};

				const created = await createUnityEvent(eventData);
				const eventUrl = created.api_url;

				// 2. Upload results
				await uploadUnityResults(eventUrl, eventlinkStandings);
				alert('✅ Event created and results uploaded to Unity!');
			} else if (unityTarget === 'existing') {
				await uploadUnityResults(selectedUnityEvent, eventlinkStandings);
				alert('✅ Results uploaded to existing Unity event!');
			}
		} catch (err: any) {
			console.error('❌ Push to Unity failed:', err);
			alert(`Failed to push to Unity: ${err.message}`);
		}
	}

	// When eventlinkDetails is loaded, prefill:
	$: if (selectedEventlinkDetails) {
		console.log('selectedevent', selectedEventlinkDetails);
		unityName = selectedEventlinkDetails.title ?? unityName;
		unityDate = selectedEventlinkDetails.date ?? unityDate;
		unityStartTime = selectedEventlinkDetails.start_time ?? unityStartTime;
		unityEndTime = selectedEventlinkDetails.end_time ?? unityEndTime;
		unityFormat = selectedEventlinkDetails.format ?? unityFormat;
		unityCategory = 'LOCAL';
		unityUrl = selectedEventlinkDetails.url ?? unityUrl;
		unityDescription = selectedEventlinkDetails.description ?? unityDescription;
	}

	const fetchEvents = async () => {
		isLoadingEvents = true;
		setTimeout(() => {
			isLoadingEvents = false;
		}, 1200);
	};
</script>


<!-- <div>
	<h1>Sync Eventlink → Unity</h1>


	{#if unityLoggedIn}
		<p>✅ Logged in as {unityUser?.username}</p>
	{:else}
		<button on:click={handleUnityLogin}>Login to Unity</button>
	{/if}


	{#if eventlinkLoggedIn}
		<p>✅ Eventlink Store available</p>

		{#if eventlinkStoreId}
			<p>Store ID: {eventlinkStoreId}</p>
		{:else}
			<button on:click={handleVerifyStore} disabled={verifyingStore}>
				{verifyingStore ? 'Verifying...' : 'Verify Store ID'}
			</button>
		{/if}
	{:else}
		<p>❌ Not logged into Eventlink</p>
		<p>Please open eventlink.wizards.com in a tab and login manually.</p>
		<button on:click={handleVerifyStore}>Check Login & Verify StoreID</button>
	{/if}
	<div class="section">
		<h2>Upload to Unity</h2>

		<label>
			<input type="radio" bind:group={unityTarget} value="new" />
			Create a new Unity event based on eventlink
		</label>
		<label style="margin-left: 1rem;">
			<input type="radio" bind:group={unityTarget} value="existing" />
			Use an existing Unity event
		</label>
	</div>
	{#if unityTarget === 'new'}

		<div class="section">
			<h3>Create New Event in Unity based on eventlink</h3>
			<label>
				Select date event date in eventlink:
				<input type="date" bind:value={selectedDate} />
			</label>
			<button on:click={fetchEventlinkEvents}>Fetch Eventlink Events</button>

			{#if eventlinkEvents.length > 0}
				<label>
					Choose Eventlink Event:
					<select bind:value={selectedEventlinkEvent}>
						<option disabled value="">-- Select an event --</option>
						{#each eventlinkEvents as event}
							<option value={event.url}>{event.title} - {event.date}</option>
						{/each}
					</select>
				</label>
			{/if}
		</div>
	{:else if unityTarget === 'existing'}

		<div class="section">
			<h3>Select Existing Unity Event</h3>
			<button on:click={loadMyUnityEvents}>Load My Events</button>

			{#if unityEvents.length > 0}
				<label>
					Choose Unity Event:
					<select bind:value={selectedUnityEvent}>
						<option disabled value="">-- Select Unity event --</option>
						{#each unityEvents as event}
							<option value={event.api_url}>{event.name} - {event.date}</option>
						{/each}
					</select>
				</label>
			{/if}
		</div>
	{/if}
	{#if selectedEventlinkEvent || selectedUnityEvent}
		<div class="section">
			<h3>📝 Review & Adjust Unity Event Details</h3>

			<div class="field">
				<label>Name</label>
				<input type="text" bind:value={unityName} />
			</div>

			<div class="field">
				<label>Date</label>
				<input type="date" bind:value={unityDate} />
			</div>

			<div class="field">
				<label>Start Time</label>
				<input type="time" bind:value={unityStartTime} />
			</div>

			<div class="field">
				<label>End Time</label>
				<input type="time" bind:value={unityEndTime} />
			</div>

			<div class="field">
				<label>Format</label>
				<select bind:value={unityFormat}>
					<option value="STANDARD">Standard</option>
					<option value="MODERN">Modern</option>
					<option value="PIONEER">Pioneer</option>
					<option value="LEGACY">Legacy</option>
					<option value="COMMANDER">Commander</option>

				</select>
			</div>

			<div class="field">
				<label>Category</label>
				<select bind:value={unityCategory}>
					<option value="LOCAL">Local</option>
					<option value="REGIONAL">Regional</option>
					<option value="NATIONAL">National</option>
					<option value="ONLINE">Online</option>

				</select>
			</div>

			<div class="field">
				<label>Website URL (optional)</label>
				<input type="text" bind:value={unityUrl} />
			</div>

			<div class="field">
				<label>Description</label>
				<textarea rows="3" bind:value={unityDescription} />
			</div>

			<h4>Standings</h4>
			<ul>
				{#each eventlinkStandings as player}
					<li>
						{player.player} – W:{player.win_count}, D:{player.draw_count}, L:{player.loss_count}
					</li>
				{/each}
			</ul>

			<button on:click={handlePushToUnity}>🚀 Push to Unity</button>
		</div>
	{/if}
</div> -->

<div class="container">
	<h1>⚙️ Sync Eventlink → Unity</h1>

	
	<div class="section">
		<h2>Unity Login</h2>
		{#if unityLoggedIn}
			<p>✅ Logged in as <strong>{unityUser?.username}</strong></p>
		{:else}
			<button on:click={handleUnityLogin}>🔐 Login to Unity</button>
		{/if}
	</div>

	
	<div class="section">
		<h2>Eventlink Login</h2>
		{#if eventlinkLoggedIn}
			<p>✅ Eventlink session detected</p>
			{#if eventlinkStoreId}
				<p>🏬 Store ID: <strong>{eventlinkStoreId}</strong></p>
			{:else}
				<button on:click={handleVerifyStore} disabled={verifyingStore}>
					{verifyingStore ? 'Verifying...' : '🔎 Verify Store ID'}
				</button>
			{/if}
		{:else}
			<p>❌ Not logged into Eventlink</p>
			<p>
				Log in at <a href="https://eventlink.wizards.com" target="_blank">eventlink.wizards.com</a> and
				then:
			</p>
			<button on:click={handleVerifyStore}>🔍 Check Login & Verify Store ID</button>
		{/if}
	</div>

	
	<div class="section">
		<h2>Upload Target</h2>
		<div class="radio-group">
			<label class="radio-option">
				<input type="radio" bind:group={unityTarget} value="new" />
				<span>Create a new Unity event from Eventlink</span>
			</label>
			<label class="radio-option">
				<input type="radio" bind:group={unityTarget} value="existing" />
				<span>Use an existing Unity event</span>
			</label>
		</div>
	</div>

	
	{#if unityTarget === 'new'}
		<div class="section">
			<h3>📅 Create Unity Event from Eventlink</h3>

			<label>
				Event date:
				<input type="date" bind:value={selectedDate} />
			</label>

			<button on:click={fetchEventlinkEvents}>📥 Fetch Eventlink Events</button>

			{#if eventlinkEvents.length > 0}
				<label>
					Select event:
					<select bind:value={selectedEventlinkEvent}>
						<option disabled value="">-- Choose an event --</option>
						{#each eventlinkEvents as event}
							<option value={event.url}>{event.title} – {event.date}</option>
						{/each}
					</select>
				</label>
			{/if}
		</div>
	{:else if unityTarget === 'existing'}
		
		<div class="section">
			<h3>📁 Use Existing Unity Event</h3>
			<button on:click={loadMyUnityEvents}>🔄 Load My Events</button>

			{#if unityEvents.length > 0}
				<label>
					Select Unity event:
					<select bind:value={selectedUnityEvent}>
						<option disabled value="">-- Choose an event --</option>
						{#each unityEvents as event}
							<option value={event.api_url}>{event.name} – {event.date}</option>
						{/each}
					</select>
				</label>
			{/if}
		</div>
	{/if}

	
	{#if selectedEventlinkEvent || selectedUnityEvent}
		<div class="section">
			<h3>📝 Review & Adjust Event Details</h3>

			<div class="field">
				<label>Event Name</label>
				<input type="text" bind:value={unityName} />
			</div>

			<div class="field">
				<label>Date</label>
				<input type="date" bind:value={unityDate} />
			</div>

			<div class="field">
				<label>Start Time</label>
				<input type="time" bind:value={unityStartTime} />
			</div>

			<div class="field">
				<label>End Time</label>
				<input type="time" bind:value={unityEndTime} />
			</div>

			<div class="field">
				<label>Format</label>
				<select bind:value={unityFormat}>
					<option value="STANDARD">Standard</option>
					<option value="MODERN">Modern</option>
					<option value="PIONEER">Pioneer</option>
					<option value="LEGACY">Legacy</option>
					<option value="COMMANDER">Commander</option>
				</select>
			</div>

			<div class="field">
				<label>Category</label>
				<select bind:value={unityCategory}>
					<option value="LOCAL">Local</option>
					<option value="REGIONAL">Regional</option>
					<option value="NATIONAL">National</option>
					<option value="ONLINE">Online</option>
				</select>
			</div>

			<div class="field">
				<label>Website URL (optional)</label>
				<input type="text" bind:value={unityUrl} />
			</div>

			<div class="field">
				<label>Description</label>
				<textarea rows="3" bind:value={unityDescription} />
			</div>

			<h4>🏆 Standings</h4>
			<ul>
				{#each eventlinkStandings as player}
					<li>
						{player.player} – W:{player.win_count}, D:{player.draw_count}, L:{player.loss_count}
					</li>
				{/each}
			</ul>

			<button on:click={handlePushToUnity}>🚀 Push to Unity</button>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
		font-family: sans-serif;
	}

	.section {
		margin-bottom: 2rem;
		padding: 1rem 1.5rem;
		background: #f9f9f9;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.field {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.25rem;
		font-weight: bold;
	}

	input,
	select,
	textarea {
		width: 100%;
		max-width: 400px;
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
	}

	button {
		margin-top: 1rem;
		padding: 0.6rem 1.2rem;
		font-size: 1rem;
		color: #fff;
		background-color: #4caf50;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #45a049;
	}

	ul {
		list-style: none;
		padding-left: 0;
	}

	li {
		padding: 0.3rem 0;
		border-bottom: 1px solid #eee;
	}
	.radio-group {
		display: flex;
		align-items: center;
		gap: 2rem;
		margin-top: 0.5rem;
	}

	.radio-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
		font-weight: 500;
	}
</style>

