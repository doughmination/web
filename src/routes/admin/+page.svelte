<!-- src/routes/admin/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import { enhance } from '$app/forms';
	import '#lib/styles/guestbook.css';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let filter = $state<'pending' | 'approved' | 'all'>('pending');

	const shown = $derived(
		filter === 'all' ? data.entries : data.entries.filter((e) => e.status === filter)
	);
	const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<svelte:head>
	<title>Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Signed in as {data.name}</p>
		<h1>Guestbook admin</h1>
		<form method="POST" action="?/logout">
			<button class="gb-link">Sign out</button>
		</form>
	</div>
</section>

<section class="guestbook wrap">
	{#if form?.error}
		<p class="gb-notice error" role="alert">{form.error}</p>
	{/if}

	<div class="gb-tabs" role="tablist">
		{#each [['pending', `Pending (${data.pending})`], ['approved', 'Approved'], ['all', 'All']] as const as [value, label] (value)}
			<button
				role="tab"
				aria-selected={filter === value}
				class:active={filter === value}
				onclick={() => (filter = value)}>{label}</button
			>
		{/each}
	</div>

	{#if shown.length === 0}
		<p class="gb-empty">Nothing here.</p>
	{:else}
		<ol class="gb-entries">
			{#each shown as entry (entry.id)}
				<li class="gb-entry" class:pending={entry.status === 'pending'}>
					<p class="gb-meta">
						<strong>{entry.name}</strong>
						{#if entry.website}<span class="gb-site">{entry.website}</span>{/if}
						<time datetime={new Date(entry.ts).toISOString()}>{dateFormat.format(entry.ts)}</time>
					</p>
					<p class="gb-message">{entry.message}</p>
					{#if entry.flagged?.length}
						<p class="gb-flagged">Held for: {entry.flagged.join(', ')}</p>
					{/if}
					<form method="POST" class="gb-entry-actions" use:enhance>
						<input type="hidden" name="id" value={entry.id} />
						{#if entry.status === 'pending'}
							<button formaction="?/approve">Approve</button>
						{:else}
							<button formaction="?/hold">Hide</button>
						{/if}
						<button
							formaction="?/delete"
							class="danger"
							onclick={(e) => {
								if (!confirm(`Delete the message from ${entry.name}?`)) e.preventDefault();
							}}>Delete</button
						>
					</form>
				</li>
			{/each}
		</ol>
	{/if}

	<form
		method="POST"
		action="?/blocklist"
		class="gb-form"
		use:enhance={() =>
			({ update }) =>
				update({ reset: false })}
	>
		<label>
			<span>Blocklist, one word or phrase per line</span>
			<textarea name="words" rows="10" spellcheck="false">{data.words.join('\n')}</textarea>
		</label>
		<p class="gb-hint">
			Matching ignores case, accents, spaces, punctuation, repeated letters and lookalikes like
			<code>@</code> for <code>a</code>, and also checks inside longer words. A match holds the
			message for review here rather than rejecting it. Changes only affect new messages.
		</p>
		<div class="gb-actions">
			<button type="submit">Save blocklist</button>
			{#if form?.saved}<p class="gb-notice ok" role="status">Saved.</p>{/if}
		</div>
	</form>
</section>
