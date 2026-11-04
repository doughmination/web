<!-- src/routes/guestbook/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$app/env/public';
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/guestbook.css';
	import { apiBase } from '#lib';
	import { LIMITS, fetchEntries, signGuestbook, type Entry } from '#lib/scripts/guestbook.ts';

	const PAGE_SIZE = 50;
	const siteKey = PUBLIC_TURNSTILE_SITE_KEY;

	let entries = $state<Entry[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadError = $state('');

	let message = $state('');
	let sending = $state(false);
	let notice = $state<{ kind: 'ok' | 'error'; text: string } | null>(null);

	const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' });

	async function load(offset = 0) {
		try {
			const page = await fetchEntries(PAGE_SIZE, offset);
			entries = offset ? [...entries, ...page.entries] : page.entries;
			total = page.total;
			loadError = '';
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Could not load the guestbook';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		load();
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const field = (name: string) => String(data.get(name) ?? '');

		sending = true;
		notice = null;
		try {
			const result = await signGuestbook({
				name: field('name'),
				message: field('message'),
				website: field('website'),
				url2: field('url2'),
				turnstileToken: field('cf-turnstile-response') || undefined
			});
			if (result.entry) {
				entries = [result.entry, ...entries];
				total += 1;
			}
			notice = result.pending
				? { kind: 'ok', text: 'Thanks! Your message is waiting for a quick review.' }
				: { kind: 'ok', text: 'Thanks for signing!' };
			form.reset();
			message = '';
		} catch (err) {
			notice = { kind: 'error', text: err instanceof Error ? err.message : 'Could not sign' };
		} finally {
			sending = false;
			(window as { turnstile?: { reset(): void } }).turnstile?.reset();
		}
	}
</script>

<Meta
	title="Guestbook"
	description="Sign Clove Twilight's guestbook and leave a message for whoever drops by next."
/>

<svelte:head>
	<link rel="preconnect" href={apiBase} crossorigin="" />
	{#if siteKey}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Clove Twilight</p>
		<h1>Guestbook</h1>
		<p class="subtitle">Say hi, leave a note, or just let me know you stopped by.</p>
	</div>
</section>

<section class="guestbook wrap">
	<form class="gb-form" onsubmit={submit}>
		<div class="gb-row">
			<label>
				<span>Name</span>
				<input name="name" required maxlength={LIMITS.name} autocomplete="nickname" />
			</label>
			<label>
				<span>Website <em>(optional)</em></span>
				<input name="website" type="url" maxlength={LIMITS.website} placeholder="https://" />
			</label>
		</div>
		<label>
			<span>Message</span>
			<textarea name="message" required maxlength={LIMITS.message} rows="4" bind:value={message}
			></textarea>
			<small class="gb-count">{message.length}/{LIMITS.message}</small>
		</label>
		<!-- Honeypot: hidden from people, filled in by bots -->
		<label class="gb-trap" aria-hidden="true">
			<span>Leave this empty</span>
			<input name="url2" tabindex="-1" autocomplete="off" />
		</label>
		{#if siteKey}
			<div class="cf-turnstile" data-sitekey={siteKey} data-theme="dark"></div>
		{/if}
		<div class="gb-actions">
			<button type="submit" disabled={sending}>{sending ? 'Signing…' : 'Sign the guestbook'}</button
			>
			{#if notice}
				<p class="gb-notice {notice.kind}" role="status">{notice.text}</p>
			{/if}
		</div>
	</form>

	{#if loading}
		<p class="gb-empty">Loading messages…</p>
	{:else if loadError}
		<p class="gb-empty">{loadError}</p>
	{:else if entries.length === 0}
		<p class="gb-empty">No messages yet. Be the first!</p>
	{:else}
		<ol class="gb-entries">
			{#each entries as entry (entry.id)}
				<li class="gb-entry">
					<p class="gb-meta">
						{#if entry.website}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={entry.website} rel="nofollow ugc noopener" target="_blank">{entry.name}</a>
						{:else}
							<strong>{entry.name}</strong>
						{/if}
						<time datetime={new Date(entry.ts).toISOString()}>
							{dateFormat.format(entry.ts)}
						</time>
					</p>
					<p class="gb-message">{entry.message}</p>
				</li>
			{/each}
		</ol>
		{#if entries.length < total}
			<button class="gb-more" onclick={() => load(entries.length)}>Load more</button>
		{/if}
	{/if}
</section>
