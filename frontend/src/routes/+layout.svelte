<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';
	import { onMount } from 'svelte';
	import { getAuth, getUserData, initAuth } from '$lib/store.svelte.js';
	import { applyTheme } from '$lib/theme.svelte.js';

	let { children } = $props();

	const auth = getAuth();
	const store = getUserData();

	onMount(() => {
		initAuth();
	});

	// Apply theme when it changes
	$effect(() => {
		if (auth.initialized) {
			applyTheme(store.data.preferences.theme);
		}
	});
</script>

<svelte:head>
	<title>Relay</title>
	<meta name="description" content="Privacy-first podcast player" />
</svelte:head>

{@render children()}
<Toast />
