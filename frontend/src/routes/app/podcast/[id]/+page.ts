import { getEpisodes, getPodcast } from '$lib/api.js';
import type { Episode, Podcast } from '$lib/types.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ params }) => {
	const id = Number(params.id);
	const [podcastRes, episodesRes] = await Promise.all([getPodcast(id), getEpisodes(id)]);

	return {
		podcast: podcastRes.feed as unknown as Podcast,
		episodes: episodesRes.items as Episode[],
		podcastId: id
	};
};
