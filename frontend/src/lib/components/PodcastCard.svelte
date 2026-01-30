<script lang="ts">
	import type { Podcast } from '$lib/types.js';

	interface Props {
		podcast: Podcast;
		subscribed?: boolean;
	}

	let { podcast, subscribed = false }: Props = $props();
</script>

<a
	href="/app/podcast/{podcast.id}"
	class="bg-surface-raised hover:bg-surface-overlay flex items-center gap-3 rounded-xl p-3 transition-colors"
>
	<img
		src={podcast.artwork}
		alt={podcast.title}
		class="h-14 w-14 shrink-0 rounded-lg object-cover"
		loading="lazy"
	/>
	<div class="min-w-0 flex-1">
		<h3 class="truncate text-sm font-semibold">{podcast.title}</h3>
		<p class="text-text-secondary truncate text-xs">{podcast.author}</p>
		<div class="mt-0.5 flex items-center gap-2">
			<span class="text-text-muted text-xs">{podcast.episodeCount} episodes</span>
			{#if subscribed}
				<span class="text-brand text-xs font-medium">Subscribed</span>
			{/if}
		</div>
	</div>
</a>
