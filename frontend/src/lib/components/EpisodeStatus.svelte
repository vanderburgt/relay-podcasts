<script lang="ts">
	interface Props {
		status: 'new' | 'in_progress' | 'completed';
		progress?: number;
	}

	let { status, progress = 0 }: Props = $props();
</script>

{#if status === 'new'}
	<span class="bg-brand/20 text-brand inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold">
		NEW
	</span>
{:else if status === 'completed'}
	<svg class="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
		<path
			fill-rule="evenodd"
			d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
			clip-rule="evenodd"
		/>
	</svg>
{:else if status === 'in_progress'}
	<div class="bg-surface-overlay h-1 w-10 overflow-hidden rounded-full">
		<div class="bg-brand h-full rounded-full" style="width: {progress}%"></div>
	</div>
{/if}
