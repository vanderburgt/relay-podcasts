<script lang="ts">
	import { showToast } from '$lib/toast.svelte.js';

	interface Props {
		key: string;
	}

	let { key }: Props = $props();
	let visible = $state(false);

	async function copyKey() {
		try {
			await navigator.clipboard.writeText(key);
			showToast('Key copied to clipboard');
		} catch {
			showToast('Failed to copy key', 'error');
		}
	}
</script>

<div class="flex flex-col gap-3">
	<label class="text-text-secondary text-sm font-medium" for="key-input">Your key</label>
	<div class="flex gap-2">
		<div class="relative flex-1">
			<input
				id="key-input"
				type={visible ? 'text' : 'password'}
				value={key}
				readonly
				autocomplete="new-password"
				class="bg-surface-raised border-border text-text-primary w-full rounded-lg border px-4 py-3 pr-12 font-mono text-sm focus:border-brand focus:outline-none"
			/>
			<button
				type="button"
				onclick={() => (visible = !visible)}
				class="text-text-muted hover:text-text-secondary absolute top-1/2 right-3 -translate-y-1/2"
				aria-label={visible ? 'Hide key' : 'Show key'}
			>
				{#if visible}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.29 6.29m7.532 7.532l3.536 3.536M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
					</svg>
				{:else}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
					</svg>
				{/if}
			</button>
		</div>
		<button
			type="button"
			onclick={copyKey}
			class="bg-brand hover:bg-brand-hover flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
				<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
			</svg>
			Copy
		</button>
	</div>
	<p class="text-text-muted text-xs">
		Save this key now. It cannot be recovered. You'll need it to access your account.
	</p>
</div>
