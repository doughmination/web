<!-- src/routes/discord/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/presence.css';
	import '#lib/styles/discord.css';
	import ListeningIcon from '#lib/components/ListeningIcon.svelte';
	import {
		fetchUser,
		subscribePresence,
		pickListening,
		assetUrl,
		emojiUrl,
		clamp,
		fmtDuration,
		fmtElapsed,
		fmtMonthYear,
		fmtClock,
		fmtUtcOffset,
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

	import { discordId } from '#lib';

	let record = $state<DiscordRecord | null>(null);
	let livePresence = $state<Presence | null>(null);
	let error = $state<string | null>(null);
	let now = $state(Date.now());
	let connectionsOpen = $state(false);
	let wishlistOpen = $state(false);

	$effect(() => {
		fetchUser(discordId)
			.then((r) => {
				record = r;
				connectionsOpen = r.connected_accounts.length <= 8;
				wishlistOpen = (r.wishlist?.length ?? 0) <= 6;
			})
			.catch((e) => (error = e instanceof Error ? e.message : String(e)));
		const unsubscribe = subscribePresence([discordId], (p) => (livePresence = p));
		const tick = setInterval(() => (now = Date.now()), 1000);
		return () => {
			unsubscribe();
			clearInterval(tick);
		};
	});

	const presence = $derived(livePresence ?? record?.presence ?? null);
	const user = $derived(record?.user);
	const activities = $derived(presence?.activities ?? []);

	const status = $derived(presence?.streaming ? 'streaming' : (presence?.status ?? 'offline'));
	const games = $derived(activities.filter((a) => a.type === 0));
	const streams = $derived(activities.filter((a) => a.type === 1));
	const listening = $derived(pickListening(presence));

	const gradient = $derived(nameGradient(user?.display_name_styles?.colors));
	const decoration = $derived(findCollectible(record, 'avatar_decoration'));
	const nameplate = $derived(findCollectible(record, 'nameplate'));
	const pronouns = $derived(user?.pronouns || record?.pronoundb || '');
	const tzOffset = $derived(record?.timezone?.utc_offset_minutes ?? null);
	const nitro = $derived(user?.premium ? NITRO_LABEL[user.premium.type] : undefined);
	const bio = $derived(user?.bio?.trim() ? renderMarkdown(user.bio.trim()) : '');

	const platforms = $derived(
		[
			presence?.platform.desktop && { label: 'Desktop', icon: 'monitor' },
			presence?.platform.mobile && { label: 'Mobile', icon: 'mobile' },
			presence?.platform.web && { label: 'Web', icon: 'global' }
		].filter((p) => !!p)
	);

	const connections = $derived(realConnections(record));
	const wishlist = $derived((record?.wishlist ?? []).filter(Boolean));
	const hasBadges = $derived(!!(record?.badges.length || record?.clientBadges?.length));

	const progress = $derived.by(() => {
		const start = listening?.track.timestamps?.start ?? 0;
		const end = listening?.track.timestamps?.end ?? 0;
		if (!(end > start)) return null;
		const elapsed = clamp(now - start, 0, end - start);
		return { elapsed, total: end - start, pct: (elapsed / (end - start)) * 100 };
	});
</script>

<Meta
	title="Discord"
	description="Clove&apos;s live Discord presence: current status, activity and what fae is up to right now."
/>

<svelte:head>
	<link rel="preconnect" href="https://doughmination.uk" crossorigin="" />
	<link rel="preconnect" href="https://cdn.discordapp.com" />
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Clove Twilight</p>
		<h1>Discord</h1>
		<p class="subtitle">What fae is up to, live via the Doughmination API</p>
	</div>
</section>

<section class="discord wrap">
	{#if error}
		<p class="discord-error" role="alert">Couldn&apos;t load the profile: {error}</p>
	{:else if !record || !user}
		<div class="discord-skeleton" aria-busy="true" aria-label="Loading profile"></div>
	{:else}
		<div class="masthead">
			{#if user.banner_url}
				<img
					class="banner"
					src={user.banner_url}
					alt=""
					referrerpolicy="no-referrer"
					onerror={hideBroken}
				/>
			{:else}
				<div class="banner banner-fallback" aria-hidden="true"></div>
			{/if}

			<div class="identity">
				<div class="avatar-wrap">
					<img class="avatar" src={user.avatar_url} alt="" referrerpolicy="no-referrer" />
					{#if decoration?.static_image_url || decoration?.animated_image_url}
						<img
							class="avatar-deco"
							src={decoration.animated_image_url ?? decoration.static_image_url}
							alt=""
							aria-hidden="true"
							onerror={hideBroken}
						/>
					{/if}
					<span class="status-pip" data-status={status} title={STATUS_LABEL[status]}></span>
				</div>

				<div class="id-block">
					{#if nameplate?.static_image_url}
						<img
							class="nameplate"
							src={nameplate.static_image_url}
							alt=""
							aria-hidden="true"
							onerror={hideBroken}
						/>
					{/if}
					<div class="name-row">
						<h2
							class="name"
							class:name-gradient={!!gradient}
							style:background-image={gradient}
							style:font-family={NAME_FONTS[user.display_name_styles?.font_id ?? 0]}
						>
							{user.display_name || user.global_name || user.username}
						</h2>
						{#if user.clan?.tag}
							<span class="guild-tag">
								{#if user.clan.badge_url}<img
										src={user.clan.badge_url}
										alt=""
										onerror={hideBroken}
									/>{/if}
								{user.clan.tag}
							</span>
						{/if}
					</div>

					<div class="sub-row">
						<span class="handle">@{user.username}</span>
						<span class="status-text" data-status={status}>
							<span class="status-dot"></span>{STATUS_LABEL[status]}
						</span>
						{#if pronouns}<span class="chip">{pronouns}</span>{/if}
						{#if tzOffset != null}
							<span
								class="chip"
								title="{record.timezone?.timezone ?? ''} ({fmtUtcOffset(tzOffset)})"
							>
								<iconsax-icon name="clock" type="bulk" size="24" aria-hidden="true"
								></iconsax-icon>{fmtClock(now, tzOffset)}
							</span>
						{/if}
						{#if nitro}
							<span
								class="chip"
								title={user.premium?.since
									? `${nitro} since ${fmtMonthYear(user.premium.since)}`
									: nitro}>{nitro}</span
							>
						{/if}
						{#if user.premium?.guild_since}
							<span
								class="chip"
								title="Boosting since {fmtMonthYear(user.premium.guild_since)}"
								aria-label="Server booster"
							>
								<iconsax-icon name="diamonds" type="bulk" size="24" aria-hidden="true"
								></iconsax-icon>
							</span>
						{/if}
						{#if platforms.length}
							<span class="platforms">
								{#each platforms as p (p.label)}
									<iconsax-icon name={p.icon} type="bulk" size="24" aria-label={p.label} role="img"
									></iconsax-icon>
								{/each}
							</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="panel-grid">
			<section class="panel panel-wide">
				{#if listening}
					<h3 class="panel-title">
						<ListeningIcon source={listening.source} />
						{listening.source === 'doughmination'
							? 'Listening on Doughmination Music'
							: 'Listening to Spotify'}
					</h3>
					<div class="np-row">
						{#if listening.track.album_art_url}
							<img class="np-art" src={listening.track.album_art_url} alt="" onerror={hideBroken} />
						{/if}
						<div class="np-body">
							<p class="np-song">{listening.track.song}</p>
							<p class="np-artist">{listening.track.artist}</p>
							{#if listening.track.album}<p class="np-album">{listening.track.album}</p>{/if}
							<div
								class="np-bar"
								role="progressbar"
								aria-label="Track progress"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={Math.round(progress?.pct ?? 0)}
							>
								<div class="np-fill" style:width="{progress?.pct ?? 0}%"></div>
							</div>
							<div class="np-times">
								<span>{fmtDuration(progress?.elapsed ?? 0)}</span>
								<span>{fmtDuration(progress?.total ?? 0)}</span>
							</div>
						</div>
					</div>
				{:else}
					<h3 class="panel-title">Now Playing</h3>
					<p class="empty">Not listening to anything right now</p>
				{/if}
			</section>

			<section class="panel">
				<h3 class="panel-title">Status</h3>
				{#if presence?.custom_status?.text || presence?.custom_status?.emoji?.id}
					<p class="custom-status">
						{#if presence.custom_status.emoji?.id}
							<img
								src={presence.custom_status.emoji.url ??
									emojiUrl(presence.custom_status.emoji.id, presence.custom_status.emoji.animated)}
								alt=""
							/>
						{/if}
						<span>{presence.custom_status.text ?? ''}</span>
					</p>
				{:else}
					<p class="empty">No custom status set</p>
				{/if}
			</section>

			<section class="panel">
				<h3 class="panel-title">About</h3>
				{#if bio}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="bio" onclick={revealSpoiler} onkeydown={revealSpoiler}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown escapes all text -->
						{@html bio}
					</div>
				{:else}
					<p class="empty">No bio set</p>
				{/if}
			</section>

			<section class="panel">
				<h3 class="panel-title">Badges</h3>
				{#if hasBadges}
					<div class="badge-grid">
						{#each record.badges as b (b.id)}
							{#if b.icon_url}
								{#if b.link}
									<a href={b.link} target="_blank" rel="noopener">
										<img
											class="badge"
											src={b.icon_url}
											alt={b.description}
											title={b.description}
											onerror={hideBroken}
										/>
									</a>
								{:else}
									<img
										class="badge"
										src={b.icon_url}
										alt={b.description}
										title={b.description}
										onerror={hideBroken}
									/>
								{/if}
							{/if}
						{/each}
						{#each record.clientBadges ?? [] as b, i (b.id + i)}
							<img
								class="badge"
								src={b.icon_url}
								alt={b.tooltip}
								title={b.tooltip}
								loading="lazy"
								referrerpolicy="no-referrer"
								onerror={hideBroken}
							/>
						{/each}
					</div>
				{:else}
					<p class="empty">No badges</p>
				{/if}
			</section>

			<section class="panel">
				<h3 class="panel-title">Activity</h3>
				{#if games.length || streams.length}
					<div class="act-list">
						{#each games as a, i (i)}
							{@const isCode = /visual studio code|vscode/i.test(a.name ?? '')}
							{@const large = assetUrl(a.application_id, a.assets?.large_image)}
							{@const small = assetUrl(a.application_id, a.assets?.small_image)}
							{@const party =
								a.party?.size?.length === 2 && a.party.size[1]
									? ` · ${a.party.size[0]} of ${a.party.size[1]}`
									: ''}
							<div class="act-row">
								{#if large}
									<span class="act-icon">
										<img src={large} alt="" onerror={hideBroken} />
										{#if small}<img
												class="act-icon-badge"
												src={small}
												alt=""
												title={a.assets?.small_text ?? ''}
												onerror={hideBroken}
											/>{/if}
									</span>
								{:else}
									<span class="act-dot" aria-hidden="true"></span>
								{/if}
								<div class="act-body">
									<p class="act-kind">{isCode ? 'Coding' : `Playing ${a.name ?? ''}`}{party}</p>
									<p class="act-title">{a.details || (isCode ? '' : a.name) || ''}</p>
									<p class="act-sub">{a.state || a.assets?.large_text || ''}</p>
									{#if a.timestamps?.start}<p class="act-elapsed">
											{fmtElapsed(a.timestamps.start, now)}
										</p>{/if}
									{#if a.buttons?.length}
										<div class="act-buttons">
											{#each a.buttons as btn, j (j)}
												<span class="chip"
													>{typeof btn === 'string' ? btn : btn.label || 'Open'}</span
												>
											{/each}
										</div>
									{/if}
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
								class="act-row"
								href={a.url}
								target={a.url ? '_blank' : undefined}
								rel={a.url ? 'noopener' : undefined}
							>
								{#if a.assets?.large_image_url}
									<img
										class="stream-thumb"
										src={a.assets.large_image_url}
										alt=""
										loading="lazy"
										referrerpolicy="no-referrer"
										onerror={hideBroken}
									/>
								{:else}
									<span class="act-dot" aria-hidden="true"></span>
								{/if}
								<div class="act-body">
									<p class="act-kind">Streaming on {platform}</p>
									<p class="act-title">{a.details || a.name || ''}</p>
									<p class="act-sub">{a.state ?? ''}</p>
								</div>
							</svelte:element>
						{/each}
					</div>
				{:else}
					<p class="empty">No current activity</p>
				{/if}
			</section>

			<section class="panel">
				<button
					class="panel-toggle"
					type="button"
					aria-expanded={connectionsOpen}
					aria-controls="discord-connections"
					onclick={() => (connectionsOpen = !connectionsOpen)}
				>
					<span>Connections</span>
					<span class="panel-count">{connections.length}</span>
					<iconsax-icon
						name="arrow-right-02"
						type="bulk"
						size="24"
						class="chevron"
						aria-hidden="true"
					></iconsax-icon>
				</button>
				<div id="discord-connections" hidden={!connectionsOpen}>
					{#if connections.length}
						<div class="conn-grid" class:scroll-area={connections.length > 8}>
							{#each connections as c, i (c.type + ':' + c.id + i)}
								{@const href = CONNECTION_URLS[c.type]?.(c.name, c.id)}
								<svelte:element
									this={href ? 'a' : 'span'}
									class="conn"
									{href}
									target={href ? '_blank' : undefined}
									rel={href ? 'noopener' : undefined}
								>
									<span class="conn-icon"
										><iconsax-icon name="link" type="bulk" size="24" aria-hidden="true"
										></iconsax-icon></span
									>
									<span class="conn-text">
										<span class="conn-type">{c.type}</span>
										<span class="conn-name">{c.name}</span>
									</span>
									{#if c.verified}
										<span class="conn-check" title="Verified"
											><iconsax-icon
												name="verify"
												type="bulk"
												size="24"
												aria-label="Verified"
												role="img"
											></iconsax-icon></span
										>
									{/if}
								</svelte:element>
							{/each}
						</div>
					{:else}
						<p class="empty">No connected accounts</p>
					{/if}
				</div>
			</section>

			<section class="panel panel-wide">
				<button
					class="panel-toggle"
					type="button"
					aria-expanded={wishlistOpen}
					aria-controls="discord-wishlist"
					onclick={() => (wishlistOpen = !wishlistOpen)}
				>
					<span>Wishlist</span>
					<span class="panel-count">{wishlist.length}</span>
					<iconsax-icon
						name="arrow-right-02"
						type="bulk"
						size="24"
						class="chevron"
						aria-hidden="true"
					></iconsax-icon>
				</button>
				<div id="discord-wishlist" hidden={!wishlistOpen}>
					{#if wishlist.length}
						<div class="wl-grid" class:scroll-area={wishlist.length > 6}>
							{#each wishlist as w (w.sku_id)}
								{@const img = w.static_image_url || w.animated_image_url}
								{@const price = fmtPrice(w.price)}
								<div class="wl-item" class:owned={w.is_owned}>
									{#if img}<img
											src={img}
											alt=""
											loading="lazy"
											referrerpolicy="no-referrer"
											onerror={hideBroken}
										/>{/if}
									<div class="wl-body">
										<p class="wl-name">{w.name || 'Collectible'}</p>
										{#if WISHLIST_TYPE[w.type]}<p class="wl-type">{WISHLIST_TYPE[w.type]}</p>{/if}
									</div>
									{#if price}<span class="wl-price">{price}</span>{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="empty">Nothing on the wishlist</p>
					{/if}
				</div>
			</section>
		</div>
	{/if}
</section>
