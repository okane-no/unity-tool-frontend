<script lang="ts">
  import { slide } from 'svelte/transition';
  import { onDestroy, onMount, tick } from 'svelte';
	import { createUnityEvent, uploadUnityResults } from '$lib/unity';
  import { browser } from '$app/environment';
	import { loggedIn, user } from '$lib/stores/auth';
	import { getStoreId, handleAuthFlow, requestCookiesFromExtension, startUnityOAuthLogin, verifyUnityAccessToken } from '$lib/auth';
	import { fetchCalendarEvents, fetchEventDetails } from '$lib/eventlink';
  import { COMMIT_SHA, BUILD_TIME } from '$lib/build-meta';

  const shortSha = COMMIT_SHA?.slice(0, 7) || 'dev';
  function copySha() {
    navigator.clipboard?.writeText(COMMIT_SHA).catch(() => {});
  }

  let currentStep = 0;

  let unityLoggedIn = false;
  let eventlinkLoggedIn = false;
  let verifyingStore = false;
  let unityUser: { username: string } | null = null;
  let eventlinkStoreId: string | null = null;
	let simulateStoreFound = false;
  let error: string | null = null;
  let uploadSuccess = false;

  let unityTarget: 'new' | 'existing' = 'new';
  type UnityFormat = 'STANDARD' | 'MODERN' | 'PIONEER' | 'LEGACY' | 'COMMANDER';
  type UnityCategory = 'LOCAL' | 'REGIONAL' | 'NATIONAL';

  

  let selectedDate = '';

  interface UserInfo {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  }

  let userInfo: any;

  interface EventlinkEvent {
    title: string;
    url: string;
    time?: string;
    status?: string;
  };

  interface DetailedEventlinkEvent {
    title: string;
    url?: string;
    time?: string;
    format?: string
    date?: string
  };

  interface UnityEvent {
    name: string;
    date: string;           // YYYY-MM-DD
    start_time: string | null;    // "HH:mm:ss" or null
    end_time: string | null;     // "HH:mm:ss" or null
    format: UnityFormat;
    category: UnityCategory;
    url?: string;           // optional
    description?: string;   // optional
  };

  type RawStanding = {
    rank: string;
    name: string;
    points: string;
    record: string;
    omw: string;
    gwp: string;
    ogwp: string;
  };

  interface EventlinkStanding {
    player: string;
    win_count: number;
    draw_count: number;
    loss_count: number;
    single_elimination_result?: number; // optional
  };

  type EventlinkStandings = EventlinkStanding[];

  let eventlinkEvents: EventlinkEvent[] = [];
  let selectedEventlinkEvent: DetailedEventlinkEvent | null;
  let unityEvents: { name: string; date: string; api_url: string }[] = [];
  let selectedUnityEvent = '';
  let searchedForEvent = false

  let unityName = '';
  let unityDate = '';
  let unityStartTime = '';
  let unityEndTime = '';
  let unityFormat = 'STANDARD';
  let unityCategory = 'LOCAL';
  let unityUrl = '';
  let unityDescription = 'A event created from okane eventlink tool.';

  let eventlinkStandings: EventlinkStandings = [];
  let fetchedEventlinkStandingsData: RawStanding[] = [];

  let useTopCut = false;
  let topCutSize = 4;

  const CHROME_STORE_URL = "https://chromewebstore.google.com/detail/<your-extension>/<store-id>";
  const GITHUB_FRONTEND_URL = "https://github.com/okane-no/unity-tool-frontend";
  const GITHUB_EXTENSION_URL = "https://github.com/okane-no/unity-tool-extension";
  const TOS_VERSION = "2025-09-08";
  const TOS_COOKIE  = `okane_tos_${TOS_VERSION}`;
  const HEADER_OFFSET = 96;   
  const SLIDE_MS = 400;   
  let tosAccepted = false;

  // Published Web Store ID (stable in prod)
  const STORE_EXTENSION_ID = (import.meta as any).env?.VITE_OKANE_STORE_ID ?? "llmhmmabbnehnlkmgpkccmedfpijkhhc";

  let extInstalled = false;
  let checking = false;
  let statusMsg = "";



  function autoSelectTopCut() {
    if (useTopCut) {
      topCutSize = eventlinkStandings.length > 16 ? 8 : 4;
    }
  }

  let showToast = false;
  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';

  const handleUnityLogin = () => {
    loginWithUnityLeague()
  };

  async function CheckEventlinkCookie() {
		try {
			error = null;
			storeid = await getStoreId();
      eventlinkStoreId = storeid;
			loggedeventlink = true;
		} catch (err: any) {
			error = err.message;
			console.error(err);
		}
	}

  const handleVerifyStore = async () => {
    verifyingStore = true;
    loadingEventlinkCookies = true;
    try {
      await CheckEventlinkCookie();
      if (loggedeventlink) {
        eventlinkLoggedIn = true;
      } else {
        eventlinkLoggedIn = false;
        eventlinkStoreId = null;
        loggedeventlink = false
        showToastMessage('Store not found. Please login to Eventlink and retry.', 'error');
      }
    } catch (e) {
      showToastMessage('Failed to verify store', 'error');
    } finally {
      verifyingStore = false;
      loadingEventlinkCookies = false;
    }
  };

  let loadingEvents = false;
  let loadingEventlinkCookies = false
  let uploadingNewUnityEvent = false

