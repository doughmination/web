<!-- src/routes/+error.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import { page } from '$app/state';
	import '#lib/styles/index.css';

	const notFound = $derived(page.status === 404);
	const serverError = $derived(page.status == 500);
</script>

<svelte:head>
	<title>{notFound ? 'Page Not Found' : 'Error'}</title>
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Error {page.status}</p>
		<h1>{notFound ? 'Page not found' : 'Something went wrong'}</h1>
		<div class="intro">
			<p class="lede">
				{#if notFound}
					The page you&apos;re looking for doesn&apos;t exist or has been moved.
				{:else if serverError}
					There was an internal server issue. Please restart or redeploy making fixes.
				{:else}
					{page.error?.message}
				{/if}
				<br />
				<a href="/">Go back home</a>
			</p>
		</div>
	</div>
</section>
