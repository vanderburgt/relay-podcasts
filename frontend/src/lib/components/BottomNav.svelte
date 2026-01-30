<script lang="ts">
	import { page } from '$app/state';

	const tabs = [
		{
			label: 'Feed',
			href: '/app',
			icon: 'feed'
		},
		{
			label: 'Subs',
			href: '/app/subscriptions',
			icon: 'subscriptions'
		},
		{
			label: 'Search',
			href: '/app/search',
			icon: 'search'
		},
		{
			label: 'Queue',
			href: '/app/queue',
			icon: 'queue'
		},
		{
			label: 'Settings',
			href: '/app/settings',
			icon: 'settings'
		}
	] as const;

	function isActive(href: string): boolean {
		if (href === '/app') return page.url.pathname === '/app';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav
	class="bg-surface-raised border-border fixed bottom-0 left-0 right-0 z-40 border-t"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
	<div class="mx-auto flex max-w-lg items-center justify-around">
		{#each tabs as tab}
			{@const active = isActive(tab.href)}
			<a
				href={tab.href}
				class="flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors {active
					? 'text-brand'
					: 'text-text-muted hover:text-text-secondary'}"
			>
				{#if tab.icon === 'feed'}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
					</svg>
				{:else if tab.icon === 'subscriptions'}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
				{:else if tab.icon === 'search'}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				{:else if tab.icon === 'queue'}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
					</svg>
				{:else if tab.icon === 'settings'}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				{/if}
				<span class="text-[10px] font-medium">{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>
