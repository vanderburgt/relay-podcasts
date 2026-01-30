import { getEpisode, getPodcast, getProxyAudioUrl } from '$lib/api.js';
import { getUserData, removeFromQueue, setCurrentlyPlaying, updateEpisodeProgress } from '$lib/store.svelte.js';
import type { Episode, EpisodeProgress, Podcast } from '$lib/types.js';

let audio: HTMLAudioElement | null = null;

let playing = $state(false);
let currentTime = $state(0);
let duration = $state(0);
let loading = $state(false);
let playbackRate = $state(1);

let currentEpisode = $state<Episode | null>(null);
let currentPodcast = $state<Podcast | null>(null);
let showFullPlayer = $state(false);

let saveTimer: ReturnType<typeof setInterval> | null = null;

export function getPlayer() {
	return {
		get playing() { return playing; },
		get currentTime() { return currentTime; },
		get duration() { return duration; },
		get loading() { return loading; },
		get playbackRate() { return playbackRate; },
		get episode() { return currentEpisode; },
		get podcast() { return currentPodcast; },
		get showFullPlayer() { return showFullPlayer; },
		get hasEpisode() { return currentEpisode !== null; }
	};
}

export function toggleFullPlayer(show?: boolean) {
	showFullPlayer = show ?? !showFullPlayer;
}

export async function loadEpisode(episodeId: string, podcastId: string): Promise<void> {
	loading = true;

	try {
		const [epRes, podRes] = await Promise.all([
			getEpisode(Number(episodeId)),
			getPodcast(Number(podcastId))
		]);

		currentEpisode = epRes.episode as unknown as Episode;
		currentPodcast = podRes.feed as unknown as Podcast;

		// Initialize duration from API data (audio element may update this later)
		if (currentEpisode.duration) {
			duration = currentEpisode.duration;
		}

		await setCurrentlyPlaying(episodeId, podcastId);

		if (!audio) {
			audio = new Audio();
			setupAudioListeners();
		}

		audio.src = getProxyAudioUrl(currentEpisode.enclosureUrl);
		audio.playbackRate = playbackRate;

		const store = getUserData();
		const progress = store.data.episode_progress[episodeId];
		if (progress && progress.status !== 'completed') {
			audio.currentTime = progress.position_seconds;
		}

		await audio.play();
		playing = true;
		startProgressSaving();
		updateMediaSession();
	} catch (e) {
		console.error('Failed to load episode:', e);
	} finally {
		loading = false;
	}
}

export function play() {
	if (!audio) return;
	audio.play();
	playing = true;
	updateMediaSessionState();
}

export function pause() {
	if (!audio) return;
	audio.pause();
	playing = false;
	saveProgress();
	updateMediaSessionState();
}

export function togglePlay() {
	if (playing) pause();
	else play();
}

export function seek(time: number) {
	if (!audio) return;
	audio.currentTime = Math.max(0, Math.min(time, duration));
}

export function seekRelative(delta: number) {
	if (!audio) return;
	seek(audio.currentTime + delta);
}

export function setPlaybackRate(rate: number) {
	playbackRate = rate;
	if (audio) audio.playbackRate = rate;
}

function setupAudioListeners() {
	if (!audio) return;

	audio.addEventListener('timeupdate', () => {
		currentTime = audio!.currentTime;
	});

	audio.addEventListener('durationchange', () => {
		// Only update if audio element provides a valid duration
		if (audio!.duration && isFinite(audio!.duration)) {
			duration = audio!.duration;
		}
	});

	audio.addEventListener('ended', handleEnded);

	audio.addEventListener('play', () => {
		playing = true;
		updateMediaSessionState();
	});

	audio.addEventListener('pause', () => {
		playing = false;
		updateMediaSessionState();
	});
}

async function handleEnded() {
	playing = false;

	if (currentEpisode) {
		await updateEpisodeProgress(String(currentEpisode.id), {
			position_seconds: duration,
			duration_seconds: duration,
			status: 'completed',
			updated_at: new Date().toISOString()
		});
	}

	const store = getUserData();
	const queue = store.data.queue;

	if (queue.length > 0) {
		const nextEpisodeId = queue[0];
		await removeFromQueue(nextEpisodeId);

		const currently = store.data.currently_playing;
		await loadEpisode(nextEpisodeId, currently.podcast_id ?? '');
	} else {
		stopProgressSaving();
	}
}

function startProgressSaving() {
	stopProgressSaving();
	saveTimer = setInterval(saveProgress, 10000);
}

function stopProgressSaving() {
	if (saveTimer) {
		clearInterval(saveTimer);
		saveTimer = null;
	}
}

async function saveProgress() {
	if (!currentEpisode || !audio) return;

	const status: EpisodeProgress['status'] =
		currentTime >= duration - 30 ? 'completed' :
		currentTime > 10 ? 'in_progress' : 'new';

	await updateEpisodeProgress(String(currentEpisode.id), {
		position_seconds: currentTime,
		duration_seconds: duration,
		status,
		updated_at: new Date().toISOString()
	});
}

function updateMediaSession() {
	if (!('mediaSession' in navigator) || !currentEpisode || !currentPodcast) return;

	navigator.mediaSession.metadata = new MediaMetadata({
		title: currentEpisode.title,
		artist: currentPodcast.title,
		album: currentPodcast.title,
		artwork: [
			{ src: currentPodcast.artwork, sizes: '96x96', type: 'image/png' },
			{ src: currentPodcast.artwork, sizes: '128x128', type: 'image/png' },
			{ src: currentPodcast.artwork, sizes: '192x192', type: 'image/png' },
			{ src: currentPodcast.artwork, sizes: '256x256', type: 'image/png' },
			{ src: currentPodcast.artwork, sizes: '384x384', type: 'image/png' },
			{ src: currentPodcast.artwork, sizes: '512x512', type: 'image/png' }
		]
	});

	navigator.mediaSession.setActionHandler('play', play);
	navigator.mediaSession.setActionHandler('pause', pause);
	navigator.mediaSession.setActionHandler('seekbackward', () => seekRelative(-15));
	navigator.mediaSession.setActionHandler('seekforward', () => seekRelative(30));
	navigator.mediaSession.setActionHandler('previoustrack', () => seekRelative(-15));
	navigator.mediaSession.setActionHandler('nexttrack', () => seekRelative(30));

	updateMediaSessionState();
}

function updateMediaSessionState() {
	if (!('mediaSession' in navigator)) return;
	navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
}
