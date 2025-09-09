<script lang="ts">
	let { children } = $props();
	import '../app.css';
</script>
<svelte:head>
  <link rel="icon" type="image/png" href="/favicon.png" sizes="128x128" />
  <link rel="icon" href="/favicon.png" />
</svelte:head>

{@render children()}
