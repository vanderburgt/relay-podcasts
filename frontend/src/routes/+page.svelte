<script lang="ts">
	import { goto } from '$app/navigation';
	import { createAccount, verifyKey } from '$lib/api.js';
	import KeyDisplay from '$lib/components/KeyDisplay.svelte';
	import { getAuth, login } from '$lib/store.svelte.js';
	import { showToast } from '$lib/toast.svelte.js';

	const auth = getAuth();

	let mode = $state<'login' | 'create' | 'created'>('login');
	let keyInput = $state('');
	let generatedKey = $state('');
	let loading = $state(false);
	let error = $state('');

	// Redirect to app if already authenticated
	$effect(() => {
		if (auth.initialized && auth.authenticated) {
			goto('/app');
		}
	});

	async function handleLogin() {
		if (!keyInput.trim()) return;
		loading = true;
		error = '';

		try {
			await verifyKey(keyInput.trim());
			await login(keyInput.trim());
			goto('/app');
		} catch (e) {
			error = 'Invalid key. Please check and try again.';
		} finally {
			loading = false;
		}
	}

	async function handleCreate() {
		loading = true;
		error = '';

		try {
			const result = await createAccount();
			generatedKey = result.key;
			mode = 'created';
		} catch {
			error = 'Failed to create account. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function handleContinue() {
		loading = true;
		error = '';

		try {
			await login(generatedKey);
			showToast('Account created');
			goto('/app');
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

{#if !auth.initialized}
	<div class="flex min-h-dvh items-center justify-center">
		<div class="text-text-muted">Loading...</div>
	</div>
{:else}
	<div class="flex min-h-dvh flex-col items-center justify-center px-4">
		<div class="w-full max-w-sm">
			<div class="mb-10 text-center">
				<h1 class="text-3xl font-bold tracking-tight">Relay</h1>
				<p class="text-text-secondary mt-2 text-sm">Private podcast player</p>
			</div>

		{#if mode === 'created'}
			<div class="flex flex-col gap-6">
				<div class="bg-surface-raised border-border rounded-xl border p-5">
					<h2 class="mb-4 text-lg font-semibold">Your new account key</h2>
					<KeyDisplay key={generatedKey} />
				</div>

				<button
					type="button"
					onclick={handleContinue}
					disabled={loading}
					class="bg-brand hover:bg-brand-hover w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
				>
					{loading ? 'Loading...' : 'I\'ve saved my key, continue'}
				</button>

				{#if error}
					<p class="text-center text-sm text-red-400">{error}</p>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#if mode === 'login'}
					<form onsubmit={handleLogin} class="flex flex-col gap-4">
						<div>
							<label for="login-key" class="text-text-secondary mb-1.5 block text-sm font-medium"
								>Enter your key</label
							>
							<input
								id="login-key"
								type="password"
								bind:value={keyInput}
								autocomplete="current-password"
								placeholder="Your account key"
								class="bg-surface-raised border-border text-text-primary placeholder:text-text-muted w-full rounded-lg border px-4 py-3 text-base focus:border-brand focus:outline-none"
							/>
						</div>

						{#if error}
							<p class="text-sm text-red-400">{error}</p>
						{/if}

						<button
							type="submit"
							disabled={loading || !keyInput.trim()}
							class="bg-brand hover:bg-brand-hover w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
						>
							{loading ? 'Verifying...' : 'Log in'}
						</button>
					</form>

					<div class="relative my-2">
						<div class="border-border absolute inset-0 flex items-center">
							<div class="border-border w-full border-t"></div>
						</div>
						<div class="relative flex justify-center">
							<span class="bg-surface text-text-muted px-3 text-xs">or</span>
						</div>
					</div>

					<button
						type="button"
						onclick={() => {
							mode = 'create';
							error = '';
						}}
						class="border-border text-text-secondary hover:bg-surface-raised w-full rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
					>
						Create new account
					</button>
				{:else}
					<div class="bg-surface-raised border-border rounded-xl border p-5">
						<h2 class="mb-2 text-lg font-semibold">Create account</h2>
						<p class="text-text-secondary mb-4 text-sm">
							A unique key will be generated for you. No email or password needed.
						</p>
						<p class="text-text-muted mb-4 text-xs">
							Your key is the only way to access your account. If you lose it, your data cannot be recovered.
						</p>

						{#if error}
							<p class="mb-4 text-sm text-red-400">{error}</p>
						{/if}

						<button
							type="button"
							onclick={handleCreate}
							disabled={loading}
							class="bg-brand hover:bg-brand-hover w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
						>
							{loading ? 'Generating...' : 'Generate my key'}
						</button>
					</div>

					<button
						type="button"
						onclick={() => {
							mode = 'login';
							error = '';
						}}
						class="text-text-muted hover:text-text-secondary text-sm transition-colors"
					>
						Already have a key? Log in
					</button>
				{/if}
			</div>
		{/if}
		</div>
	</div>
{/if}
