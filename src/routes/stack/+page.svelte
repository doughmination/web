<!-- src/routes/stack/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/stack.css';
	import { apiBase } from '#lib';
	import SiArchlinux from '~icons/simple-icons/archlinux';
	import SiArduino from '~icons/simple-icons/arduino';
	import SiBootstrap from '~icons/simple-icons/bootstrap';
	import SiBun from '~icons/simple-icons/bun';
	import SiClaude from '~icons/simple-icons/claude';
	import SiCloudflare from '~icons/simple-icons/cloudflare';
	import SiCloudflarepages from '~icons/simple-icons/cloudflarepages';
	import SiCss from '~icons/simple-icons/css';
	import SiDeno from '~icons/simple-icons/deno';
	import SiDocker from '~icons/simple-icons/docker';
	import SiEjs from '~icons/simple-icons/ejs';
	import SiElectron from '~icons/simple-icons/electron';
	import SiEslint from '~icons/simple-icons/eslint';
	import SiExpress from '~icons/simple-icons/express';
	import SiFastapi from '~icons/simple-icons/fastapi';
	import SiFfmpeg from '~icons/simple-icons/ffmpeg';
	import SiGit from '~icons/simple-icons/git';
	import SiGitea from '~icons/simple-icons/gitea';
	import SiGithub from '~icons/simple-icons/github';
	import SiGithubactions from '~icons/simple-icons/githubactions';
	import SiGnubash from '~icons/simple-icons/gnubash';
	import SiGo from '~icons/simple-icons/go';
	import SiGradle from '~icons/simple-icons/gradle';
	import SiHtml5 from '~icons/simple-icons/html5';
	import SiInkscape from '~icons/simple-icons/inkscape';
	import SiInsomnia from '~icons/simple-icons/insomnia';
	import SiJavascript from '~icons/simple-icons/javascript';
	import SiJsonwebtokens from '~icons/simple-icons/jsonwebtokens';
	import SiKotlin from '~icons/simple-icons/kotlin';
	import SiLatex from '~icons/simple-icons/latex';
	import SiLucide from '~icons/simple-icons/lucide';
	import SiMarkdown from '~icons/simple-icons/markdown';
	import SiMysql from '~icons/simple-icons/mysql';
	import SiNextdotjs from '~icons/simple-icons/nextdotjs';
	import SiNginx from '~icons/simple-icons/nginx';
	import SiNodedotjs from '~icons/simple-icons/nodedotjs';
	import SiNodemon from '~icons/simple-icons/nodemon';
	import SiNpm from '~icons/simple-icons/npm';
	import SiOpenai from '~icons/simple-icons/openai';
	import SiPnpm from '~icons/simple-icons/pnpm';
	import SiPostgresql from '~icons/simple-icons/postgresql';
	import SiPrettier from '~icons/simple-icons/prettier';
	import SiPython from '~icons/simple-icons/python';
	import SiRaspberrypi from '~icons/simple-icons/raspberrypi';
	import SiReact from '~icons/simple-icons/react';
	import SiRedis from '~icons/simple-icons/redis';
	import SiSimpleicons from '~icons/simple-icons/simpleicons';
	import SiSqlite from '~icons/simple-icons/sqlite';
	import SiSvelte from '~icons/simple-icons/svelte';
	import SiTailwindcss from '~icons/simple-icons/tailwindcss';
	import SiTypescript from '~icons/simple-icons/typescript';
	import SiVercel from '~icons/simple-icons/vercel';
	import SiVite from '~icons/simple-icons/vite';
	import SiVscodium from '~icons/simple-icons/vscodium';
	import SiVuedotjs from '~icons/simple-icons/vuedotjs';
	import SiWordpress from '~icons/simple-icons/wordpress';
	import SiJavaOracle from '#lib/components/SiJavaOracle.svelte';
	import type { Component } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import {
		fetchContributions,
		level,
		monthOf,
		dayTitle,
		MONTHS,
		type Contributions
	} from '#lib/scripts/heatmap.ts';

	// Any icon from https://simpleicons.org works: import it from
	// '~icons/simple-icons/<slug>' (e.g. 'nodedotjs'), and copy its brand hex from
	// the same page into `color`
	type Tool = { name: string; icon: Component<SVGAttributes<SVGSVGElement>>; color: string };
	type Group = { name: string; tools: Tool[] };

	// What this website itself is built with, shown above everything else
	const site: Group = {
		name: 'This Site',
		tools: [
			{ name: 'Svelte', icon: SiSvelte, color: '#FF3E00' },
			{ name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
			{ name: 'Vite', icon: SiVite, color: '#9135FF' },
			{ name: 'Deno', icon: SiDeno, color: '#ffffff' },
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
			name: 'Aritificial Intelligence',
			tools: [
				{ name: 'Claude', icon: SiClaude, color: '#D97757' },
				{ name: 'ChatGPT', icon: SiOpenai, color: '#ffffff' }
			]
		},
		{
			name: 'Backend & Data',
			tools: [
				{ name: 'Node.js', icon: SiNodedotjs, color: '#5FA04E' },
				{ name: 'Bun', icon: SiBun, color: '#FBF0DF' },
				{ name: 'Deno', icon: SiDeno, color: '#ffffff' },
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
	<link rel="preconnect" href={apiBase} crossorigin="" />
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
				<tool.icon class="stack-icon" aria-hidden="true" />
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
