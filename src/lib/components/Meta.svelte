<!-- src/lib/components/Meta.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import { page } from '$app/state';

	import { websiteDomain, websiteUrl } from '#lib';

	// Matches --accent in theme.css
	const accentColour = 0xeb459e;

	let {
		title,
		description
	}: {
		title: string;
		description: string;
	} = $props();

	const pageUrl = $derived(websiteUrl + page.url.pathname);
	const isHome = $derived(page.url.pathname === '/');

	// Link buttons: this page, plus Home when we're not already on it
	const buttons = $derived([
		{
			type: 2,
			style: 5,
			label: 'Open page',
			url: pageUrl
		},
		...(isHome
			? []
			: [
					{
						type: 2,
						style: 5,
						label: 'Home',
						url: websiteUrl + '/'
					}
				])
	]);

	// Discord component embed: one Container, max 3,000 bytes, Open Graph tags are the fallback
	const componentEmbed = $derived({
		component: {
			type: 17,
			accent_color: accentColour,
			components: [
				{
					type: 9,
					components: [
						{ type: 10, content: `## ${title}` },
						{ type: 10, content: description }
					],
					accessory: {
						type: 11,
						media: { url: websiteUrl + '/favicon.png' }
					}
				},
				{ type: 14 },
				{
					type: 1,
					components: buttons
				},
				{ type: 10, content: `-# ${websiteDomain}` }
			]
		}
	});

	// Escape "<" so the JSON can't close the script tag early
	const embedJson = $derived(JSON.stringify(componentEmbed).replace(/</g, '\\u003c'));

	// Split closing tag so it doesn't end this script block
	const closingTag = '</' + 'script>';
	const embedTag = $derived(
		`<script id="discord:component-embed" type="application/json">${embedJson}${closingTag}`
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={pageUrl} />

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={pageUrl} />

	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- built from page props, "<" escaped -->
	{@html embedTag}
</svelte:head>
