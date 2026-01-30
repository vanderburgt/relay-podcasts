<script lang="ts">
	import { searchPodcasts } from '$lib/api.js';
	import PodcastCard from '$lib/components/PodcastCard.svelte';
	import { getUserData } from '$lib/store.svelte.js';
	import type { Podcast } from '$lib/types.js';

	const store = getUserData();

	let query = $state('');
	let results = $state<Podcast[]>([]);
	let loading = $state(false);
	let searched = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	function isSubscribed(podcastId: number): boolean {
		return store.data.subscriptions.some((s) => s.podcast_id === String(podcastId));
	}

	async function search() {
		const q = query.trim();
		if (!q) {
			results = [];
			searched = false;
			return;
		}

		loading = true;
		searched = true;
		try {
			const data = await searchPodcasts(q);
			results = data.feeds ?? [];
		} catch {
			results = [];
		} finally {
			loading = false;
		}
	}

	function handleInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(search, 400);
	}
</script>

<div class="mx-auto max-w-lg px-4 pt-4">
	<h1 class="mb-4 text-xl font-bold">Search</h1>

	<div class="relative mb-4">
		<svg
			class="text-text-muted pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<input
			type="search"
			bind:value={query}
			oninput={handleInput}
			placeholder="Search podcasts..."
			class="bg-surface-raised border-border text-text-primary placeholder:text-text-muted w-full rounded-xl border py-3 pr-4 pl-10 text-sm focus:border-brand focus:outline-none"
		/>
	</div>

	{#if loading}
		<div class="text-text-muted py-12 text-center text-sm">Searching...</div>
	{:else if searched && results.length === 0}
		<div class="text-text-muted py-12 text-center text-sm">No podcasts found</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each results as podcast (podcast.id)}
				<PodcastCard {podcast} subscribed={isSubscribed(podcast.id)} />
			{/each}
		</div>
	{/if}
</div>
