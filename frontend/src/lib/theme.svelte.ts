import { browser } from '$app/environment';

export function applyTheme(theme: 'system' | 'light' | 'dark'): void {
	if (!browser) return;

	const root = document.documentElement;
	root.classList.remove('light', 'dark');

	if (theme === 'light') {
		root.classList.add('light');
	} else if (theme === 'dark') {
		root.classList.add('dark');
	}
	// 'system' = no class, let CSS media query handle it
}