const fetchEventlinkEvents = async () => {
  searchedForEvent = false
  if (!selectedDate) {
    showToastMessage('Please select a date first', 'error');
    return;
  }
  loadingEvents = true;
  const result = await getCalender();
  eventlinkEvents = result.data;
  if(eventlinkEvents.length == 0){
    searchedForEvent = true
  }
  selectedEventlinkEvent = result.data[0];
  showToastMessage('Fetched events for ' + selectedDate, 'success');
  loadingEvents = false;
};

async function getCalender() {
		try {
			const cookies = await requestCookiesFromExtension();
      if(eventlinkStoreId == null){
        throw error;
      }

			const calendarData = await fetchCalendarEvents(selectedDate, eventlinkStoreId, cookies);
			console.log('📅 Events:', calendarData);

      return calendarData
		} catch (err) {
			console.error('❌ Error in EventLink flow:', err);
		}
	}

  const loadMyUnityEvents = () => {
    unityEvents = [
      { name: 'Legacy Cup', date: '2025-07-01', api_url: 'unity-1' },
      { name: 'Summer Standard Showdown', date: '2025-07-15', api_url: 'unity-2'}
    ];
    showToastMessage('Loaded your Unity events', 'success');
  };

const handlePushToUnity = async () => {

  await tick();
  try {
			error = null;
      uploadingNewUnityEvent = true
      const buildedUnityEvent = buildUnityEvent()
      const createEventResult = await createUnityEvent(buildedUnityEvent);
			await uploadUnityResults(createEventResult?.api_url, eventlinkStandings);
			uploadSuccess = true;
      showToastMessage('Event pushed to Unity successfully!', 'success');
      uploadingNewUnityEvent = false
		} catch (err: any) {
			error = err.message;
      showToastMessage('Event failed to push to Unity!', 'error');
			console.error(err);
      uploadingNewUnityEvent = false
		}

  
};

const ReloadPage = async () => {
  await new Promise(requestAnimationFrame);
  window.location.reload();
};

function resetToStep3() {
  selectedDate = '';
  currentStep = 3;
  loadingEvents = false;       
  eventlinkEvents = [];
  selectedEventlinkEvent = null;
  eventlinkStandings = [];
  fetchedEventlinkStandingsData = []
  loadingStep5 = false;
  uploadingNewUnityEvent = false;        
  uploadSuccess = false; 
  useTopCut = false; 
  searchedForEvent = false;           
  topCutSize = 4;

  unityName = '';
  unityDate = '';
  unityStartTime = '';
  unityEndTime = '';
  unityFormat = 'STANDARD';
  unityCategory = 'LOCAL';
  unityUrl = '';
  unityDescription = 'A event created from okane eventlink tool.';
}

let loadingStep5 = false;

