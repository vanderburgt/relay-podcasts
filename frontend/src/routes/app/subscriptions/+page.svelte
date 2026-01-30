<script lang="ts">
	import PodcastCard from '$lib/components/PodcastCard.svelte';
	import { getUserData } from '$lib/store.svelte.js';
	import type { Podcast } from '$lib/types.js';

	const store = getUserData();

	let subscriptions = $derived(
		store.data.subscriptions.map(
			(s) =>
				({
					id: Number(s.podcast_id),
					title: s.title,
					author: s.author,
					artwork: s.artwork,
					url: s.feedUrl,
					description: '',
					episodeCount: 0,
					categories: {}
				}) satisfies Podcast
		)
	);
</script>

<div class="mx-auto max-w-lg px-4 pt-4">
	<h1 class="mb-4 text-xl font-bold">Subscriptions</h1>

	{#if subscriptions.length === 0}
		<div class="py-16 text-center">
			<p class="text-text-muted text-sm">No subscriptions yet</p>
			<a
				href="/app/search"
				class="text-brand hover:text-brand-hover mt-2 inline-block text-sm font-medium"
			>
				Find podcasts
			</a>
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each subscriptions as podcast (podcast.id)}
				<PodcastCard {podcast} subscribed />
			{/each}
		</div>
	{/if}
</div>
