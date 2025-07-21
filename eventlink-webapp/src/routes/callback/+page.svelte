<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let error: string | null = null;

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      error = 'No code provided';
      return;
    }

    const verifier = localStorage.getItem('unity_pkce_verifier');

    if (!verifier) {
      error = 'Missing PKCE code verifier';
      return;
    }

    try {
      const res = await fetch('http://localhost:5278/api/unity-oauth/exchange-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, verifier })
      });

      const result = await res.json();

      if (!res.ok) {
        error = result.error || 'OAuth failed';
        return;
      }

      console.log('🎉 Token result from backend:', result);

      // Store tokens
      localStorage.setItem('unity_access_token', result.access_token);
	  localStorage.setItem('unity_refresh_token', result.refresh_token);
      localStorage.removeItem('unity_pkce_verifier');

      // Redirect
      goto('/');
    } catch (err) {
      console.error(err);
      error = 'Something went wrong';
    }
  });
</script>

{#if error}
  <p style="color: red;">{error}</p>
{:else}
  <p>Logging you in, please wait...</p>
{/if}