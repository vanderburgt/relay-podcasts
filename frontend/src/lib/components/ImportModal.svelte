<script lang="ts">
	import { searchPodcasts } from '$lib/api.js';
	import { parseOPML } from '$lib/opml.js';
	import { addSubscription, getUserData } from '$lib/store.svelte.js';
	import { showToast } from '$lib/toast.svelte.js';
	import type { Subscription } from '$lib/types.js';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	const store = getUserData();

	let importing = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let fileInput: HTMLInputElement;

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		importing = true;
		progress = { current: 0, total: 0 };

		try {
			const text = await file.text();
			const feedUrls = parseOPML(text);
			progress.total = feedUrls.length;

			if (feedUrls.length === 0) {
				showToast('No feeds found in OPML file', 'error');
				importing = false;
				return;
			}

			let imported = 0;

			for (const feedUrl of feedUrls) {
				progress.current++;

				try {
					// Search by feed URL to get podcast details
					const results = await searchPodcasts(feedUrl);
					const podcast = results.feeds?.[0];

					if (podcast) {
						const alreadySubscribed = store.data.subscriptions.some(
							(s) => s.podcast_id === String(podcast.id)
						);

						if (!alreadySubscribed) {
							const sub: Subscription = {
								podcast_id: String(podcast.id),
								title: podcast.title,
								author: podcast.author,
								artwork: podcast.artwork,
								feedUrl: podcast.url,
								subscribed_at: new Date().toISOString(),
								episode_count: podcast.episodeCount ?? 0,
								settings: {
									playback_speed: store.data.preferences.default_playback_speed,
									skip_forward_seconds: store.data.preferences.default_skip_forward,
									skip_backward_seconds: store.data.preferences.default_skip_backward
								}
							};
							await addSubscription(sub);
							imported++;
						}
					}
				} catch {
					// Skip feeds that fail to import
				}
			}

			showToast(`Imported ${imported} podcast${imported !== 1 ? 's' : ''}`);
			onclose();
		} catch {
			showToast('Failed to parse OPML file', 'error');
		} finally {
			importing = false;
			if (fileInput) fileInput.value = '';
		}
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
		<div class="bg-surface-raised w-full max-w-sm rounded-2xl p-6">
			<h2 class="mb-4 text-lg font-bold">Import OPML</h2>

			{#if importing}
				<div class="py-8 text-center">
					<div class="bg-surface-overlay mx-auto mb-4 h-2 w-48 overflow-hidden rounded-full">
						<div
							class="bg-brand h-full transition-all"
							style="width: {progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%"
						></div>
					</div>
					<p class="text-text-secondary text-sm">
						Importing {progress.current} of {progress.total}...
					</p>
				</div>
			{:else}
				<p class="text-text-secondary mb-6 text-sm">
					Select an OPML file to import your podcast subscriptions from another app.
				</p>

				<input
					bind:this={fileInput}
					type="file"
					accept=".opml,.xml"
					onchange={handleFileSelect}
					class="hidden"
				/>

				<div class="flex flex-col gap-3">
					<button
						onclick={() => fileInput?.click()}
						class="bg-brand hover:bg-brand-hover w-full rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors"
					>
						Choose File
					</button>

					<button
						onclick={onclose}
						class="text-text-secondary hover:text-text-primary w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors"
					>
						Cancel
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
