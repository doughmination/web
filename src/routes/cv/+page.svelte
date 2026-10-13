<!-- src/routes/cv/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import '#lib/styles/cv.css';
	import CvEntry from '#lib/components/CvEntry.svelte';
</script>

<section class="hero">
	<div class="wrap">
		<h1>CV</h1>
		<p class="subtitle">All my education and previous jobs are here</p>
	</div>
</section>

<section class="cv">
	<h1>Education</h1>
	<CvEntry
	title="Solent University"
	cv_sub="BSci Computer Science"
	year="September 2025 - June 2026"
>
	{#snippet content()}
		<p>Studying Computer Science...</p>
	{/snippet}
</CvEntry>
</section>
