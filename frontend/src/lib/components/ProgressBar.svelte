<script lang="ts">
	import { seek } from '$lib/player.svelte.js';

	interface Props {
		currentTime: number;
		duration: number;
	}

	let { currentTime, duration }: Props = $props();

	let progressBar: HTMLDivElement;
	let dragging = $state(false);

	let progressPercent = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	function formatTime(seconds: number): string {
		if (!seconds || !isFinite(seconds)) return '0:00';
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.floor(seconds % 60);
		if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function handleSeek(e: MouseEvent | TouchEvent) {
		if (!progressBar || !duration) return;

		const rect = progressBar.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		seek(percent * duration);
	}

	function handlePointerDown(e: PointerEvent) {
		dragging = true;
		handleSeek(e);
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging) return;
		handleSeek(e);
	}

	function handlePointerUp() {
		dragging = false;
	}
</script>

<div class="flex flex-col gap-2">
	<div
		bind:this={progressBar}
		class="bg-surface-overlay relative h-1.5 cursor-pointer rounded-full"
		role="slider"
		tabindex="0"
		aria-valuemin={0}
		aria-valuemax={duration}
		aria-valuenow={currentTime}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		<div class="bg-brand h-full rounded-full" style="width: {progressPercent}%"></div>
		<div
			class="bg-white absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full shadow-md transition-transform {dragging ? 'scale-125' : ''}"
			style="left: calc({progressPercent}% - 8px)"
		></div>
	</div>

	<div class="text-text-muted flex justify-between text-xs">
		<span>{formatTime(currentTime)}</span>
		<span>{formatTime(duration)}</span>
	</div>
</div>
