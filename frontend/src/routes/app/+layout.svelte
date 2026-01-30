<script lang="ts">
	import { goto } from '$app/navigation';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import Player from '$lib/components/Player.svelte';
	import PlayerFull from '$lib/components/PlayerFull.svelte';
	import { getPlayer } from '$lib/player.svelte.js';
	import { getAuth } from '$lib/store.svelte.js';

	let { children } = $props();
	const auth = getAuth();
	const player = getPlayer();

	$effect(() => {
		if (auth.initialized && !auth.authenticated) {
			goto('/');
		}
	});
</script>

{#if !auth.initialized}
	<div class="flex min-h-dvh items-center justify-center">
		<div class="text-text-muted">Loading...</div>
	</div>
{:else if auth.authenticated}
	<div class="flex min-h-dvh flex-col">
		<main class="flex-1 {player.hasEpisode ? 'pb-36' : 'pb-20'}">
			{@render children()}
		</main>
		<Player />
		<BottomNav />
		<PlayerFull />
	</div>
{/if}
