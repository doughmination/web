<!-- src/routes/88x31/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/buttons.css';

	type Button = {
		img: string;
		alt: string;
		href?: string;
		internal?: boolean;
		eager?: boolean;
	};

	const BUTTON_BASE = 'https://m.doughmination.gay/img/88x31/';

	const BUTTONS: Button[] = [
		{ href: 'https://www.monsterenergy.com/', img: 'monster.png', alt: 'MONSTER' },
		{
			href: 'https://doughmination.uk',
			img: 'doughmination.png',
			alt: 'Doughmination',
			eager: true
		},
		{ href: 'https://claude.ai', img: 'claude.png', alt: 'Claude' },
		{
			href: 'https://code.visualstudio.com',
			img: 'vscbutton.png',
			alt: 'Made with Visual Studio Code'
		},
		{ img: 'htmldream.png', alt: 'I dream in HTML' },
		{ href: 'https://validator.w3.org/', img: 'valid-html5.png', alt: 'Valid HTML5' },
		{ href: 'https://jigsaw.w3.org/css-validator/', img: 'valid-css.png', alt: 'Valid CSS' },
		{ href: 'https://yesterweb.org/no-to-web3/', img: 'noweb32.png', alt: 'Keep the web free' },
		{ img: 'nft.png', alt: 'No NFTs, no thanks' },
		{ img: 'nowebp.png', alt: 'No WEBp' },
		{ href: 'https://www.linux.org/', img: 'linux.png', alt: 'Made on GNU/Linux' },
		{ href: 'https://archlinux.org/', img: 'arch.png', alt: 'Arch Linux' },
		{ href: 'https://kde.org/plasma-desktop/', img: 'kde.png', alt: 'KDE Plasma' },
		{ href: 'https://www.mozilla.org/firefox/', img: 'firefox.png', alt: 'Firefox' },
		{ img: 'no-chrome.png', alt: 'Anything but Chrome' },
		{ href: 'https://support.apple.com/en-gb/121552', img: 'macbutton.png', alt: 'Made on a Mac' },
		{ href: 'https://www.win-rar.com/', img: 'winrar4.png', alt: 'WinRAR' },
		{ href: 'https://microslop.com/', img: 'microslop.png', alt: 'Stop Microsoft' },
		{ img: 'linuxisbetterthanwindows.png', alt: 'Linux is better than Windows' },
		{ img: 'dark-mode.png', alt: 'Made for dark mode' },
		{ href: 'https://valerie.vg/', img: 'estrogen.png', alt: 'Powered by estrogen' },
		{ img: 'trans.png', alt: 'Transgender' },
		{ img: 'fae-faer.png', alt: 'Fae/Faer Pronouns' },
		{ img: 'transnow.png', alt: 'Trans rights now' },
		{ img: 'queerpride.png', alt: 'Queer pride' },
		{ img: 'girlsnow.png', alt: 'Girls Now' },
		{ img: 'skirt.png', alt: 'Let boys wear skirts' },
		{ img: 'cutesocks.png', alt: 'I wear cute socks!' },
		{
			href: 'https://archive.org/details/zines-anti-fascism',
			img: 'antifa.png',
			alt: 'No fascism, no bigotry'
		},
		{ href: 'https://www.youtube.com/watch?v=7AQbhes-Ntw', img: 'meltice.png', alt: 'Melt ICE' },
		{ href: 'https://www.map.org.uk/', img: 'palestine.png', alt: 'Free Palestine' },
		{ href: 'https://u24.gov.ua/', img: 'ukraine.png', alt: 'Slava Ukraini' },
		{ href: '/discord', img: 'discord.png', alt: 'Discord', internal: true },
		{ img: 'bestvieweddesktop.png', alt: 'Best viewed on desktop' },
		{ img: 'killmenow.png', alt: 'Kill me now' },
		{
			href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			img: 'no.png',
			alt: 'Don't click here, no!'
		},
		{ href: 'https://www.minecraft.net', img: 'minecraft.png', alt: 'Minecraft' },
		{ img: 'pokemon.png', alt: 'Pokémon' },
		{
			href: 'https://www.youtube.com/watch?v=VEj0cuqVJ-I',
			img: 'caramelldansen.png',
			alt: 'Caramelldansen'
		},
		{ img: 'femboy.png', alt: 'Femboy' },
		{ img: 'blink.png', alt: 'Anime blink' },
		{
			href: 'https://www.youtube.com/watch?v=_-2dIuV34cs',
			img: 'miku.png',
			alt: 'This site is Miku approved'
		},
		{ img: 'tummy.png', alt: 'Anime tummy supporter' },
		{ href: 'https://www.youtube.com/watch?v=9lNZ_Rnr7Jc', img: 'badapple.png', alt: 'Bad Apple!!' }
	];
</script>

<Meta
	title="88x31"
	description="Clove&apos;s silly little buttons: every 88x31 badge from around the site, all in one spot."
/>

<svelte:head>
	<link rel="preconnect" href="https://m.doughmination.gay" crossorigin="" />
</svelte:head>

<section class="hero">
	<div class="wrap">
		<h1>88x31</h1>
		<p class="subtitle">All my 88x31s I use</p>
	</div>
</section>

{#snippet buttonImg(b: Button)}
	<img
		src={BUTTON_BASE + b.img}
		alt={b.alt}
		width="88"
		height="31"
		loading={b.eager ? 'eager' : 'lazy'}
	/>
{/snippet}

<section class="wrap">
	<ul class="button-wall" aria-label="88x31 buttons">
		{#each BUTTONS as b (b.img)}
			<li>
				{#if b.href}
					<a
						href={b.href}
						title={b.alt}
						target={b.internal ? undefined : '_blank'}
						rel={b.internal ? undefined : 'noopener noreferrer'}>{@render buttonImg(b)}</a
					>
				{:else}
					{@render buttonImg(b)}
				{/if}
			</li>
		{/each}
	</ul>
</section>
