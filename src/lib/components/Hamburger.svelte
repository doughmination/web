<!-- src/lib/components/Hamburger.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import IcCancel from '~icons/ic/outline-cancel';
	import IcMenu from '~icons/ic/outline-menu';
	import '#lib/styles/hamburger.css';
	import { page } from '$app/state';

	type NavLink = { href: string; label: string };

	// Internal pages only; external links belong in the header and on pages
	let {
		links = [
			{ href: '/', label: 'Home' },
			{ href: '/about', label: 'About Me' },
			{ href: '/languages', label: 'Languages' },
			{ href: '/stack', label: 'Tech Stack' },
			{ href: '/specs', label: 'Specs' },
			{ href: '/projects', label: 'Projects' },
			{ href: '/discord', label: 'Discord' },
			{ href: '/friends', label: 'Friends' },
			{ href: '/88x31', label: '88x31' },
			{ href: '/guestbook', label: 'Guestbook' },
			{ href: '/contact', label: 'Contact' },
			{ href: '/cv', label: 'CV' }
		]
	}: { links?: NavLink[] } = $props();

	let open = $state(false);

	function close() {
		open = false;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}

	// Stop the page scrolling behind the open menu
	$effect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window {onkeydown} />

<button
	class="hamburger"
	type="button"
	aria-label="Open menu"
	aria-expanded={open}
	aria-controls="hamburger-menu"
	onclick={() => (open = true)}
>
	<IcMenu class="nav-icon" />
</button>

<div class="hamburger-backdrop" class:open onclick={close} aria-hidden="true"></div>

<nav id="hamburger-menu" class="hamburger-drawer" class:open aria-label="Pages" inert={!open}>
	<button class="hamburger hamburger-close" type="button" aria-label="Close menu" onclick={close}>
		<IcCancel class="nav-icon" />
	</button>
	<ul>
		{#each links as link (link.href)}
			<li>
				<a
					href={link.href}
					aria-current={page.url.pathname === link.href ? 'page' : undefined}
					onclick={close}
				>
					{link.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
