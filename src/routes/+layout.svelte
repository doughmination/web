<!-- src/routes/+layout.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import '#lib/styles/global.css';
	import '#lib/styles/fonts.css';
	import '#lib/styles/theme.css';
	let { children } = $props();
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import BetaWarning from '#lib/components/BetaWarning.svelte';
	import { websiteUrl } from '#lib';
	import background from '#lib/assets/background.avif';
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="32x32" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/favicon.png" />
	<link rel="preload" as="image" href={background} type="image/avif" fetchpriority="high" />

	<meta property="og:site_name" content="Clove Twilight" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_GB" />
	<meta property="og:image" content="{websiteUrl}/favicon.png" />
	<meta property="og:image:width" content="512" />
	<meta property="og:image:height" content="512" />
	<meta property="og:image:alt" content="Clove Twilight's site icon" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@DoughminCEO" />
</svelte:head>

<BetaWarning />
<Header />
<main>
	{@render children()}
</main>
<Footer />
