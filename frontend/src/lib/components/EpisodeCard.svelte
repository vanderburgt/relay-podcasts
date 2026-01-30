<script lang="ts">
	import EpisodeStatus from '$lib/components/EpisodeStatus.svelte';
	import { loadEpisode } from '$lib/player.svelte.js';
	import { addToQueue, getUserData } from '$lib/store.svelte.js';
	import { showToast } from '$lib/toast.svelte.js';
	import type { Episode, EpisodeProgress } from '$lib/types.js';

	interface Props {
		episode: Episode;
		podcastId?: number;
		showPodcastTitle?: boolean;
		showRemoveButton?: boolean;
		onRemove?: () => void;
	}

	let { episode, podcastId, showPodcastTitle = false, showRemoveButton = false, onRemove }: Props = $props();

	const store = getUserData();

	let episodeProgress = $derived<EpisodeProgress | undefined>(
		store.data.episode_progress[String(episode.id)]
	);

	let status = $derived<'new' | 'in_progress' | 'completed'>(episodeProgress?.status ?? 'new');

	let progressPercent = $derived(
		episodeProgress && episodeProgress.duration_seconds > 0
			? (episodeProgress.position_seconds / episodeProgress.duration_seconds) * 100
			: 0
	);

	function formatDate(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatDuration(seconds: number): string {
		if (!seconds) return '';
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		if (h > 0) return `${h}h ${m}m`;
		return `${m}m`;
	}

	async function handlePlay(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		await loadEpisode(String(episode.id), String(podcastId ?? episode.feedId));
	}

	async function handleAddToQueue(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		await addToQueue(String(episode.id));
		showToast('Added to queue');
	}

	function handleRemove(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		onRemove?.();
	}
</script>

<a href="/app/episode/{episode.id}" class="bg-surface-raised block rounded-xl p-3 transition-colors hover:bg-surface-overlay">
	<div class="flex items-start gap-3">
		{#if showPodcastTitle && (episode.feedImage || episode.image)}
			<img
				src={episode.feedImage || episode.image}
				alt=""
				class="h-12 w-12 shrink-0 rounded-lg object-cover"
			/>
		{/if}
		<div class="min-w-0 flex-1">
			{#if showPodcastTitle && episode.feedTitle}
				<p class="text-text-muted mb-0.5 truncate text-[11px]">{episode.feedTitle}</p>
			{/if}
			<h3 class="text-sm font-semibold leading-snug">{episode.title}</h3>
			<div class="text-text-muted mt-1 flex items-center gap-2 text-xs">
				<span>{formatDate(episode.datePublished)}</span>
				{#if episode.duration}
					<span>&middot;</span>
					<span>{formatDuration(episode.duration)}</span>
				{/if}
				<EpisodeStatus {status} progress={progressPercent} />
			</div>
		</div>
		<div class="flex shrink-0 items-center gap-1">
			<button
				onclick={handlePlay}
				class="text-text-muted hover:text-brand flex h-10 w-10 items-center justify-center rounded-full transition-colors"
				aria-label="Play episode"
			>
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
			{#if showRemoveButton}
				<button
					onclick={handleRemove}
					class="text-text-muted hover:text-red-400 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
					aria-label="Remove from queue"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{:else}
				<button
					onclick={handleAddToQueue}
					class="text-text-muted hover:text-brand flex h-10 w-10 items-center justify-center rounded-full transition-colors"
					aria-label="Add to queue"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M12 4v16m8-8H4" />
					</svg>
				</button>
			{/if}
		</div>
	</div>
</a>