const handleNextToStep5 = async () => {
  
  loadingStep5 = true;
  searchedForEvent = false
  if (selectedEventlinkEvent) {
      if(eventlinkStoreId == null){
        throw error;
      }
      if(selectedEventlinkEvent.url == null){
        throw error;
      }
      try{
      const cookies = await requestCookiesFromExtension();
			const eventUrl = selectedEventlinkEvent.url;
			const result = await fetchEventDetails(eventUrl, eventlinkStoreId, cookies);
      selectedEventlinkEvent = result.data[0];
      fetchedEventlinkStandingsData = result.data[1][0];
      eventlinkStandings = toEventlinkStandings(fetchedEventlinkStandingsData);
      showToastMessage('Fetched details for ' + selectedEventlinkEvent?.title, 'success');
      }
      catch{
        loadingStep5 = false;
        showToastMessage('Failed to fetch details for ' + selectedEventlinkEvent?.title, 'error');
      }
      
		}

    goTo(5)
  //currentStep = 5;
  
};

  function showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    toastMessage = message;
    toastType = type;
    showToast = true;
    setTimeout(() => (showToast = false), 3000);
  }


let rankToIndexes: Map<number, number[]> = new Map();

function toEventlinkStandings(rows: RawStanding[]): EventlinkStandings {
  const parseRecord = (rec: string): [number, number, number] => {
    const norm = rec.replace(/[–—-]/g, "/");
    const m = norm.match(/^\s*(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)\s*$/);
    if (!m) return [0, 0, 0];
    const wins = parseInt(m[1], 10);
    const losses = parseInt(m[2], 10);
    const draws = parseInt(m[3], 10);
    return [wins, losses, draws];
  };

  return rows.map(({ name, record }) => {
    const [wins, losses, draws] = parseRecord(record);
    return {
      player: name,
      win_count: wins,
      draw_count: draws,
      loss_count: losses,
    };
  });
}

function checkForDuplicateRanks() {
  if (!useTopCut) return;

  const newMap = new Map<number, number[]>();

  eventlinkStandings.forEach((player, index) => {
    const rank = player.single_elimination_result;
    if (index < topCutSize && rank && !isNaN(rank as number)) {
      if (!newMap.has(rank)) {
        newMap.set(rank, []);
      }
      newMap.get(rank)?.push(index);
    }
  });

  rankToIndexes = newMap; // <-- trigger reactivity

  let hasDuplicate = false;
  newMap.forEach((indexes) => {
    if (indexes.length > 1) {
      hasDuplicate = true;
    }
  });

  if (hasDuplicate) {
    showToastMessage('Duplicate ranks detected. Please assign unique top cut placements.', 'error');
  }
}

$: if (selectedEventlinkEvent) {
  SeletectedEventUpdated(selectedEventlinkEvent);
}

function SeletectedEventUpdated(selectedEvent: DetailedEventlinkEvent) {
  if (selectedEvent == undefined || selectedEvent == null){
    return
  }

  if (selectedEvent.title?.trim())       unityName      = selectedEvent.title.trim();
  if (selectedEvent.format?.trim())      unityFormat    = selectedEvent.format.trim().toUpperCase();

  if (selectedEvent.date?.trim()) {
    const d = new Date(selectedEvent.date);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      unityDate = `${yyyy}-${mm}-${dd}`;
    }
  }

  if (selectedEvent.time?.trim()) {
    const raw = selectedEvent.time.trim();

    const m = raw.match(/^\s*(\d{1,2})(?::?(\d{1,2}))?\s*(a\.?m\.?|p\.?m\.?)?\s*$/i);
    if (m) {
      let h = parseInt(m[1], 10);
      let min = m[2] ? parseInt(m[2], 10) : 0;
      const meridiem = m[3]?.replace(/\./g, '').toLowerCase(); 

      if (meridiem) {
        h = h % 12;
        if (meridiem === 'pm') h += 12;
      }

      h = Math.max(0, Math.min(23, h));
      min = Math.max(0, Math.min(59, min));
      unityStartTime = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
  }
}

const normalizeTime = (t?: string | null): string | null => {
  if (!t) return null;
  const s = t.trim();
  if (!s) return null;
  return s.length === 5 ? `${s}:00` : s;
};

function buildUnityEvent(): UnityEvent {
  return {
    name: unityName.trim(),
    date: unityDate,
    start_time: normalizeTime(unityStartTime), 
    end_time: normalizeTime(unityEndTime),     
    format: unityFormat as UnityFormat,
    category: unityCategory as UnityCategory,
    url: (unityUrl ?? "").trim(),              
    description: (unityDescription ?? "").trim(), 
  };
}



	let loggedeventlink = false;
  let storeid: any | null = null;

  function loginWithUnityLeague() {
		startUnityOAuthLogin();
	}

  function logoutWithUnityLeague() {
		localStorage.removeItem('unity_access_token');
		user.set(null);
		loggedIn.set(false);
		window.location.reload();
	}



