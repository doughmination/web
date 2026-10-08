<!-- src/routes/contact/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import {
		SiX,
		SiDiscord,
		SiTwitch,
		SiTiktok,
		SiYoutube,
		SiBluesky,
		SiInstagram,
		SiReddit,
		SiTumblr
	} from 'simple-icons';
	import '#lib/styles/contact.css';
	import { discordId, websiteDomain } from '#lib';

	const contacts = [
		{
			name: 'Discord',
			value: 'doughmination',
			href: `https://discord.com/users/${discordId}`,
			icon: SiDiscord
		},
		{
			name: 'Email',
			value: `clove@${websiteDomain}`,
			href: `mailto:clove@${websiteDomain}`,
			iconsax: 'sms'
		},
		{
			name: 'Phone',
			value: '+44 7562 523118',
			href: 'tel:+447562523118',
			iconsax: 'call'
		},
		{
			name: 'Twitter',
			value: '@DoughminCEO',
			href: 'https://x.com/DoughminCEO',
			icon: SiX
		},
		{
			name: 'LinkedIn',
			value: 'estrogenhrt',
			href: 'https://uk.linkedin.com/in/estrogen',
			iconsax: 'briefcase'
		},
		{
			name: 'Twitch',
			value: 'doughminationgaming',
			href: 'https://www.twitch.tv/doughminationgaming',
			icon: SiTwitch
		},
		{
			name: 'Bluesky',
			value: '@doughmination.gay',
			href: 'https://bsky.app/profile/doughmination.gay',
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
			href: 'https://www.youtube.com/@CloveTwiGaming',
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
				<span class="contact-icon"
					>{#if c.iconsax}<iconsax-icon name={c.iconsax} type="bulk" size="24"
						></iconsax-icon>{:else if c.icon}<c.icon />{/if}</span
				>
				<p class="contact-name">{c.name}</p>
				<p class="contact-value">{c.value}</p>
			</a>
		{/each}
	</div>
</section>
