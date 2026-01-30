<script lang="ts">
	import { getProxyImageUrl } from '$lib/api.js';
	import EpisodeStatus from '$lib/components/EpisodeStatus.svelte';
	import { loadEpisode } from '$lib/player.svelte.js';
	import { addToQueue, getUserData } from '$lib/store.svelte.js';
	import { showToast } from '$lib/toast.svelte.js';
	import type { EpisodeProgress } from '$lib/types.js';

	let { data } = $props();

	const store = getUserData();

	let episodeProgress = $derived<EpisodeProgress | undefined>(
		store.data.episode_progress[String(data.episodeId)]
	);

	let status = $derived<'new' | 'in_progress' | 'completed'>(episodeProgress?.status ?? 'new');

	let progressPercent = $derived(
		episodeProgress && episodeProgress.duration_seconds > 0
			? (episodeProgress.position_seconds / episodeProgress.duration_seconds) * 100
			: 0
	);

	function formatDate(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
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

	function stripHtml(html: string): string {
		if (!html) return '';
		return html.replace(/<[^>]*>/g, '');
	}

	async function handlePlay() {
		await loadEpisode(String(data.episodeId), String(data.episode.feedId));
	}

	async function handleAddToQueue() {
		await addToQueue(String(data.episodeId));
		showToast('Added to queue');
	}
</script>

<div class="mx-auto max-w-lg px-4 pt-4 pb-8">
	<button
		onclick={() => history.back()}
		class="text-text-muted hover:text-text-secondary mb-4 inline-flex items-center gap-1 text-sm"
	>
		<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path d="M15 19l-7-7 7-7" />
		</svg>
		Back
	</button>

	<div class="mb-6 flex gap-4">
		{#if data.episode.feedImage || data.episode.image}
			<img
				src={getProxyImageUrl(data.episode.feedImage || data.episode.image)}
				alt=""
				class="h-24 w-24 shrink-0 rounded-xl object-cover shadow-lg"
			/>
		{/if}
		<div class="flex min-w-0 flex-col justify-center">
			{#if data.episode.feedTitle}
				<p class="text-text-muted mb-1 truncate text-xs">{data.episode.feedTitle}</p>
			{/if}
			<h1 class="text-lg font-bold leading-tight">{data.episode.title}</h1>
		</div>
	</div>

	<div class="text-text-muted mb-4 flex flex-wrap items-center gap-2 text-sm">
		<span>{formatDate(data.episode.datePublished)}</span>
		{#if data.episode.duration}
			<span>&middot;</span>
			<span>{formatDuration(data.episode.duration)}</span>
		{/if}
		<EpisodeStatus {status} progress={progressPercent} />
	</div>

	<div class="mb-6 flex gap-3">
		<button
			onclick={handlePlay}
			class="bg-brand hover:bg-brand-hover flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors"
		>
			<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
					clip-rule="evenodd"
				/>
			</svg>
			Play
		</button>
		<button
			onclick={handleAddToQueue}
			class="bg-surface-raised hover:bg-surface-overlay flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
		>
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path d="M12 4v16m8-8H4" />
			</svg>
			Queue
		</button>
	</div>

	{#if data.episode.description}
		<div class="border-border border-t pt-4">
			<h2 class="mb-3 text-sm font-semibold">Show Notes</h2>
			<div class="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
				{stripHtml(String(data.episode.description))}
			</div>
		</div>
	{/if}
</div>
