<script lang="ts">
	import { goto } from '$app/navigation';
	import { deleteAccount } from '$lib/api.js';
	import ImportModal from '$lib/components/ImportModal.svelte';
	import { downloadOPML } from '$lib/opml.js';
	import { getAuth, getUserData, logout, updatePreferences } from '$lib/store.svelte.js';
	import { showToast } from '$lib/toast.svelte.js';

	const auth = getAuth();
	const store = getUserData();

	let confirmDelete = $state(false);
	let deleting = $state(false);
	let showImportModal = $state(false);

	const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
	const skipOptions = [10, 15, 30, 45, 60];

	function handleLogout() {
		logout();
		goto('/');
	}

	async function handleDelete() {
		if (!confirmDelete) {
			confirmDelete = true;
			return;
		}

		if (!auth.key) return;
		deleting = true;

		try {
			await deleteAccount(auth.key);
			logout();
			showToast('Account deleted');
			goto('/');
		} catch {
			showToast('Failed to delete account', 'error');
		} finally {
			deleting = false;
		}
	}

	function handleExport() {
		if (store.data.subscriptions.length === 0) {
			showToast('No subscriptions to export', 'error');
			return;
		}
		downloadOPML(store.data.subscriptions);
		showToast('OPML exported');
	}

	async function handleSpeedChange(e: Event) {
		const value = Number((e.target as HTMLSelectElement).value);
		await updatePreferences({ default_playback_speed: value });
	}

	async function handleSkipBackwardChange(e: Event) {
		const value = Number((e.target as HTMLSelectElement).value);
		await updatePreferences({ default_skip_backward: value });
	}

	async function handleSkipForwardChange(e: Event) {
		const value = Number((e.target as HTMLSelectElement).value);
		await updatePreferences({ default_skip_forward: value });
	}

	async function handleThemeChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value as 'system' | 'light' | 'dark';
		await updatePreferences({ theme: value });
	}
</script>

<div class="mx-auto max-w-lg px-4 pt-4 pb-8">
	<h1 class="mb-6 text-xl font-bold">Settings</h1>

	<div class="flex flex-col gap-6">
		<!-- Appearance -->
		<section>
			<h2 class="text-text-secondary mb-3 text-sm font-semibold uppercase tracking-wide">Appearance</h2>
			<div class="bg-surface-raised flex flex-col divide-y divide-border rounded-xl">
				<label class="flex items-center justify-between px-4 py-3">
					<span class="text-sm">Theme</span>
					<select
						value={store.data.preferences.theme}
						onchange={handleThemeChange}
						class="bg-surface-overlay rounded-lg px-3 py-1.5 text-sm"
					>
						<option value="system">System</option>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
				</label>
			</div>
		</section>

		<!-- Playback Preferences -->
		<section>
			<h2 class="text-text-secondary mb-3 text-sm font-semibold uppercase tracking-wide">Playback</h2>
			<div class="bg-surface-raised flex flex-col divide-y divide-border rounded-xl">
				<label class="flex items-center justify-between px-4 py-3">
					<span class="text-sm">Default speed</span>
					<select
						value={store.data.preferences.default_playback_speed}
						onchange={handleSpeedChange}
						class="bg-surface-overlay rounded-lg px-3 py-1.5 text-sm"
					>
						{#each speeds as speed}
							<option value={speed}>{speed}x</option>
						{/each}
					</select>
				</label>
				<label class="flex items-center justify-between px-4 py-3">
					<span class="text-sm">Skip backward</span>
					<select
						value={store.data.preferences.default_skip_backward}
						onchange={handleSkipBackwardChange}
						class="bg-surface-overlay rounded-lg px-3 py-1.5 text-sm"
					>
						{#each skipOptions as secs}
							<option value={secs}>{secs}s</option>
						{/each}
					</select>
				</label>
				<label class="flex items-center justify-between px-4 py-3">
					<span class="text-sm">Skip forward</span>
					<select
						value={store.data.preferences.default_skip_forward}
						onchange={handleSkipForwardChange}
						class="bg-surface-overlay rounded-lg px-3 py-1.5 text-sm"
					>
						{#each skipOptions as secs}
							<option value={secs}>{secs}s</option>
						{/each}
					</select>
				</label>
			</div>
		</section>

		<!-- Data -->
		<section>
			<h2 class="text-text-secondary mb-3 text-sm font-semibold uppercase tracking-wide">Data</h2>
			<div class="bg-surface-raised flex flex-col divide-y divide-border rounded-xl">
				<button
					onclick={() => (showImportModal = true)}
					class="px-4 py-3 text-left text-sm transition-colors hover:bg-surface-overlay"
				>
					Import OPML
				</button>
				<button
					onclick={handleExport}
					class="px-4 py-3 text-left text-sm transition-colors hover:bg-surface-overlay"
				>
					Export OPML
				</button>
			</div>
		</section>

		<!-- Account -->
		<section>
			<h2 class="text-text-secondary mb-3 text-sm font-semibold uppercase tracking-wide">Account</h2>
			<div class="bg-surface-raised flex flex-col divide-y divide-border rounded-xl">
				<button
					onclick={handleLogout}
					class="px-4 py-3 text-left text-sm transition-colors hover:bg-surface-overlay"
				>
					Log out
				</button>
			</div>
		</section>

		<!-- Danger Zone -->
		<section>
			<h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-red-400">Danger zone</h2>
			<button
				onclick={handleDelete}
				disabled={deleting}
				class="w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors disabled:opacity-50 {confirmDelete
					? 'bg-red-900/40 text-red-300'
					: 'bg-surface-raised hover:bg-surface-overlay'}"
			>
				{#if deleting}
					Deleting...
				{:else if confirmDelete}
					Are you sure? Tap again to permanently delete
				{:else}
					Delete account
				{/if}
			</button>
		</section>
	</div>
</div>

<ImportModal open={showImportModal} onclose={() => (showImportModal = false)} />
