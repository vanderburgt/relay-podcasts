<script lang="ts">
	import { getEpisodes } from '$lib/api.js';
	import EpisodeCard from '$lib/components/EpisodeCard.svelte';
	import { getUserData } from '$lib/store.svelte.js';
	import type { Episode } from '$lib/types.js';

	const store = getUserData();

	let episodes = $state<Episode[]>([]);
	let loading = $state(false);
	let loaded = $state(false);

	$effect(() => {
		const subs = store.data.subscriptions;
		if (subs.length > 0 && !loaded) {
			loadFeed(subs.map((s) => Number(s.podcast_id)));
		} else if (subs.length === 0) {
			episodes = [];
			loaded = true;
		}
	});

	async function loadFeed(podcastIds: number[]) {
		loading = true;
		try {
			const results = await Promise.all(podcastIds.map((id) => getEpisodes(id, 10)));
			const all = results.flatMap((r) => r.items ?? []);
			all.sort((a, b) => b.datePublished - a.datePublished);
			episodes = all;
		} catch {
			episodes = [];
		} finally {
			loading = false;
			loaded = true;
		}
	}

	async function refresh() {
		loaded = false;
	}
</script>

<div class="mx-auto max-w-lg px-4 pt-4">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-xl font-bold">Feed</h1>
		{#if store.data.subscriptions.length > 0}
			<button
				onclick={refresh}
				disabled={loading}
				class="text-text-muted hover:text-text-secondary text-sm transition-colors disabled:opacity-50"
			>
				{loading ? 'Loading...' : 'Refresh'}
			</button>
		{/if}
	</div>

	{#if store.data.subscriptions.length === 0}
		<div class="py-16 text-center">
			<p class="text-text-muted text-sm">Subscribe to podcasts to see episodes here</p>
			<a
				href="/app/search"
				class="text-brand hover:text-brand-hover mt-2 inline-block text-sm font-medium"
			>
				Find podcasts
			</a>
		</div>
	{:else if loading && episodes.length === 0}
		<div class="text-text-muted py-12 text-center text-sm">Loading feed...</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each episodes as episode (episode.id)}
				<EpisodeCard {episode} showPodcastTitle />
			{/each}
		</div>
	{/if}
</div>
