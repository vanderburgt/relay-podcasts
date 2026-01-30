<script lang="ts">
	import { dismissToast, getToasts } from '$lib/toast.svelte.js';

	const toasts = getToasts();
</script>

{#if toasts.list.length > 0}
	<div class="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
		{#each toasts.list as toast (toast.id)}
			<button
				class="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm {toast.type ===
				'success'
					? 'bg-emerald-900/90 text-emerald-100'
					: 'bg-red-900/90 text-red-100'}"
				onclick={() => dismissToast(toast.id)}
			>
				{#if toast.type === 'success'}
					<svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
				{:else}
					<svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
				{toast.message}
			</button>
		{/each}
	</div>
{/if}
