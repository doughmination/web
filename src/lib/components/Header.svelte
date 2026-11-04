<!-- src/lib/components/Header.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import IcArticle from '~icons/ic/outline-article';
	import IcCall from '~icons/ic/outline-call';
	import IcKey from '~icons/ic/outline-key';
	import Hamburger from '#lib/components/Hamburger.svelte';
	import { SiGithub, SiDiscord } from 'simple-icons';
	import '#lib/styles/header.css';
	import { authUrl, githubUrl, websiteDomain } from '#lib';
</script>

<!-- Fixed-height page backdrop, so every page gets the same amount of background -->
<div class="backdrop" aria-hidden="true"></div>

<header>
	<a class="brand" href="/">
		<img src="/favicon.svg" alt="Site Favicon" width="32" height="32" />
		<span>{websiteDomain}</span>
	</a>
	<nav>
		<a href={authUrl} target="_blank"><IcKey class="nav-icon" />Apps</a>
		<a href={githubUrl} target="_blank"><SiGithub class="nav-icon" />GitHub</a>
		<a href="/contact"><IcCall class="nav-icon" />Contact</a>
		<a href="/invite"> <SiDiscord class="nav-icon" />Discord Server</a>
		<a href="/blog"><IcArticle class="nav-icon" />Blog</a>
		<Hamburger />
	</nav>
</header>
