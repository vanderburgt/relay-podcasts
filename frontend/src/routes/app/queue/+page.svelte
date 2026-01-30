<script lang="ts">
	import { getEpisode } from '$lib/api.js';
	import EpisodeCard from '$lib/components/EpisodeCard.svelte';
	import { getUserData, removeFromQueue } from '$lib/store.svelte.js';
	import { showToast } from '$lib/toast.svelte.js';
	import type { Episode } from '$lib/types.js';

	const store = getUserData();

	let episodes = $state<Map<string, Episode>>(new Map());
	let loading = $state(true);

	// Fetch episode details when queue changes
	$effect(() => {
		const queueIds = store.data.queue;
		loadEpisodes(queueIds);
	});

	async function loadEpisodes(ids: string[]) {
		loading = true;
		const newEpisodes = new Map<string, Episode>();

		await Promise.all(
			ids.map(async (id) => {
				// Use cached if available
				if (episodes.has(id)) {
					newEpisodes.set(id, episodes.get(id)!);
					return;
				}
				try {
					const result = await getEpisode(Number(id));
					newEpisodes.set(id, result.episode as unknown as Episode);
				} catch {
					// Episode not found, skip
				}
			})
		);

		episodes = newEpisodes;
		loading = false;
	}

	async function handleRemove(episodeId: string) {
		await removeFromQueue(episodeId);
		showToast('Removed from queue');
	}
</script>

<div class="mx-auto max-w-lg px-4 pt-4">
	<h1 class="mb-4 text-xl font-bold">Queue</h1>

	{#if loading && store.data.queue.length > 0}
		<div class="text-text-muted py-16 text-center text-sm">
			<p>Loading...</p>
		</div>
	{:else if store.data.queue.length === 0}
		<div class="text-text-muted py-16 text-center text-sm">
			<p>Your queue is empty</p>
			<p class="mt-1">Add episodes from podcast pages</p>
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each store.data.queue as episodeId, i (episodeId)}
				{@const episode = episodes.get(episodeId)}
				{#if episode}
					<div class="flex items-start gap-2">
						<span class="text-text-muted mt-4 w-5 text-center text-xs font-medium">{i + 1}</span>
						<div class="flex-1">
							<EpisodeCard
								{episode}
								showPodcastTitle={true}
								showRemoveButton={true}
								onRemove={() => handleRemove(episodeId)}
							/>
						</div>
					</div>
				{:else}
					<div class="bg-surface-raised flex items-center gap-3 rounded-xl p-3">
						<span class="text-text-muted w-5 text-center text-xs font-medium">{i + 1}</span>
						<span class="text-text-muted flex-1 truncate text-sm">Episode unavailable</span>
						<button
							onclick={() => handleRemove(episodeId)}
							class="text-text-muted hover:text-red-400 text-sm transition-colors"
							aria-label="Remove from queue"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
