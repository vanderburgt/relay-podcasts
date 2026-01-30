import { getEpisode } from '$lib/api.js';
import type { Episode } from '$lib/types.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ params }) => {
	const id = Number(params.id);
	const result = await getEpisode(id);

	return {
		episode: result.episode as unknown as Episode,
		episodeId: id
	};
};
