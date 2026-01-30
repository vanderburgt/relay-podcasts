import type { EpisodesResult, SearchResult } from '$lib/types.js';

// Use relative URL - SvelteKit server proxy handles forwarding to backend
const API_URL = '';

class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
	}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	if (!response.ok) {
		const body = await response.json().catch(() => ({ detail: response.statusText }));
		throw new ApiError(response.status, body.detail ?? 'Request failed');
	}

	if (response.status === 204) return undefined as T;
	return response.json();
}

function authHeaders(key: string): Record<string, string> {
	return { Authorization: `Bearer ${key}` };
}

// Auth

export async function createAccount(): Promise<{ key: string }> {
	return request('/api/auth/create', { method: 'POST' });
}

export async function verifyKey(
	key: string
): Promise<{ valid: boolean; encrypted_blob: string | null; created_at: string }> {
	return request('/api/auth/verify', {
		method: 'POST',
		body: JSON.stringify({ key })
	});
}

export async function deleteAccount(key: string): Promise<void> {
	return request('/api/auth/account', {
		method: 'DELETE',
		body: JSON.stringify({ key })
	});
}

// Data

export async function getData(key: string): Promise<{ encrypted_blob: string | null }> {
	return request('/api/data', { headers: authHeaders(key) });
}

export async function putData(key: string, encrypted_blob: string): Promise<{ success: boolean }> {
	return request('/api/data', {
		method: 'PUT',
		headers: authHeaders(key),
		body: JSON.stringify({ encrypted_blob })
	});
}

// Podcasts

export async function searchPodcasts(query: string): Promise<SearchResult> {
	return request(`/api/podcasts/search?q=${encodeURIComponent(query)}`);
}

export async function getPodcast(id: number): Promise<{ feed: Record<string, unknown> }> {
	return request(`/api/podcasts/${id}`);
}

export async function getEpisodes(podcastId: number, max: number = 50): Promise<EpisodesResult> {
	return request(`/api/podcasts/${podcastId}/episodes?max=${max}`);
}

export async function getEpisode(id: number): Promise<{ episode: Record<string, unknown> }> {
	return request(`/api/episodes/${id}`);
}

// Proxy URLs for privacy

export function getProxyAudioUrl(enclosureUrl: string): string {
	return `/api/proxy/audio?url=${encodeURIComponent(enclosureUrl)}`;
}

export function getProxyImageUrl(imageUrl: string): string {
	return `/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
}

export { ApiError };
