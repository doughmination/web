<!-- src/lib/components/FriendCard.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts" module>
	export type Tier = 'wife' | 'close' | 'closer' | 'known';

	export interface Friend {
		name: string;
		tier?: Tier;
		discordId: string;
		link?: string;
	}
</script>

<script lang="ts">
	import ListeningIcon from '#lib/components/ListeningIcon.svelte';
	import {
		pickListening,
		assetUrl,
		emojiUrl,
		clamp,
		fmtDuration,
		fmtElapsed,
		fmtClock,
		fmtUtcOffset,
		fmtMonthYear,
		fmtPrice,
		renderMarkdown,
		findCollectible,
		realConnections,
		nameGradient,
		revealSpoiler,
		hideBroken,
		STATUS_LABEL,
		NITRO_LABEL,
		NAME_FONTS,
		WISHLIST_TYPE,
		CONNECTION_URLS,
		type DiscordRecord,
		type Presence
	} from '#lib/scripts/discord.ts';

	const TIER_LABEL: Record<Tier | 'mutual', string> = {
		mutual: 'mutual',
		wife: 'wife',
		close: 'close',
		closer: 'closer',
		known: 'known'
	};

	let {
		friend,
		record,
		presence,
		now
	}: {
		friend: Omit<Friend, 'discordId'>;
		record: DiscordRecord | null;
		presence: Presence | null;
		now: number;
	} = $props();

	let wishlistOpen = $state(false);

	const user = $derived(record?.user);
	const activities = $derived(presence?.activities ?? []);
	const status = $derived(presence?.streaming ? 'streaming' : (presence?.status ?? 'offline'));
	const games = $derived(activities.filter((a) => a.type === 0));
	const streams = $derived(activities.filter((a) => a.type === 1));
	const listening = $derived(pickListening(presence));

	const name = $derived(
		user ? user.display_name || user.global_name || user.username : friend.name
	);
	const handle = $derived(user?.username ?? '');
	const avatar = $derived(user?.avatar_url ?? 'https://cdn.discordapp.com/embed/avatars/0.png');
	const gradient = $derived(nameGradient(user?.display_name_styles?.colors));
	const decoration = $derived(findCollectible(record, 'avatar_decoration'));
	const pronouns = $derived(user?.pronouns || record?.pronoundb || '');
	const tzOffset = $derived(record?.timezone?.utc_offset_minutes ?? null);
	const nitro = $derived(user?.premium ? NITRO_LABEL[user.premium.type] : undefined);
	const bio = $derived(user?.bio?.trim() ? renderMarkdown(user.bio.trim()) : '');
	const connections = $derived(realConnections(record));
	const wishlist = $derived((record?.wishlist ?? []).filter(Boolean));

	const platforms = $derived(
		[
			presence?.platform.desktop && { label: 'Desktop', icon: 'monitor' },
			presence?.platform.mobile && { label: 'Mobile', icon: 'mobile' },
			presence?.platform.web && { label: 'Web', icon: 'global' }
		].filter((p) => !!p)
	);

	const progress = $derived.by(() => {
		const start = listening?.track.timestamps?.start ?? 0;
		const end = listening?.track.timestamps?.end ?? 0;
		if (!(end > start)) return null;
		const elapsed = clamp(now - start, 0, end - start);
		return { elapsed, total: end - start, pct: (elapsed / (end - start)) * 100 };
	});
</script>

