import { browser } from '$app/environment';
import { getData, putData } from '$lib/api.js';
import { decrypt, deriveKey, encrypt } from '$lib/crypto.js';
import type { EpisodeProgress, Preferences, Subscription, UserData } from '$lib/types.js';

const STORAGE_KEY = 'relay_key';

const DEFAULT_USER_DATA: UserData = {
	subscriptions: [],
	episode_progress: {},
	queue: [],
	currently_playing: { episode_id: null, podcast_id: null },
	preferences: {
		default_playback_speed: 1.0,
		default_skip_forward: 30,
		default_skip_backward: 15,
		theme: 'system'
	}
};

// Auth state
let key = $state<string | null>(null);
let cryptoKey = $state<CryptoKey | null>(null);
let authenticated = $derived(key !== null);
let initialized = $state(false);

// User data — decrypted blob
let userData = $state<UserData>(structuredClone(DEFAULT_USER_DATA));
let syncing = $state(false);

export function getAuth() {
	return {
		get key() {
			return key;
		},
		get authenticated() {
			return authenticated;
		},
		get initialized() {
			return initialized;
		}
	};
}

export async function initAuth(): Promise<void> {
	if (!browser || initialized) return;

	const storedKey = localStorage.getItem(STORAGE_KEY);
	if (storedKey) {
		try {
			await login(storedKey);
		} catch {
			// Invalid key, clear it
			localStorage.removeItem(STORAGE_KEY);
		}
	}
	initialized = true;
}

export function getUserData() {
	return {
		get data() {
			return userData;
		},
		get syncing() {
			return syncing;
		}
	};
}

export async function login(rawKey: string): Promise<void> {
	key = rawKey;
	cryptoKey = await deriveKey(rawKey);

	const response = await getData(rawKey);
	if (response.encrypted_blob) {
		userData = (await decrypt(response.encrypted_blob, cryptoKey)) as UserData;
	} else {
		userData = structuredClone(DEFAULT_USER_DATA);
	}

	if (browser) {
		localStorage.setItem(STORAGE_KEY, rawKey);
	}
}

export function logout(): void {
	key = null;
	cryptoKey = null;
	userData = structuredClone(DEFAULT_USER_DATA);

	if (browser) {
		localStorage.removeItem(STORAGE_KEY);
	}
}

export async function sync(): Promise<void> {
	if (!key || !cryptoKey) return;
	syncing = true;
	try {
		const blob = await encrypt(userData, cryptoKey);
		await putData(key, blob);
	} finally {
		syncing = false;
	}
}

// Subscription helpers

export async function addSubscription(sub: Subscription): Promise<void> {
	const exists = userData.subscriptions.some((s) => s.podcast_id === sub.podcast_id);
	if (exists) return;

	userData.subscriptions = [...userData.subscriptions, sub];
	await sync();
}

export async function removeSubscription(podcastId: string): Promise<void> {
	userData.subscriptions = userData.subscriptions.filter((s) => s.podcast_id !== podcastId);
	await sync();
}

// Episode progress helpers

export async function updateEpisodeProgress(
	episodeId: string,
	progress: EpisodeProgress
): Promise<void> {
	userData.episode_progress = { ...userData.episode_progress, [episodeId]: progress };
	await sync();
}

// Queue helpers

export async function addToQueue(episodeId: string): Promise<void> {
	if (userData.queue.includes(episodeId)) return;
	userData.queue = [...userData.queue, episodeId];
	await sync();
}

export async function removeFromQueue(episodeId: string): Promise<void> {
	userData.queue = userData.queue.filter((id) => id !== episodeId);
	await sync();
}

export async function reorderQueue(queue: string[]): Promise<void> {
	userData.queue = queue;
	await sync();
}

// Currently playing

export async function setCurrentlyPlaying(
	episodeId: string | null,
	podcastId: string | null
): Promise<void> {
	userData.currently_playing = { episode_id: episodeId, podcast_id: podcastId };
	await sync();
}

// Preferences

export async function updatePreferences(prefs: Partial<Preferences>): Promise<void> {
	userData.preferences = { ...userData.preferences, ...prefs };
	await sync();
}
