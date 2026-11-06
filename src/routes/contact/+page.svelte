<!-- src/routes/contact/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import IcCall from '~icons/ic/outline-call';
	import IcEmail from '~icons/ic/outline-email';
	import IcWork from '~icons/ic/outline-work';
	import Meta from '#lib/components/Meta.svelte';
	import SiX from '~icons/simple-icons/x';
	import SiDiscord from '~icons/simple-icons/discord';
	import SiTwitch from '~icons/simple-icons/twitch';
	import SiTiktok from '~icons/simple-icons/tiktok';
	import SiYoutube from '~icons/simple-icons/youtube';
	import SiBluesky from '~icons/simple-icons/bluesky';
	import SiInstagram from '~icons/simple-icons/instagram';
	import SiReddit from '~icons/simple-icons/reddit';
	import SiTumblr from '~icons/simple-icons/tumblr';
	import '#lib/styles/contact.css';
	import {
		discordId,
		contactEmail,
		twitterUrl,
		blueskyUrl,
		linkedinUrl,
		twitchUrl,
		youtubeUrl
	} from '#lib';

	const contacts = [
		{
			name: 'Discord',
			value: 'doughmination',
			href: `https://discord.com/users/${discordId}`,
			icon: SiDiscord
		},
		{
			name: 'Email',
			value: contactEmail,
			href: `mailto:${contactEmail}`,
			icon: IcEmail
		},
		{
			name: 'Phone',
			value: '+44 7562 523118',
			href: 'tel:+447562523118',
			icon: IcCall
		},
		{
			name: 'Twitter',
			value: '@DoughminCEO',
			href: twitterUrl,
			icon: SiX
		},
		{
			name: 'LinkedIn',
			value: 'estrogenhrt',
			href: linkedinUrl,
			icon: IcWork
		},
		{
			name: 'Twitch',
			value: 'doughminationgaming',
			href: twitchUrl,
			icon: SiTwitch
		},
		{
			name: 'Bluesky',
			value: '@doughmination.gay',
			href: blueskyUrl,
			icon: SiBluesky
		},
		{
			name: 'Reddit',
			value: 'u/XerinDotZero',
			href: 'https://www.reddit.com/user/XerinDotZero/',
			icon: SiReddit
		},
		{
			name: 'Tumblr',
			value: '@twilightphotography',
			href: 'https://www.tumblr.com/twilightphotography',
			icon: SiTumblr
		},
		{
			name: 'YouTube',
			value: '@CloveTwiGaming',
			href: youtubeUrl,
			icon: SiYoutube
		},
		{
			name: 'TikTok',
			value: '@doughmination.system',
			href: 'https://www.tiktok.com/@doughmination.system',
			icon: SiTiktok
		},
		{
			name: 'Instagram',
			value: '@doughmination.system',
			href: 'https://www.instagram.com/doughmination.system/',
			icon: SiInstagram
		}
	];
	const [discord, ...others] = contacts;
</script>

<Meta
	title="Contact Me"
	description="All the ways to reach Clove Twilight, from Discord and email to socials."
/>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Clove Twilight</p>
		<h1>Contact Me</h1>
		<p class="subtitle">I’m usually on Discord, but here are all the ways you can reach me.</p>
	</div>
</section>

<section class="socials wrap">
	<div class="contact-featured">
		<span class="contact-icon"><discord.icon /></span>
		<div class="contact-text">
			<p class="contact-name">Best way to reach me</p>
			<p class="contact-value">{discord.name} · {discord.value}</p>
		</div>
		<a class="contact-button" href={discord.href}>Message me</a>
	</div>
	<div class="contact-grid">
		{#each others as c (c.name)}
			<a class="contact-tile" href={c.href}>
				<span class="contact-icon"><c.icon /></span>
				<p class="contact-name">{c.name}</p>
				<p class="contact-value">{c.value}</p>
			</a>
		{/each}
	</div>
</section>
