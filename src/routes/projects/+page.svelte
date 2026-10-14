<!-- src/routes/projects/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/projects.css';

	type Project = {
		title: string;
		bio: string;
		href?: string;
		img?: string;
		closed?: boolean;
		deprecated?: boolean;
		live?: string;
	};

	type Group = { heading: string; projects: Project[] };

	const IMG_BASE = 'https://m.doughmination.gay/';

	const GROUPS: Group[] = [
		{
			heading: 'Personal Projects',
			projects: [
				{
					title: 'Doughmination Auth',
					bio: 'A public auth server, which is my auth for all my projects',
					href: 'https://github.com/doughmination/auth-server',
					live: 'https://auth.doughmination.gay',
					img: 'favicons/favicon.png'
				},
				{
					title: 'Doughmination API',
					bio: 'My personal API, which I don\'t mind people hooking into',
					href: 'https://github.com/doughmination/api',
					live: 'https://doughmination.uk',
					img: 'favicons/favicon.png'
				},
				{
					title: 'Doughmination Mail',
					bio: 'My personal inbox',
					href: 'https://github.com/doughmination/email',
					img: 'favicons/favicon.png'
				}
			]
		},
		{
			heading: 'WLW Devs',
			projects: [
				{
					title: 'GayBot',
					href: 'https://github.com/WLWDevs/GayBot',
					img: 'img/projects/gaybot.png',
					bio: 'A Discord bot for LGBTQIA+ servers: keyword emoji reactions, identity profiles, lookups and a few fun extras.'
				}
			]
		},
		{
			heading: 'Depreciated Works',
			projects: [
				{
					title: 'Ghostwire',
					img: 'img/projects/ghostwire.png',
					bio: 'The former security bot and brains behind everything major in Girls.',
					closed: true,
					deprecated: true
				},
				{
					title: 'BanSync',
					img: 'img/projects/bansync.png',
					bio: 'Syncs bans from Girls to our partner servers.',
					deprecated: true
				}
			]
		}
	];
</script>

<Meta
	title="Projects"
	description="The projects Clove Twilight builds and contributes to, from personal tools to Discord bots."
/>

<svelte:head>
	<link rel="preconnect" href="https://m.doughmination.gay" crossorigin="" />
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Coding</p>
		<h1>Projects</h1>
		<p class="subtitle">Things I build and help run, click a card to see it's source</p>
	</div>
</section>

<section class="wrap project-groups">
	{#each GROUPS as group (group.heading)}
		<h2 class="project-heading">{group.heading}</h2>
		<ul class="project-grid">
			{#each group.projects as p (p.title)}
				<li class="project-card" class:deprecated={p.deprecated}>
					<svelte:element
						this={p.href ? 'a' : 'div'}
						class="project-main"
						href={p.href}
						target={p.href ? '_blank' : undefined}
						rel={p.href ? 'noopener noreferrer' : undefined}
					>
						<img src={IMG_BASE + p.img} alt="" width="56" height="56" loading="lazy" />
						<div class="project-body">
							<div class="project-head">
								<span class="project-title">{p.title}</span>
								<span class="project-status" class:closed={p.closed}>
									{p.closed ? 'Closed Source' : 'Open Source'}
								</span>
								{#if p.deprecated}
									<span class="project-status deprecated">Deprecated</span>
								{/if}
							</div>
							<p class="project-bio">{p.bio}</p>
						</div>
					</svelte:element>
					{#if p.live}
						<a class="project-live" href={p.live} target="_blank" rel="noopener noreferrer"
							>View live ↗</a
						>
					{/if}
				</li>
			{/each}
		</ul>
	{/each}
</section>
