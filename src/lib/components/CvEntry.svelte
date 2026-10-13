<script>
	let open = $state(false);

	let { title, cv_sub, year, content } = $props();
</script>

<section class="cv-entry">
	<button class="cv-entry-header" onclick={() => (open = !open)}>
		<h2>
			<span class="cv-arrow">{open ? '▲' : '▼'}</span>
			<span class="cv-title">{title}</span>
		</h2>
	</button>

	<div class:closed={!open} class="cv-entry-content">
		<p class="cv-sub">{cv_sub}</p>
		<p class="year">{year}</p>
		{@render content?.()}
	</div>
</section>
