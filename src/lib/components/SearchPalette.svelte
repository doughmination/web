<!-- src/lib/components/SearchPalette.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import IcSearch from '~icons/ic/outline-search';
	import '#lib/styles/search.css';
	import { KIND_LABEL, loadIndex, search, type SearchItem } from '#lib/scripts/search.ts';

	let dialog: HTMLDialogElement | undefined = $state();
	let input: HTMLInputElement | undefined = $state();
	let list: HTMLUListElement | undefined = $state();

	let items = $state<SearchItem[]>([]);
	let query = $state('');
	let activeIndex = $state(0);
	let loadError = $state('');
	let loading = $state(false);

	const results = $derived(search(items, query));
	const activeId = $derived(results.length ? `search-result-${activeIndex}` : undefined);

	// Mac shows ⌘K, everything else Ctrl K
	let shortcut = $state('Ctrl K');

	$effect(() => {
		if (/Mac|iPhone|iPad/.test(navigator.platform)) shortcut = '⌘K';
	});

	// A new query starts back at the top result
	$effect(() => {
		void query;
		activeIndex = 0;
	});

	async function open() {
		if (!dialog || dialog.open) return;

		query = '';
		dialog.showModal();
		input?.focus();

		if (items.length) return;

		loading = true;
		loadError = '';

		try {
			items = await loadIndex();
		} catch {
			loadError = 'Search is unavailable right now, try again in a moment.';
		} finally {
			loading = false;
		}
	}

	function close() {
		dialog?.close();
	}

	function isExternal(url: string): boolean {
		return /^(https?:|mailto:)/.test(url);
	}

	function moveTo(index: number) {
		if (!results.length) return;

		activeIndex = (index + results.length) % results.length;

		list?.querySelector(`#search-result-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
	}

	// Ctrl+K / ⌘K anywhere on the site toggles the palette
	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key.toLowerCase() !== 'k' || !(event.ctrlKey || event.metaKey)) return;

		event.preventDefault();

		if (dialog?.open) close();
		else open();
	}

	function onInputKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveTo(activeIndex + 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveTo(activeIndex - 1);
		} else if (event.key === 'Enter' && results.length) {
			event.preventDefault();

			// Results are real links, so clicking one lets SvelteKit (or the browser) navigate
			list?.querySelector<HTMLAnchorElement>(`#search-result-${activeIndex}`)?.click();
		}
	}

	// A click on the dimmed area outside the box lands on the dialog itself
	function onDialogClick(event: MouseEvent) {
		if (event.target === dialog) close();
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<button class="search-trigger" type="button" aria-label="Search the site" onclick={open}>
	<IcSearch class="nav-icon" />
	<kbd class="search-shortcut" aria-hidden="true">{shortcut}</kbd>
</button>

<dialog class="search-dialog" bind:this={dialog} onclick={onDialogClick} aria-label="Search">
	<div class="search-box">
		<div class="search-field">
			<IcSearch class="search-field-icon" aria-hidden="true" />
			<input
				bind:this={input}
				bind:value={query}
				onkeydown={onInputKeydown}
				type="search"
				placeholder="Search pages, posts, projects…"
				autocomplete="off"
				spellcheck="false"
				role="combobox"
				aria-expanded={results.length > 0}
				aria-controls="search-results"
				aria-activedescendant={activeId}
				aria-autocomplete="list"
			/>
			<kbd class="search-esc" aria-hidden="true">Esc</kbd>
		</div>

		{#if loading}
			<p class="search-note">Loading…</p>
		{:else if loadError}
			<p class="search-note">{loadError}</p>
		{:else if !results.length}
			<p class="search-note">Nothing matches “{query}”.</p>
		{/if}

		<ul class="search-results" id="search-results" role="listbox" bind:this={list}>
			{#each results as item, i (item.kind + item.url)}
				<li role="presentation">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- urls come from the build-time index -->
					<a
						id="search-result-{i}"
						class="search-result"
						class:active={i === activeIndex}
						href={item.url}
						role="option"
						aria-selected={i === activeIndex}
						target={isExternal(item.url) && !item.url.startsWith('mailto:') ? '_blank' : undefined}
						rel={isExternal(item.url) ? 'noopener noreferrer' : undefined}
						tabindex="-1"
						onclick={close}
						onpointermove={() => (activeIndex = i)}
					>
						<span class="search-kind" data-kind={item.kind}>{KIND_LABEL[item.kind]}</span>
						<span class="search-text">
							<span class="search-title">{item.title}</span>
							{#if item.parent}
								<span class="search-sub">in {item.parent}</span>
							{:else if item.description}
								<span class="search-sub">{item.description}</span>
							{/if}
						</span>
						{#if isExternal(item.url)}
							<span class="search-external" aria-hidden="true">↗</span>
						{/if}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</li>
			{/each}
		</ul>

		<p class="search-help" aria-hidden="true">
			<span><kbd>↑</kbd><kbd>↓</kbd> move</span>
			<span><kbd>Enter</kbd> open</span>
			<span><kbd>Esc</kbd> close</span>
		</p>
	</div>
</dialog>
