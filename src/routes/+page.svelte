<!-- src/routes/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import IcBattery4Bar from '~icons/ic/outline-battery-4-bar';
	import IcBatteryAlert from '~icons/ic/outline-battery-alert';
	import IcBatteryChargingFull from '~icons/ic/outline-battery-charging-full';
	import IcBatteryFull from '~icons/ic/outline-battery-full';
	import IcBatteryUnknown from '~icons/ic/outline-battery-unknown';
	import IcFavorite from '~icons/ic/outline-favorite';
	import IcPeople from '~icons/ic/outline-people';
	import IcSmartphone from '~icons/ic/outline-smartphone';
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/index.css';
	import '#lib/styles/presence.css';
	import SelfieDust from '#lib/components/SelfieDust.svelte';
	import { STATUS_LABEL, subscribePresence, type Presence } from '#lib/scripts/discord.ts';
	import { timeAgo } from '#lib/scripts/music.ts';
	import {
		fetchDevice,
		fetchFronters,
		memberName,
		type Device,
		type Member
	} from '#lib/scripts/plural.ts';

	import { discordId } from '#lib';

	const PHONE = 'S26';

	let presence = $state<Presence | null>(null);
	let now = $state(Date.now());
	let fronters = $state<Member[]>([]);
	let phone = $state<Device | null>(null);

	// Hover, keyboard focus or a tap on phones swaps to the real selfie
	let revealed = $state(false);

	$effect(() => {
		// Fronting and phone pills are left out if these fail
		const loadFronters = () =>
			fetchFronters()
				.then((m) => (fronters = m))
				.catch(() => {});
		const loadPhone = () =>
			fetchDevice(PHONE)
				.then((d) => (phone = d))
				.catch(() => {});
		loadFronters();
		loadPhone();

		// The socket only says something changed, so refetch rather than
		// relying on the shape of each update
		const unsubscribe = subscribePresence(
			[discordId],
			(p) => (presence = p),
			(type) => {
				if (type === 'fronters_update' || type === 'reconnect') loadFronters();
				if (type === 'device_update' || type === 'reconnect') loadPhone();
			}
		);
		const tick = setInterval(() => (now = Date.now()), 60_000);
		return () => {
			unsubscribe();
			clearInterval(tick);
		};
	});

	const status = $derived(presence ? (presence.streaming ? 'streaming' : presence.status) : null);

	const BatteryIcon = $derived.by(() => {
		const level = phone?.level;
		if (phone?.charging) return IcBatteryChargingFull;
		if (level == null) return IcBatteryUnknown;
		if (level >= 80) return IcBatteryFull;
		if (level >= 35) return IcBattery4Bar;
		return IcBatteryAlert;
	});
</script>

<Meta
	title="Clove Twilight"
	description="Clove Twilight, an AI-neutral software developer and music enthusiast. Projects, languages, live Discord presence and more."
/>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Doughmination</p>
		<h1>Clove Twilight</h1>
		<p class="subtitle">AI-Neutral Software Developer ▪ Music Enthusiast</p>
		<div class="intro">
			<p class="lede">
				I&apos;ve been programming for nine years, starting out writing Discord bots in JavaScript
				as a side project, and have since worked with various <a href="/stack"
					>languages and frameworks</a
				>.
				<br />
				These are primarily Python and TypeScript, but I&apos;ve expanded into
				<a href="/languages">more languages</a> than I thought I would.
				<br />
				More <a href="/about">about me</a>, and <a href="/ai">where I stand on AI</a>.
				<br />
				Looking for the old site? It&apos;s still up at
				<a href="https://v1.doughmination.gay">v1.doughmination.gay</a>.
			</p>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<figure
				class="selfie-box"
				class:revealed
				onpointerenter={(e) => e.pointerType !== 'touch' && (revealed = true)}
				onpointerleave={(e) => e.pointerType !== 'touch' && (revealed = false)}
				onpointerup={(e) => e.pointerType === 'touch' && (revealed = !revealed)}
				onfocusin={() => (revealed = true)}
				onfocusout={() => (revealed = false)}
			>
				<div class="selfie-photo">
					<SelfieDust
						{revealed}
						from={{
							src: '/avatar.avif',
							alt: 'Selfie of Clove',
							width: 400,
							height: 400
						}}
						to={{ src: '/avatar.avif', alt: '', width: 400, height: 400 }}
					/>

					{#if status}
						<a
							class="selfie-status"
							href="/discord"
							data-status={status}
							title="{STATUS_LABEL[status]} on Discord"
							aria-label="{STATUS_LABEL[status]} on Discord"
						></a>
					{/if}
				</div>

				<figcaption>
					<span class="selfie-caption">Pixel art ♡</span>
					<span class="selfie-caption selfie-caption-hover" aria-hidden="true"
						>My fave selfie ♡</span
					>
				</figcaption>
			</figure>
		</div>
		<p class="now">
			{#if fronters.length}
				<span class="now-item" title="Currently fronting">
					<span class="now-icon" aria-hidden="true"><IcPeople /></span>
					<span class="now-row">
						Fronting
						{#each fronters as member, i (member.id)}
							<span class="now-member" style:--member={member.color ? '#' + member.color : null}>
								{#if member.avatar_url}<img
										class="now-avatar"
										src={member.avatar_url.replace(/([?&]size=)\d+/, '$164')}
										alt=""
										width="20"
										height="20"
										loading="lazy"
									/>{/if}<strong>{memberName(member)}</strong>{#if member.pronouns}<span
										class="now-muted">({member.pronouns})</span
									>{/if}{#if i < fronters.length - 1},{/if}
							</span>
						{/each}
					</span>
				</span>
			{/if}
			{#if phone}
				<span
					class="now-item"
					title="Phone, updated {timeAgo(Math.floor(Date.parse(phone.updated_at) / 1000), now)}"
				>
					<span class="now-icon" aria-hidden="true"><IcSmartphone /></span>
					<span class="now-row">
						Phone
						{#if phone.level != null}
							<strong
								class="now-battery"
								class:now-battery-low={phone.level < 20 && !phone.charging}
							>
								<span class="now-icon" aria-hidden="true"><BatteryIcon /></span>{phone.level}%
							</strong>
						{/if}
						{#if phone.charging}<span class="now-muted">· charging</span>{/if}
						{#if phone.lowPowerMode}<span class="now-muted">· power saving</span>{/if}
						{#if phone.wifi}<span class="now-muted">· on Wi-Fi</span>{/if}
					</span>
				</span>
			{/if}
			<a class="now-item" href="https://bwah.dev" target="_blank" rel="noopener">
				<span class="now-icon now-heart" aria-hidden="true"><IcFavorite /></span>
				<span>In a relationship with <strong>Aria</strong></span>
			</a>
		</p>
	</div>
</section>
