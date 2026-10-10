<!-- src/lib/components/BetaWarning.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	let open = $state(true);

	function close() {
		open = false;
	}
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && close()} />

{#if open}
	<div class="overlay" role="presentation" onclick={(e) => e.target === e.currentTarget && close()}>
		<div
			class="card"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="beta-title"
			aria-describedby="beta-body"
		>
			<div class="banner" aria-hidden="true"></div>
			<p class="eyebrow">
				<iconsax-icon name="warning-2" type="bulk" size="24" class="icon"></iconsax-icon>Beta
			</p>
			<h2 id="beta-title">This is a beta website</h2>
			<p id="beta-body">
				It's unfinished, so some pages may be missing, look wrong, or break entirely.
			</p>
			<!-- svelte-ignore a11y_autofocus -->
			<button type="button" onclick={close} autofocus>I understand</button>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgb(0 0 0 / 70%);
		backdrop-filter: blur(4px);
	}

	.card {
		width: 100%;
		max-width: 28rem;
		padding: 1.75rem;
		border: 1px solid var(--line);
		border-radius: 0.75rem;
		background: var(--bg);
		box-shadow: 0 1rem 3rem rgb(0 0 0 / 50%);
		overflow: hidden;
	}

	/* Same image and fade as the header backdrop */
	.banner {
		height: 7rem;
		margin: -1.75rem -1.75rem 1.25rem;
		background:
			linear-gradient(rgb(11 10 13 / 30%), var(--bg)),
			radial-gradient(70% 60% at 20% 30%, rgb(235 69 158 / 12%), transparent 70%),
			url('../assets/background.avif') center / cover no-repeat;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin: 0;
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
		background: var(--accent-dim);
		color: var(--accent);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.eyebrow :global(.icon svg) {
		width: 1em;
		height: 1em;
	}

	h2 {
		margin: 0.9rem 0 0.4rem;
		line-height: 1.25;
	}

	p:not(.eyebrow) {
		margin: 0 0 1.5rem;
		color: var(--muted);
	}

	button {
		width: 100%;
		padding: 0.7rem 1rem;
		border: 0;
		border-radius: 0.5rem;
		background: var(--accent);
		color: #fff;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	button:hover {
		filter: brightness(1.1);
	}

	button:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}
</style>