<article class="friend-card" data-tier={friend.tier ?? 'mutual'} data-status={status}>
	{#if user?.banner_url}
		<img
			class="fc-banner"
			src={user.banner_url}
			alt=""
			referrerpolicy="no-referrer"
			onerror={hideBroken}
		/>
	{/if}

	<div class="fc-head">
		<span class="fc-avatar">
			<img class="fc-av-img" src={avatar} alt="" referrerpolicy="no-referrer" />
			{#if decoration?.static_image_url || decoration?.animated_image_url}
				<img
					class="fc-av-deco"
					src={decoration.animated_image_url ?? decoration.static_image_url}
					alt=""
					aria-hidden="true"
					onerror={hideBroken}
				/>
			{/if}
			{#if record}<span class="fc-status" title={STATUS_LABEL[status]}></span>{/if}
		</span>

		<div class="fc-id">
			<div class="fc-name-row">
				<span class="fc-tier">[{TIER_LABEL[friend.tier ?? 'mutual']}]</span>
				<svelte:element
					this={friend.link ? 'a' : 'span'}
					class="fc-name"
					class:name-gradient={!!gradient}
					style:background-image={gradient}
					style:font-family={NAME_FONTS[user?.display_name_styles?.font_id ?? 0]}
					href={friend.link}
					target={friend.link ? '_blank' : undefined}
					rel={friend.link ? 'noopener' : undefined}>{name}</svelte:element
				>
				{#if user?.clan?.tag}
					<span class="fc-tag">
						{#if user.clan.badge_url}<img
								src={user.clan.badge_url}
								alt=""
								onerror={hideBroken}
							/>{/if}
						{user.clan.tag}
					</span>
				{/if}
			</div>

			<div class="fc-sub">
				{#if handle}<span>@{handle}</span>{/if}
				{#if record}<span class="fc-status-text">{STATUS_LABEL[status]}</span>{/if}
				{#if pronouns}<span class="chip">{pronouns}</span>{/if}
				{#if tzOffset != null}
					<span class="chip" title="{record?.timezone?.timezone ?? ''} ({fmtUtcOffset(tzOffset)})">
						<iconsax-icon name="clock" type="bulk" size="24" aria-hidden="true"
						></iconsax-icon>{fmtClock(now, tzOffset)}
					</span>
				{/if}
				{#if nitro}
					<span
						class="chip"
						title={user?.premium?.since
							? `${nitro} since ${fmtMonthYear(user.premium.since)}`
							: nitro}>{nitro}</span
					>
				{/if}
				{#if user?.premium?.guild_since}
					<span
						class="chip"
						title="Boosting since {fmtMonthYear(user.premium.guild_since)}"
						aria-label="Server booster"
					>
						<iconsax-icon name="diamonds" type="bulk" size="24" aria-hidden="true"></iconsax-icon>
					</span>
				{/if}
				{#each platforms as p (p.label)}
					<iconsax-icon
						name={p.icon}
						type="bulk"
						size="24"
						class="fc-platform"
						aria-label={p.label}
						role="img"
					></iconsax-icon>
				{/each}
			</div>

			{#if record?.badges.length || record?.clientBadges?.length}
				<div class="fc-badges">
					{#each record.badges as b (b.id)}
						{#if b.icon_url}
							<img
								src={b.icon_url}
								alt={b.description}
								title={b.description}
								onerror={hideBroken}
							/>
						{/if}
					{/each}
					{#each record.clientBadges ?? [] as b, i (b.id + i)}
						<img
							src={b.icon_url}
							alt={b.tooltip}
							title={b.tooltip}
							loading="lazy"
							referrerpolicy="no-referrer"
							onerror={hideBroken}
						/>
					{/each}
				</div>
			{/if}

			{#if presence?.custom_status?.text || presence?.custom_status?.emoji?.id}
				<p class="fc-custom">
					{#if presence.custom_status.emoji?.id}
						<img
							src={presence.custom_status.emoji.url ??
								emojiUrl(presence.custom_status.emoji.id, presence.custom_status.emoji.animated)}
							alt=""
						/>
					{/if}
					{presence.custom_status.text ?? ''}
				</p>
			{/if}
		</div>

		{#if record}
			<button
				class="fc-star"
				class:on={wishlistOpen}
				type="button"
				aria-label="Show wishlist"
				title="Wishlist"
				aria-expanded={wishlistOpen}
				onclick={() => (wishlistOpen = !wishlistOpen)}
			>
				<iconsax-icon name="star" type="bulk" size="24" aria-hidden="true"></iconsax-icon>
			</button>
		{/if}
	</div>

	{#if bio}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="bio fc-bio" onclick={revealSpoiler} onkeydown={revealSpoiler}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all text -->
			{@html bio}
		</div>
	{/if}

	{#if connections.length}
		<div class="fc-connections">
			{#each connections as c, i (c.type + ':' + c.id + i)}
				{@const href = CONNECTION_URLS[c.type]?.(c.name, c.id)}
				<svelte:element
					this={href ? 'a' : 'span'}
					class="fc-conn"
					{href}
					target={href ? '_blank' : undefined}
					rel={href ? 'noopener' : undefined}
					title={c.type}
				>
					<iconsax-icon name="link" type="bulk" size="24" aria-hidden="true"></iconsax-icon>
					<span class="fc-conn-name">{c.name}</span>
					{#if c.verified}<iconsax-icon
							name="verify"
							type="bulk"
							size="24"
							class="fc-conn-check"
							aria-label="Verified"
							role="img"
						></iconsax-icon>{/if}
				</svelte:element>
			{/each}
		</div>
	{/if}

	{#if listening || games.length || streams.length}
		<div class="fc-sections">
			{#if listening}
				<div class="fc-row">
					{#if listening.track.album_art_url}
						<img
							class="fc-row-img"
							src={listening.track.album_art_url}
							alt=""
							onerror={hideBroken}
						/>
					{/if}
					<div class="fc-row-text">
						<p class="fc-row-kind">
							<ListeningIcon source={listening.source} />
							{listening.source === 'doughmination'
								? 'Listening on Doughmination Music'
								: 'Listening to Spotify'}
						</p>
						<p class="fc-row-title">{listening.track.song}</p>
						<p class="fc-row-sub">{listening.track.artist}</p>
						<div class="fc-bar" aria-hidden="true">
							<div style:width="{progress?.pct ?? 0}%"></div>
						</div>
						<p class="fc-times">
							<span>{fmtDuration(progress?.elapsed ?? 0)}</span>
							<span>{fmtDuration(progress?.total ?? 0)}</span>
						</p>
					</div>
				</div>
			{/if}
			{#each games as a, i (i)}
				{@const isCode = /visual studio code|vscode/i.test(a.name ?? '')}
				{@const large = assetUrl(a.application_id, a.assets?.large_image)}
				{@const party =
					a.party?.size?.length === 2 && a.party.size[1]
						? ` · ${a.party.size[0]} of ${a.party.size[1]}`
						: ''}
				<div class="fc-row">
					{#if large}
						<img class="fc-row-img" src={large} alt="" onerror={hideBroken} />
					{:else}
						<span class="fc-dot" aria-hidden="true"></span>
					{/if}
					<div class="fc-row-text">
						<p class="fc-row-kind">{isCode ? 'Coding' : `Playing ${a.name ?? ''}`}{party}</p>
						<p class="fc-row-title">{a.details || (isCode ? '' : a.name) || ''}</p>
						<p class="fc-row-sub">{a.state || a.assets?.large_text || ''}</p>
						{#if a.timestamps?.start}<p class="fc-row-sub">
								{fmtElapsed(a.timestamps.start, now)}
							</p>{/if}
					</div>
				</div>
			{/each}
			{#each streams as a, i (i)}
				{@const platform =
					a.url && /twitch/i.test(a.url)
						? 'Twitch'
						: a.url && /youtube/i.test(a.url)
							? 'YouTube'
							: 'Live'}
				<svelte:element
					this={a.url ? 'a' : 'div'}
					class="fc-row"
					href={a.url}
					target={a.url ? '_blank' : undefined}
					rel={a.url ? 'noopener' : undefined}
				>
					{#if a.assets?.large_image_url}
						<img
							class="fc-row-img fc-stream"
							src={a.assets.large_image_url}
							alt=""
							loading="lazy"
							referrerpolicy="no-referrer"
							onerror={hideBroken}
						/>
					{:else}
						<span class="fc-dot" aria-hidden="true"></span>
					{/if}
					<div class="fc-row-text">
						<p class="fc-row-kind">Streaming on {platform}</p>
						<p class="fc-row-title">{a.details || a.name || ''}</p>
						<p class="fc-row-sub">{a.state ?? ''}</p>
					</div>
				</svelte:element>
			{/each}
		</div>
	{/if}

	{#if wishlistOpen}
		<div class="fc-wishlist">
			<p class="fc-wishlist-title">Wishlist</p>
			{#each wishlist as w (w.sku_id)}
				{@const img = w.static_image_url || w.animated_image_url}
				{@const price = fmtPrice(w.price)}
				<div class="fc-wl-item" class:owned={w.is_owned}>
					{#if img}<img
							src={img}
							alt=""
							loading="lazy"
							referrerpolicy="no-referrer"
							onerror={hideBroken}
						/>{/if}
					<span class="fc-wl-text">
						<span class="fc-wl-name">{w.name || 'Collectible'}</span>
						{#if WISHLIST_TYPE[w.type]}<span class="fc-wl-type">{WISHLIST_TYPE[w.type]}</span>{/if}
					</span>
					{#if price}<span class="fc-wl-price">{price}</span>{/if}
				</div>
			{:else}
				<p class="fc-empty">Nothing on the wishlist yet</p>
			{/each}
		</div>
	{/if}
</article>
