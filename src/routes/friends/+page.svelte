<!-- src/routes/friends/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/presence.css';
	import '#lib/styles/friends.css';
	import FriendCard, { type Friend } from '#lib/components/FriendCard.svelte';
	import {
		fetchUser,
		subscribePresence,
		type DiscordRecord,
		type Presence
	} from '#lib/scripts/discord.ts';

	const FRIENDS: Friend[] = [
		{ name: 'Aria', tier: 'wife', discordId: '1474568910736199825', link: 'https://bwah.devv' },
		{ name: 'Ria', tier: 'close', discordId: '1513506390088618145' }
	];

	const ids = FRIENDS.map((f) => f.discordId);

	let records = $state<Record<string, DiscordRecord>>({});
	let presences = $state<Record<string, Presence>>({});
	let now = $state(Date.now());

	$effect(() => {
		// Each card falls back to its static name if its lookup fails
		for (const id of ids) {
			fetchUser(id)
				.then((r) => {
					records[id] = r;
				})
				.catch(() => {});
		}
		const unsubscribe = subscribePresence(ids, (p) => {
			presences[p.user_id] = p;
		});
		const tick = setInterval(() => (now = Date.now()), 1000);
		return () => {
			unsubscribe();
			clearInterval(tick);
		};
	});
</script>

<Meta title="Friends" description="Friends of Clove Twilight, with their live Discord presence." />

<svelte:head>
	<link rel="preconnect" href="https://doughmination.uk" crossorigin="" />
	<link rel="preconnect" href="https://cdn.discordapp.com" />
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Clove Twilight</p>
		<h1>Friends</h1>
		<p class="subtitle">
			This is where people I know get a spot on my site. Click their names to visit their pages.
		</p>
	</div>
</section>

<div class="friends wrap">
	<div class="friend-grid">
		{#each FRIENDS as friend (friend.discordId)}
			{@const record = records[friend.discordId] ?? null}
			<FriendCard
				{friend}
				{record}
				presence={presences[friend.discordId] ?? record?.presence ?? null}
				{now}
			/>
		{/each}
	</div>

	<p class="friends-credit">
		Presence data is served by <a href="https://doughmination.uk">the Doughmination API</a>.
	</p>
</div>
