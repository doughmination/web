<!-- src/routes/stack/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/stack.css';
	import {
		SiArchlinux,
		SiArduino,
		SiBootstrap,
		SiBun,
		SiCloudflare,
		SiCloudflarepages,
		SiCss,
		SiDocker,
		SiEjs,
		SiElectron,
		SiEslint,
		SiExpress,
		SiFastapi,
		SiFfmpeg,
		SiGit,
		SiGitea,
		SiGithub,
		SiGithubactions,
		SiGnubash,
		SiGo,
		SiGradle,
		SiHtml5,
		SiInkscape,
		SiInsomnia,
		SiJavascript,
		SiJsonwebtokens,
		SiKotlin,
		SiLatex,
		SiLucide,
		SiMarkdown,
		SiMysql,
		SiNextdotjs,
		SiNginx,
		SiNodedotjs,
		SiNodemon,
		SiNpm,
		SiPnpm,
		SiPostgresql,
		SiPrettier,
		SiPython,
		SiRaspberrypi,
		SiReact,
		SiRedis,
		SiSimpleicons,
		SiSqlite,
		SiSvelte,
		SiTailwindcss,
		SiTypescript,
		SiVercel,
		SiVite,
		SiVscodium,
		SiVuedotjs,
		SiWordpress
	} from 'simple-icons';
	import SiJavaOracle from '#lib/components/SiJavaOracle.svelte';
	import {
		fetchContributions,
		level,
		monthOf,
		dayTitle,
		MONTHS,
		type Contributions
	} from '#lib/scripts/heatmap.ts';

	// Any icon from https://simpleicons.org works: import it as Si + the slug in
	// PascalCase (e.g. "nodedotjs" -> SiNodedotjs), and copy its brand hex from
	// the same page into `color`
	type Tool = { name: string; icon: typeof SiGit; color: string };
	type Group = { name: string; tools: Tool[] };

	// What this website itself is built with, shown above everything else
	const site: Group = {
		name: 'This Site',
		tools: [
			{ name: 'Svelte', icon: SiSvelte, color: '#FF3E00' },
			{ name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
			{ name: 'Vite', icon: SiVite, color: '#9135FF' },
			{ name: 'Bun', icon: SiBun, color: '#FBF0DF' },
			{ name: 'Lucide', icon: SiLucide, color: '#F56565' },
			{ name: 'Simple Icons', icon: SiSimpleicons, color: '#EEEEEE' },
			{ name: 'Cloudflare Pages', icon: SiCloudflarepages, color: '#F38020' },
			{ name: 'Prettier', icon: SiPrettier, color: '#F7B93E' },
			{ name: 'ESLint', icon: SiEslint, color: '#4B32C3' }
		]
	};

	const groups: Group[] = [
		{
			name: 'Languages',
			tools: [
				{ name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
				{ name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
				{ name: 'Python', icon: SiPython, color: '#3776AB' },
				{ name: 'Java', icon: SiJavaOracle, color: '#ED8B00' },
				{ name: 'Kotlin', icon: SiKotlin, color: '#7F52FF' },
				{ name: 'Go', icon: SiGo, color: '#00ADD8' },
				{ name: 'Bash', icon: SiGnubash, color: '#4EAA25' },
				{ name: 'HTML5', icon: SiHtml5, color: '#E34F26' },
				{ name: 'CSS', icon: SiCss, color: '#663399' },
				{ name: 'Markdown', icon: SiMarkdown, color: '#ffffff' },
				{ name: 'LaTeX', icon: SiLatex, color: '#008080' }
			]
		},
		{
			name: 'Frameworks',
			tools: [
				{ name: 'Svelte', icon: SiSvelte, color: '#FF3E00' },
				{ name: 'React', icon: SiReact, color: '#61DAFB' },
				{ name: 'Vue.js', icon: SiVuedotjs, color: '#4FC08D' },
				{ name: 'Next.js', icon: SiNextdotjs, color: '#ffffff' },
				{ name: 'Electron', icon: SiElectron, color: '#47848F' },
				{ name: 'EJS', icon: SiEjs, color: '#B4CA65' },
				{ name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#7952B3' }
			]
		},
		{
			name: 'Backend & Data',
			tools: [
				{ name: 'Node.js', icon: SiNodedotjs, color: '#5FA04E' },
				{ name: 'Bun', icon: SiBun, color: '#FBF0DF' },
				{ name: 'Express', icon: SiExpress, color: '#ffffff' },
				{ name: 'FastAPI', icon: SiFastapi, color: '#009688' },
				{ name: 'JWT', icon: SiJsonwebtokens, color: '#ffffff' },
				{ name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
				{ name: 'MySQL', icon: SiMysql, color: '#4479A1' },
				{ name: 'SQLite', icon: SiSqlite, color: '#003B57' },
				{ name: 'Redis', icon: SiRedis, color: '#FF4438' },
				{ name: 'WordPress', icon: SiWordpress, color: '#21759B' }
			]
		},
		{
			name: 'Tooling',
			tools: [
				{ name: 'Git', icon: SiGit, color: '#F05032' },
				{ name: 'GitHub', icon: SiGithub, color: '#E7E8E8' },
				{ name: 'GitHub Actions', icon: SiGithubactions, color: '#2088FF' },
				{ name: 'Gitea', icon: SiGitea, color: '#609926' },
				{ name: 'Vite', icon: SiVite, color: '#9135FF' },
				{ name: 'ESLint', icon: SiEslint, color: '#4B32C3' },
				{ name: 'npm', icon: SiNpm, color: '#CB3837' },
				{ name: 'pnpm', icon: SiPnpm, color: '#F69220' },
				{ name: 'Nodemon', icon: SiNodemon, color: '#76D04B' },
				{ name: 'Gradle', icon: SiGradle, color: '#FDCFC5' }
			]
		},
		{
			name: 'Hosting',
			tools: [
				{ name: 'Arch Linux', icon: SiArchlinux, color: '#1793D1' },
				{ name: 'Docker', icon: SiDocker, color: '#2496ED' },
				{ name: 'Nginx', icon: SiNginx, color: '#009639' },
				{ name: 'Cloudflare', icon: SiCloudflare, color: '#F38020' },
				{ name: 'Vercel', icon: SiVercel, color: '#ffffff' }
			]
		},
		{
			name: 'Apps & Hardware',
			tools: [
				{ name: 'VSCodium', icon: SiVscodium, color: '#2F80ED' },
				{ name: 'Insomnia', icon: SiInsomnia, color: '#4000BF' },
				{ name: 'FFmpeg', icon: SiFfmpeg, color: '#007808' },
				{ name: 'Inkscape', icon: SiInkscape, color: '#ffffff' },
				{ name: 'Arduino', icon: SiArduino, color: '#00878F' },
				{ name: 'Raspberry Pi', icon: SiRaspberrypi, color: '#A22846' }
			]
		}
	];

	const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

	let contributions = $state<Contributions | null>(null);
	let error = $state(false);

	$effect(() => {
		fetchContributions()
			.then((c) => (contributions = c))
			.catch(() => (error = true));
	});

	// Label a week when its month starts, skipping a first week that's about to
	// change month so two labels don't overlap
	function monthLabel(weeks: Contributions['weeks'], w: number): string {
		const month = monthOf(weeks[w]);
		if (w > 0 && month === monthOf(weeks[w - 1])) return '';
		if (w === 0 && weeks[1] && monthOf(weeks[1]) !== month) return '';
		return MONTHS[month];
	}
</script>

<Meta
	title="Tech Stack"
	description="The languages, frameworks and tools Clove builds with, plus a live contribution heatmap."
/>

<svelte:head>
	<link rel="preconnect" href="https://doughmination.uk" crossorigin="" />
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Coding</p>
		<h1>Tech Stack</h1>
		<p class="subtitle">What I build with, and how much I&apos;ve been building lately</p>
	</div>
</section>

{#snippet toolGroup(group: Group)}
	<h2 class="stack-heading">{group.name}</h2>
	<ul class="stack-grid">
		{#each group.tools as tool (tool.name)}
			<li class="stack-tool" style:--brand={tool.color}>
				<tool.icon class="stack-icon" title={tool.name} aria-hidden="true" />
				<span>{tool.name}</span>
			</li>
		{/each}
	</ul>
{/snippet}

<section class="stack wrap">
	{@render toolGroup(site)}

	<h2 class="stack-heading">Contributions</h2>
	<div class="heatmap">
		<p class="hm-count">
			{#if contributions}
				{contributions.total.toLocaleString('en-GB')} contributions since {contributions.since}
			{:else if error}
				Couldn&apos;t load contributions
			{:else}
				Loading…
			{/if}
		</p>
		{#if contributions}
			{@const weeks = contributions.weeks}
			<div
				class="hm-scroll"
				role="img"
				aria-label="Contribution heatmap: {contributions.total} contributions since {contributions.since}"
			>
				<div class="hm-months" aria-hidden="true">
					{#each weeks as week, w (week[0].date)}
						<span>{monthLabel(weeks, w)}</span>
					{/each}
				</div>
				<div class="hm-body">
					<div class="hm-weekdays" aria-hidden="true">
						{#each WEEKDAYS as label, i (i)}
							<span>{label}</span>
						{/each}
					</div>
					<div class="hm-grid">
						{#each weeks as week, w (week[0].date)}
							{#each week as day (day.date)}
								<div
									class="hm-day"
									data-level={level(day.contributions)}
									title={dayTitle(day)}
									style:animation-delay="{w * 8}ms"
								></div>
							{/each}
						{/each}
					</div>
				</div>
			</div>
			<div class="hm-legend" aria-hidden="true">
				<span>Less</span>
				{#each [0, 1, 2, 3, 4] as l (l)}
					<span class="hm-day" data-level={l}></span>
				{/each}
				<span>More</span>
			</div>
		{/if}
	</div>

	{#each groups as group (group.name)}
		{@render toolGroup(group)}
	{/each}
</section>
