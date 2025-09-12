<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let error: string | null = null;

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (!code) { error = 'No code provided'; return; }

    const verifier = localStorage.getItem('unity_pkce_verifier');
    if (!verifier) { error = 'Missing PKCE code verifier'; return; }

    try {
      console.log("Trying to exhange codes")
      // 🔒 Call SvelteKit proxy; it adds X-Api-Key and forwards to /api/unity-oauth/exchange-code
      const res = await fetch('/api/unity?op=oauth.exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, verifier })
      });

      const result = await res.json();
      if (!res.ok) { error = result.error || 'OAuth failed'; return; }

      // Store tokens (handle snake_case or camelCase)
      const access = result.access_token ?? result.accessToken;
      const refresh = result.refresh_token ?? result.refreshToken;
      if (access) localStorage.setItem('unity_access_token', access);
      if (refresh) localStorage.setItem('unity_refresh_token', refresh);

      localStorage.removeItem('unity_pkce_verifier');

      // Redirect to home (or wherever you want)
      goto('/');
    } catch (e) {
      console.error(e);
      error = 'Something went wrong';
    }
  });
</script>

{#if error}
  <p style="color: red;">{error}</p>
{:else}
  <p>Logging you in, please wait...</p>
{/if}