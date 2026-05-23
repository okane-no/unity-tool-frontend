<script lang="ts">
  import { COMMIT_SHA, BUILD_TIME } from '$lib/build-meta';

  const PRODUCT_NAME = 'Okane — Eventlink → Unity Sync';

  type Change = { text: string };
  type Release = { version: string; date: string; title?: string; changes: Change[] };

  // Newest first. Keep entries short and user-facing.
  const releases: Release[] = [
    {
      version: '1.1.0',
      date: '23 May 2026',
      title: 'Multi-organizer, multi-store & smarter syncing',
      changes: [
        { text: 'Multiple Unity organizers: if your account manages more than one organizer, you now choose which one new events are created under — and you confirm it right before pushing, so events no longer land under the wrong organizer.' },
        { text: 'Multiple EventLink stores: if you manage more than one store, you can now pick which store to sync from. Previously the tool got stuck on the store-selection screen.' },
        { text: 'Limited formats fixed: Draft, Sealed, Two-Headed Giant and Prerelease are now sent to Unity as “Limited” automatically. These used to fail to create.' },
        { text: 'Smarter standings: if the last round wasn’t finished, the tool now uses the most recent completed round’s standings instead of coming back empty — and it won’t upload empty results.' },
        { text: 'Reach back 2 weeks: you can now select events from the last 14 days, including into the previous month near a month boundary. (Wizards of the Coast / EventLink only keeps about 2 weeks of event data for data-protection/GDPR reasons.)' },
      ],
    },
    {
      version: '1.0.0',
      date: 'September 2025',
      title: 'Initial release',
      changes: [
        { text: 'Log in to Unity League, verify your EventLink store, pick an event, preview the standings and push results to Unity — with optional top-cut placements.' },
      ],
    },
  ];

  const APP_VERSION = releases[0].version;
</script>

<svelte:head>
  <title>What’s new • {PRODUCT_NAME}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-8">
  <header class="mb-6">
    <a href="/" class="text-sm text-indigo-600 hover:underline">← Back to the app</a>
    <h1 class="mt-2 text-2xl font-bold text-zinc-900">What’s new</h1>
    <p class="mt-1 text-sm text-zinc-600">
      Changes to <span class="font-medium">{PRODUCT_NAME}</span> · current version
      <span class="font-mono">{APP_VERSION}</span>
    </p>
  </header>

  <div class="space-y-4">
    {#each releases as release}
      <section class="rounded-2xl border border-zinc-200 bg-white/70 shadow-sm">
        <div class="px-5 py-3 border-b border-zinc-200 rounded-t-2xl bg-zinc-50/70 flex items-baseline justify-between gap-3">
          <h2 class="text-lg font-semibold">
            <span class="font-mono text-base px-1.5 py-0.5 rounded border border-zinc-200 bg-white">v{release.version}</span>
            {#if release.title}<span class="ml-2">{release.title}</span>{/if}
          </h2>
          <span class="text-xs text-zinc-500 whitespace-nowrap">{release.date}</span>
        </div>
        <ul class="p-5 space-y-2 text-sm leading-6 text-zinc-800 list-disc ml-5">
          {#each release.changes as change}
            <li>{change.text}</li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>

  <p class="mt-6 text-[11px] text-zinc-400 font-mono">
    build {COMMIT_SHA?.slice(0, 7) || 'dev'}{#if BUILD_TIME} · {new Date(BUILD_TIME).toLocaleString()}{/if}
  </p>
</main>
