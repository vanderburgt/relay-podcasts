<script lang="ts">
	import { getPlayer, toggleFullPlayer, togglePlay } from '$lib/player.svelte.js';

	const player = getPlayer();

	let progressPercent = $derived(
		player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0
	);
</script>

{#if player.hasEpisode}
	<div class="bg-surface-raised border-border fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-0 right-0 z-30 border-t">
		<div class="bg-brand/30 h-0.5">
			<div class="bg-brand h-full transition-all" style="width: {progressPercent}%"></div>
		</div>

		<div
			role="button"
			tabindex="0"
			onclick={() => toggleFullPlayer(true)}
			onkeydown={(e) => e.key === 'Enter' && toggleFullPlayer(true)}
			class="flex w-full cursor-pointer items-center gap-3 p-2"
		>
			{#if player.podcast?.artwork}
				<img
					src={player.podcast.artwork}
					alt=""
					class="h-10 w-10 shrink-0 rounded-md object-cover"
				/>
			{/if}

			<div class="min-w-0 flex-1 text-left">
				<p class="truncate text-sm font-medium">{player.episode?.title ?? 'Loading...'}</p>
				<p class="text-text-secondary truncate text-xs">{player.podcast?.title ?? ''}</p>
			</div>

			<button
				onclick={(e) => {
					e.stopPropagation();
					togglePlay();
				}}
				disabled={player.loading}
				class="text-text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
				aria-label={player.playing ? 'Pause' : 'Play'}
			>
				{#if player.loading}
					<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25" />
						<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75" />
					</svg>
				{:else if player.playing}
					<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
						<rect x="6" y="4" width="4" height="16" rx="1" />
						<rect x="14" y="4" width="4" height="16" rx="1" />
					</svg>
				{:else}
					<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
						<path d="M8 5.14v14l11-7-11-7z" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
{/if}