onMount(async () => {
    if (browser) tosAccepted = getCookie(TOS_COOKIE) === "1";
    if (getCookie(WIZARD_STARTED_COOKIE) === "1") {
      currentStep = Math.max(currentStep, 1); 
    }
		if (!browser) return;
		const tokenUnity = localStorage.getItem('unity_access_token');
		if (!tokenUnity) return;
		try {
			const result = await verifyUnityAccessToken(tokenUnity);
			unityLoggedIn = true;
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

  onMount(detectExtension);


    $: startHelpText = extInstalled
    ? "Extension ready — you're good to go."
    : "The helper extension is required to continue.";

  const injectedId = () => (window as any).__OKANE_EXTENSION_ID__ as string | undefined;

  function sendMessageTo(id: string, payload: unknown): Promise<any> {
    return new Promise((resolve, reject) => {
      
      const api = window.chrome?.runtime?.sendMessage;
      if (!api) return reject(new Error("Extension messaging API unavailable."));
      
      window.chrome.runtime.sendMessage(id, payload, (response: any) => {
        
        const err = window.chrome.runtime.lastError;
        if (err) return reject(new Error(err.message));
        if (response == null) return reject(new Error("No response from extension."));
        resolve(response);
      });
    });
  }

  async function detectExtension() {
    checking = true;
    statusMsg = "";
    extInstalled = false;

    const candidateId = injectedId() || STORE_EXTENSION_ID;
    if (!candidateId) {
      statusMsg = "Extension ID not available. Install the extension or expose runtime id with a content script.";
      checking = false;
      return;
    }

    try {
      await sendMessageTo(candidateId, { type: "PING" }); // background should reply truthy
      extInstalled = true;
      statusMsg = "Extension detected.";
    } catch (e: any) {
      statusMsg = e?.message ?? "Could not reach the extension.";
    } finally {
      checking = false;
    }
  }

  function getCookie(name: string): string | null {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(
    name: string, value: string, days = 365,
    { secure = location.protocol === "https:", sameSite = "Lax", path = "/" } = {}
  ) {
    const d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    let cookie = `${name}=${encodeURIComponent(value)}; Expires=${d.toUTCString()}; Path=${path}; SameSite=${sameSite}`;
    if (secure) cookie += "; Secure";
    document.cookie = cookie;
  }

  function acceptTos() {
    setCookie(TOS_COOKIE, "1");
    tosAccepted = true;
  }

  $: startDisabled = !extInstalled || !tosAccepted;

  const stepTitle = (n: number) =>
    n === 0 ? "How to — Before you start" :
    n === 1 ? "Login to Unity" :
    n === 2 ? "Verify StoreID" :
    n === 3 ? "Choose Upload Target" :
    n === 4 ? "Select Event" :
              "Review & Push";

    const WIZARD_STARTED_COOKIE = "okane_wizard_started_v1";

    function startSetup() {
    setCookie(WIZARD_STARTED_COOKIE, "1");
    currentStep = 1;
  }


  async function goTo(step: number) {
    currentStep = step;
    await tick();
    requestAnimationFrame(() => scrollToStep(step));
    setTimeout(() => scrollToStep(step), SLIDE_MS + 50);
  }

  function scrollToStep(step: number) {
    const el = document.getElementById(`step-${step}`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const targetY = rect.top + window.scrollY - HEADER_OFFSET;

    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }
/// Calender fix while cant use other than current month
    const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const now = new Date();
  const minDate = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
  const maxDate = fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  // Optional: clear/clamp if user somehow sets a date outside the month
  $: if (selectedDate && (selectedDate < minDate || selectedDate > maxDate)) {
    selectedDate = minDate;
  }

</script>

<svelte:head>
  <title>Eventlink → Unity Sync</title>
  <meta name="description" content="Sync Eventlink results from Wizards Eventlink to Unity League." />
</svelte:head>

{#if showToast}
  <div class="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
    <div class="px-4 py-2 rounded shadow text-white" class:bg-green-600={toastType === 'success'} class:bg-red-600={toastType === 'error'}>
      {toastMessage}
    </div>
  </div>
{/if}

<div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
  <h1 class="text-2xl font-bold">🔄 Sync Eventlink → Unity</h1>
    <p class="mt-1 text-xs text-zinc-500">
      <span class="opacity-70">Gadget No.</span>
      <span class="ml-1 inline-flex items-center gap-1 font-mono px-1.5 py-0.5 rounded border border-zinc-200  bg-zinc-50 ">
        FG-204 <span class="opacity-70">(β)</span>
      </span>
      <span class="ml-2 opacity-70">beta build</span>
    </p>


        {#each [0,1,2,3,4,5] as stepId}
    <div
    id={`step-${stepId}`}
    class="max-w-3xl mx-auto mb-4 rounded-2xl border border-zinc-200 bg-white/70 shadow-sm rounded-2xl overflow-hidden scroll-mt-24"
  >
    <div class="px-5 py-3 border-b border-zinc-200  rounded-t-2xl bg-zinc-50/70  flex items-center justify-between">
      <h2 class="text-lg font-semibold">
        {stepId}. {stepTitle(stepId)}
      </h2>

      {#if stepId < currentStep
    || (stepId === 5 && (
          (Boolean(unityFormat?.trim()) && Boolean(unityDate?.trim()) && Boolean((unityStartTime?.trim?.() ?? "")))
          || selectedUnityEvent
       ))
  }
    <span class="text-green-600">✅</span>
  {/if}
    </div>

    {#if currentStep === stepId}
      <div class="p-5 space-y-4" transition:slide|local>
          {#if stepId === 0}
      
    <p class="text-sm text-zinc-700 ">
      This wizard syncs an Eventlink event to Unity League. You’ll log in, pick the source event, preview, and push. One-click sync — no manual data entry in Unity.
    </p>

    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-xl border border-zinc-200  p-4">
        <h3 class="text-sm font-semibold mb-1">What you need</h3>
        <ul class="text-sm list-disc ml-5 space-y-1">
          <li>Unity account (organizer)</li>
          <li>A logged in Eventlink account in the same browser</li>
          <li>Eventlink → Unity Sync Helper extension installed on Chrome</li>
        </ul>
      </div>
      <div class="rounded-xl border border-zinc-200  p-4">
        <h3 class="text-sm font-semibold mb-1">What this does</h3>
        <ul class="text-sm list-disc ml-5 space-y-1">
          <li>Reads Eventlink data via your browser session</li>
          <li>Creates/updates a Unity event and uploads results</li>
          <li>Lets you preview and confirm before pushing to Unity</li>
        </ul>
      </div>
    </div>

    <div class="rounded-xl border p-4"
         class:border-emerald-200={extInstalled}
         class:bg-emerald-50={extInstalled}
         class:border-amber-200={!extInstalled}
         class:bg-amber-50={!extInstalled}>
      <div class="flex items-center gap-2">
        {#if extInstalled}
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
          <span class="text-sm font-medium text-emerald-900">Extension detected</span>
        {:else}
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs">!</span>
          <span class="text-sm font-medium text-amber-900">Extension not detected</span>
        {/if}
      </div>
      <div class="text-sm mt-1">{checking ? "Checking…" : statusMsg}</div>

      <div class="mt-3 flex flex-wrap gap-2">
        <a
            class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition"
            class:opacity-50={extInstalled}
            class:cursor-not-allowed={extInstalled}
            class:pointer-events-none={extInstalled}
            aria-disabled={extInstalled}
            rel="noopener noreferrer"
            target="_blank"
            href={CHROME_STORE_URL}
            title={extInstalled ? "Extension detected — no need to install" : "Install from Chrome Web Store"}
        >
        {#if !extInstalled}
        Install from Chrome Web Store
    {:else}
      Extension is already installed
    {/if}

        </a>
        <button class="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:opacity-90 disabled:opacity-50"
                on:click={detectExtension} disabled={checking}>
          Re-check
        </button>
      </div>
    </div>
<div class="mt-4 rounded-xl border border-zinc-200 p-4">
  <label class="flex items-start gap-3">
    <input
      type="checkbox"
      class="mt-1 h-4 w-4 rounded border-zinc-300"
      checked={tosAccepted}
      on:change={(e) => e.currentTarget.checked && acceptTos()}
    />
    <span class="text-sm text-zinc-700 ">
      I have read and agree to the
      <a href="/tos" target="_blank" rel="noopener" class="underline decoration-dotted underline-offset-4">Terms of Use</a>
      and
      <a href="/privacy" target="_blank" rel="noopener" class="underline decoration-dotted underline-offset-4">Privacy Policy</a>.
    </span>
  </label>
  {#if !tosAccepted}
    <p class="mt-2 text-xs text-zinc-500">You must accept to proceed.</p>
  {/if}
</div>

<div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-3">
  <button
    class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-50"
    on:click={startSetup}
    disabled={startDisabled}
    aria-disabled={startDisabled}
  >
    Start
  </button>

  <p class="mt-2 sm:mt-0 sm:ml-2 text-sm leading-6"
     class:text-emerald-700={extInstalled && tosAccepted}
     class:text-zinc-500={!extInstalled || !tosAccepted}>
    {#if !extInstalled}
      Install/enable the helper extension to continue.
    {:else if !tosAccepted}
      Please accept the Terms to continue.
    {:else}
      Extension ready — you're good to go.
    {/if}
  </p>
</div>
          {:else if stepId === 1}
            {#if unityLoggedIn}
              <div class="max-w-xl rounded-2xl border border-zinc-200  bg-white/70 shadow-sm p-5">
                <div class="flex items-start gap-4">
                  <div class="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-base font-semibold shadow">
                    {(() => {
                      const dn = [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ') || userInfo.username;
                      return dn.split(/\s+/).slice(0,2).map((p: string[]) => p[0]?.toUpperCase() ?? '').join('') || 'U';
                    })()}
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h3 class="text-lg font-semibold text-zinc-900  truncate">
                        {([userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ') || userInfo.username)}
                      </h3>
                      <span class="px-2 py-0.5 text-xs rounded-full bg-zinc-100  text-zinc-700  border-zinc-200 ">
                        {userInfo.username}
                      </span>
                    </div>

                    <p class="mt-1 text-sm text-zinc-600  break-all">
                      <a class="underline decoration-dotted underline-offset-4" href={"mailto:" + userInfo.email}>
                        {userInfo.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <button class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50" on:click={logoutWithUnityLeague}>Logout</button>
            {:else}
              <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" on:click={handleUnityLogin}>Login to Unity</button>
            {/if}
            <div class="flex gap-2">
              <button class="bg-gray-300 px-4 py-2 rounded mt-4 hover:bg-gray-400" on:click={() => currentStep = 0}>Back</button>
              <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4 disabled:opacity-50" on:click={() => currentStep = 2} disabled={!unityLoggedIn}>Next</button>
            </div>

            {:else if stepId === 2}
            {#if eventlinkLoggedIn}
              <p>✅ Eventlink Store is valid</p>
              {#if eventlinkStoreId}
                <p>Store ID: {eventlinkStoreId}</p>
              {/if}
            {:else}
              <p>❌ No verified StoreID</p>
              <p>If the verification fails, please open eventlink.wizards.com in a tab and login manually, then try to verify again.</p>
              <button class="bg-blue-600 text-white px-4 py-2 rounded  hover:bg-blue-700 disabled:opacity-50" on:click={handleVerifyStore} disabled={loadingEventlinkCookies}>
				    {#if loadingEventlinkCookies}
					<svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
				    {:else}
					Verify StoreID
				{/if}
				</button>
            {/if}
            <div class="flex gap-2">
              <button class="bg-gray-300 px-4 py-2 rounded  hover:bg-gray-400" on:click={() => currentStep = 1}>Back</button>
              <button class="bg-blue-600 text-white px-4 py-2 rounded  hover:bg-blue-700 disabled:opacity-50" on:click={() => currentStep = 3} disabled={!eventlinkStoreId}>Next</button>

            </div>

          {:else if stepId === 3}
            <label><input type="radio" bind:group={unityTarget} value="new" /> Create new Unity event</label>
            <label><input type="radio" bind:group={unityTarget} value="existing" /> Use existing Unity event</label>
            <div class="flex gap-2">
              <button class="bg-gray-300 px-4 py-2 rounded mt-4 hover:bg-gray-400" on:click={() => currentStep = 2}>Back</button>
              <button class="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700 disabled:opacity-50" on:click={() => currentStep = 4} disabled={!unityTarget}>Next</button>
            </div>

          {:else if stepId === 4}
            {#if unityTarget === 'new'}
            <!-- Calender fix for when all months is ok -->
              <!-- <label>Date: <input class="w-full border rounded px-2 py-1" type="date" bind:value={selectedDate} /></label> -->
               <label class="block text-sm font-medium">
                  Date:
                  <input
                    class="w-full border rounded px-2 py-1"
                    type="date"
                    bind:value={selectedDate}
                    min={minDate}
                    max={maxDate}
                  />
              </label>
              <div class="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span class="font-semibold">NB:</span> For now, event search is limited to the <span class="font-medium"> current calendar month</span>.
          </div>
              <button class="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700 disabled:opacity-50" on:click={fetchEventlinkEvents} disabled={loadingEvents}>
				{#if loadingEvents}
					<svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
				{:else}
					Fetch Eventlink Events
          
				{/if}

				</button>
              {#if eventlinkEvents.length > 0}
                <label>
                  <br>Choose Event:
                  <select class="w-full border rounded px-2 py-1 mt-1" bind:value={selectedEventlinkEvent}>
                    <option value="" disabled>-- Select an event --</option>
                    {#each eventlinkEvents as event}
                      <option value={event}>{event.title} - {selectedDate}</option>
                    {/each}
                  </select>
                </label>
              {/if}
              {#if eventlinkEvents.length == 0 && searchedForEvent}
              ❌ No events found at {selectedDate}
              {/if}
            {:else}
              <button class="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700 disabled:opacity-25" disabled={true} on:click={loadMyUnityEvents}>Load My Events</button>
              <div class="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span class="font-semibold">NB:</span> Will be active in next patch.
          </div>
              
              
              {#if unityEvents.length > 0}
                <label>
                  Choose Unity Event:
                  <select class="w-full border rounded px-2 py-1" disabled={true} bind:value={selectedUnityEvent}>
                    <option value="" disabled>-- Select event --</option>
                    {#each unityEvents as event}
                      <option value={event.api_url}>{event.name} - {event.date}</option>
                    {/each}
                  </select>
                </label>
              {/if}
            {/if}
            <div class="flex gap-2">
              <button class="bg-gray-300 px-4 py-2 rounded mt-2 hover:bg-gray-400" on:click={() => currentStep = 3}>Back</button>
              <button class="bg-blue-600 text-white px-4 py-2 mt-2 rounded hover:bg-blue-700 disabled:opacity-50" on:click={handleNextToStep5} disabled={!selectedEventlinkEvent && !selectedUnityEvent || loadingStep5}>
  {#if loadingStep5}
    <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
  {:else}
    Next
  {/if}
</button>
            </div>

          {:else if stepId === 5}
            <input class="w-full border rounded px-2 py-1" type="text" placeholder="Event Name" bind:value={unityName} />
            <input class="w-full border rounded px-2 py-1" type="date" bind:value={unityDate} />
            <input class="w-full border rounded px-2 py-1" type="time" placeholder="Start Time" bind:value={unityStartTime} />
            <input class="w-full border rounded px-2 py-1" type="time" placeholder="End Time" bind:value={unityEndTime} />
            <select class="w-full border rounded px-2 py-1" bind:value={unityFormat}>
              <option value="STANDARD">Standard</option>
              <option value="MODERN">Modern</option>
              <option value="PIONEER">Pioneer</option>
              <option value="LEGACY">Legacy</option>
              <option value="COMMANDER">Commander</option>
            </select>
            <select class="w-full border rounded px-2 py-1" bind:value={unityCategory}>
              <option value="LOCAL">Local</option>
              <option value="REGIONAL">Regional</option>
              <option value="NATIONAL">National</option>
            </select>
            <input class="w-full border rounded px-2 py-1" type="text" placeholder="Website URL (optional)" bind:value={unityUrl} />
            <textarea class="w-full border rounded px-2 py-1" rows="3" placeholder="Description" bind:value={unityDescription} />
            <h4 class="font-semibold">Standings</h4>

<div class="flex items-center gap-4 mb-2">
  <label class="flex items-center gap-2">
    <input type="checkbox" bind:checked={useTopCut} on:change={autoSelectTopCut} /> Enable Top Cut
  </label>
  {#if useTopCut}
    <div>
      <label class="mr-2">Top Cut Size:</label>
      <select bind:value={topCutSize} class="border rounded px-2 py-1">
        <option value={4}>Top 4</option>
        <option value={8}>Top 8</option>
      </select>
    </div>
  {/if}
</div>

<div class="max-h-60 overflow-y-auto border rounded">
  <table class="w-full table-auto text-sm">
    <thead class="bg-gray-100">
      <tr>
        <th class="border px-2 py-1 text-left">Player</th>
        <th class="border px-2 py-1">W</th>
        <th class="border px-2 py-1">D</th>
        <th class="border px-2 py-1">L</th>
        {#if useTopCut}
          <th class="border px-2 py-1">Top cut result</th>
        {/if}
        
      </tr>
    </thead>
    <tbody>
      {#each eventlinkStandings as player, i}
        <tr>
          <td class="border px-2 py-1">
            <input type="text" class="w-full border px-1 py-0.5 rounded" bind:value={eventlinkStandings[i].player} />
          </td>
          <td class="border px-2 py-1">
            <input type="number" class="w-16 border px-1 py-0.5 rounded text-center" min="0" bind:value={eventlinkStandings[i].win_count} />
          </td>
          <td class="border px-2 py-1">
            <input type="number" class="w-16 border px-1 py-0.5 rounded text-center" min="0" bind:value={eventlinkStandings[i].draw_count} />
          </td>
          <td class="border px-2 py-1">
            <input type="number" class="w-16 border px-1 py-0.5 rounded text-center" min="0" bind:value={eventlinkStandings[i].loss_count} />
          </td>
          {#if useTopCut}
          <td class="border px-2 py-1">
            {#if useTopCut && i < topCutSize}
              <select
                class={`w-full border rounded px-1 py-0.5 text-sm ${
                  Array.from(rankToIndexes.entries()).some(
                    ([_, indexes]) => indexes.length > 1 && indexes.includes(i)
                  ) ? 'border-red-500 ring-2 ring-red-300' : ''
                }`}
                bind:value={eventlinkStandings[i].single_elimination_result}
                on:change={() => checkForDuplicateRanks()}
              >
                <option value="">Unranked</option>
                {#each Array(topCutSize).fill(0).map((_, j) => j + 1) as rank}
                  <option value={rank}>#{rank}</option>
                {/each}
              </select>
            {:else}
              <span class="text-gray-400 italic">—</span>
            {/if}
          </td>
        {/if}
          
        </tr>
      {/each}
    </tbody>
  </table>
</div>

            <div class="flex gap-2">
              
              {#if !uploadSuccess}
              <button class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400" on:click={resetToStep3}>Restart process</button>
              <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50" on:click={handlePushToUnity} disabled={uploadingNewUnityEvent}>
                {#if uploadingNewUnityEvent}
					      <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
				        {:else}
					        🚀 Push to Unity
				        {/if}
                </button>
                {:else}
                <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" on:click={resetToStep3}>
					        Start a new upload
                </button>
                {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<footer class="fixed bottom-3 left-1/2 -translate-x-1/2 z-50
                rounded-full border border-zinc-200/60
                bg-white/80 backdrop-blur
                px-2 py-1 text-[10px] leading-4 text-zinc-500 shadow">
  <div class="flex items-center gap-2">
    <span class="inline-flex items-center gap-1 rounded bg-zinc-100  px-1.5 py-0.5 font-mono">
      <span class="opacity-60">sha</span>
      <code title={COMMIT_SHA}>{COMMIT_SHA.slice(0, 7) || 'dev'}</code>
    </span>

    {#if BUILD_TIME}
      <span class="opacity-50">•</span>
      <time title={BUILD_TIME}>{new Date(BUILD_TIME).toLocaleString()}</time>
    {/if}

    <span class="opacity-50">•</span>
    <a href="/__meta" target="_blank" rel="noopener"
       class="underline decoration-dotted underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300">
      meta
    </a>

    <span class="opacity-50">•</span>
    <a
      class="px-1.5 py-0.5 rounded-md border border-zinc-200  text-[10px]
             hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
      rel="noopener noreferrer" target="_blank" href={GITHUB_FRONTEND_URL}
    >
      GitHub · Frontend
    </a>
    <span class="opacity-50">•</span>
    <a
      class="px-1.5 py-0.5 rounded-md border border-zinc-200  text-[10px]
             hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
      rel="noopener noreferrer" target="_blank" href={GITHUB_EXTENSION_URL}
    >
      GitHub · Extension
    </a>
  </div>
</footer>
