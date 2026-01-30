<script lang="ts">
	import { getProxyImageUrl } from '$lib/api.js';
	import EpisodeCard from '$lib/components/EpisodeCard.svelte';
	import { addSubscription, getUserData, removeSubscription } from '$lib/store.svelte.js';
	import { showToast } from '$lib/toast.svelte.js';
	import type { Subscription } from '$lib/types.js';

	let { data } = $props();

	const store = getUserData();

	let subscribed = $derived(
		store.data.subscriptions.some((s) => s.podcast_id === String(data.podcastId))
	);

	async function handleSubscribe() {
		const sub: Subscription = {
			podcast_id: String(data.podcastId),
			title: data.podcast.title,
			author: data.podcast.author,
			artwork: data.podcast.artwork,
			feedUrl: data.podcast.url,
			subscribed_at: new Date().toISOString(),
			episode_count: data.podcast.episodeCount,
			settings: {
				playback_speed: store.data.preferences.default_playback_speed,
				skip_forward_seconds: store.data.preferences.default_skip_forward,
				skip_backward_seconds: store.data.preferences.default_skip_backward
			}
		};
		await addSubscription(sub);
		showToast('Subscribed');
	}

	async function handleUnsubscribe() {
		await removeSubscription(String(data.podcastId));
		showToast('Unsubscribed');
	}

	function stripHtml(html: string): string {
		return html.replace(/<[^>]*>/g, '');
	}
</script>

<div class="mx-auto max-w-lg px-4 pt-4">
	<a href="/app/search" class="text-text-muted hover:text-text-secondary mb-4 inline-flex items-center gap-1 text-sm">
		<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path d="M15 19l-7-7 7-7" />
		</svg>
		Back
	</a>

	<div class="mb-6 flex gap-4">
		<img
			src={getProxyImageUrl(data.podcast.artwork)}
			alt={data.podcast.title}
			class="h-28 w-28 shrink-0 rounded-xl object-cover shadow-lg"
		/>
		<div class="flex min-w-0 flex-col justify-center">
			<h1 class="text-lg font-bold leading-tight">{data.podcast.title}</h1>
			<p class="text-text-secondary mt-0.5 text-sm">{data.podcast.author}</p>
			<p class="text-text-muted mt-1 text-xs">{data.podcast.episodeCount} episodes</p>

			<button
				onclick={subscribed ? handleUnsubscribe : handleSubscribe}
				class="mt-3 self-start rounded-lg px-4 py-2 text-sm font-medium transition-colors {subscribed
					? 'bg-surface-overlay text-text-secondary hover:bg-red-900/30 hover:text-red-300'
					: 'bg-brand hover:bg-brand-hover text-white'}"
			>
				{subscribed ? 'Unsubscribe' : 'Subscribe'}
			</button>
		</div>
	</div>

	{#if data.podcast.description}
		<details class="border-border mb-6 border-b pb-4">
			<summary class="text-text-secondary cursor-pointer text-sm font-medium">About</summary>
			<p class="text-text-secondary mt-2 text-sm leading-relaxed">
				{stripHtml(String(data.podcast.description))}
			</p>
		</details>
	{/if}

	<h2 class="mb-3 text-base font-semibold">Episodes</h2>
	<div class="flex flex-col gap-2">
		{#each data.episodes as episode (episode.id)}
			<EpisodeCard {episode} podcastId={data.podcastId} />
		{/each}
	</div>

	{#if data.episodes.length === 0}
		<p class="text-text-muted py-8 text-center text-sm">No episodes found</p>
	{/if}
</div>
