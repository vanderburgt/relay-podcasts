export interface Subscription {
	podcast_id: string;
	title: string;
	author: string;
	artwork: string;
	feedUrl: string;
	subscribed_at: string;
	settings: PodcastSettings;
}

export interface PodcastSettings {
	playback_speed: number;
	skip_forward_seconds: number;
	skip_backward_seconds: number;
}

export interface EpisodeProgress {
	position_seconds: number;
	duration_seconds: number;
	status: 'new' | 'in_progress' | 'completed';
	updated_at: string;
}

export interface UserData {
	subscriptions: Subscription[];
	episode_progress: Record<string, EpisodeProgress>;
	queue: string[];
	currently_playing: {
		episode_id: string | null;
		podcast_id: string | null;
	};
	preferences: Preferences;
}

export interface Preferences {
	default_playback_speed: number;
	default_skip_forward: number;
	default_skip_backward: number;
	theme: 'system' | 'light' | 'dark';
}

export interface Podcast {
	id: number;
	title: string;
	author: string;
	description: string;
	artwork: string;
	url: string;
	episodeCount: number;
	categories: Record<string, string>;
}

export interface Episode {
	id: number;
	title: string;
	description: string;
	datePublished: number;
	duration: number;
	enclosureUrl: string;
	enclosureType: string;
	feedId: number;
	feedTitle: string;
	feedImage: string;
	image: string;
}

export interface SearchResult {
	status: boolean;
	feeds: Podcast[];
	count: number;
}

export interface EpisodesResult {
	status: boolean;
	items: Episode[];
	count: number;
}
