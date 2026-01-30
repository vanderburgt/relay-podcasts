<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { getPlayer, seekRelative, setPlaybackRate, toggleFullPlayer, togglePlay } from '$lib/player.svelte.js';
	import { getUserData } from '$lib/store.svelte.js';

	const player = getPlayer();
	const store = getUserData();

	let showSpeedMenu = $state(false);

	const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

	let skipBackward = $derived(store.data.preferences.default_skip_backward);
	let skipForward = $derived(store.data.preferences.default_skip_forward);
</script>

{#if player.showFullPlayer && player.hasEpisode}
	<div class="bg-surface fixed inset-0 z-50 flex flex-col" style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom)">
		<div class="flex items-center justify-between px-4 py-3">
			<button
				onclick={() => toggleFullPlayer(false)}
				class="text-text-muted hover:text-text-primary p-2 transition-colors"
				aria-label="Close player"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			<span class="text-text-secondary text-xs font-medium uppercase tracking-wide">Now Playing</span>
			<div class="w-10"></div>
		</div>

		<div class="flex flex-1 flex-col items-center justify-center px-8">
			{#if player.podcast?.artwork}
				<img
					src={player.podcast.artwork}
					alt=""
					class="mb-8 aspect-square w-full max-w-xs rounded-2xl object-cover shadow-2xl"
				/>
			{/if}

			<div class="mb-6 w-full max-w-xs text-center">
				<h1 class="text-lg font-bold leading-tight">{player.episode?.title}</h1>
				<p class="text-text-secondary mt-1 text-sm">{player.podcast?.title}</p>
			</div>

			<div class="mb-8 w-full max-w-xs">
				<ProgressBar currentTime={player.currentTime} duration={player.duration} />
			</div>

			<div class="mb-6 flex items-center justify-center gap-6">
				<button
					onclick={() => seekRelative(-skipBackward)}
					class="text-text-secondary hover:text-text-primary relative p-2 transition-colors"
					aria-label="Skip backward {skipBackward} seconds"
				>
					<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4z" />
						<path d="M4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
					</svg>
					<span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{skipBackward}</span>
				</button>

				<button
					onclick={togglePlay}
					disabled={player.loading}
					class="bg-brand hover:bg-brand-hover flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-colors disabled:opacity-50"
					aria-label={player.playing ? 'Pause' : 'Play'}
				>
					{#if player.loading}
						<svg class="h-7 w-7 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25" />
							<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75" />
						</svg>
					{:else if player.playing}
						<svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="4" width="4" height="16" rx="1" />
							<rect x="14" y="4" width="4" height="16" rx="1" />
						</svg>
					{:else}
						<svg class="h-7 w-7 ml-1" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5.14v14l11-7-11-7z" />
						</svg>
					{/if}
				</button>

				<button
					onclick={() => seekRelative(skipForward)}
					class="text-text-secondary hover:text-text-primary relative p-2 transition-colors"
					aria-label="Skip forward {skipForward} seconds"
				>
					<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4z" />
						<path d="M19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
					</svg>
					<span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{skipForward}</span>
				</button>
			</div>

			<div class="relative">
				<button
					onclick={() => (showSpeedMenu = !showSpeedMenu)}
					class="text-text-secondary hover:text-text-primary rounded-full px-4 py-2 text-sm font-medium transition-colors"
				>
					{player.playbackRate}x
				</button>

				{#if showSpeedMenu}
					<div class="bg-surface-overlay absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-xl p-2 shadow-xl">
						{#each speeds as speed}
							<button
								onclick={() => {
									setPlaybackRate(speed);
									showSpeedMenu = false;
								}}
								class="block w-full rounded-lg px-4 py-2 text-sm transition-colors {player.playbackRate === speed
									? 'bg-brand text-white'
									: 'hover:bg-surface-raised'}"
							>
								{speed}x
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
