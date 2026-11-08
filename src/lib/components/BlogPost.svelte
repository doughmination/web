<!-- src/lib/components/BlogPost.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Meta from '#lib/components/Meta.svelte';
	import Giscus from '#lib/components/Giscus.svelte';
	import IcArrowBack from '~icons/ic/outline-arrow-back';
	import IcWarningAmber from '~icons/ic/outline-warning-amber';
	import IcInfo from '~icons/ic/outline-info';
	import { fmtPostDate, type PostMeta } from '#lib/scripts/blog.ts';
	import { headingAnchors } from '#lib/scripts/headingAnchors.ts';
	import '#lib/styles/blog.css';

	let { meta, children }: { meta: PostMeta; children: Snippet } = $props();

	// Posts with a content warning stay hidden until the reader chooses to continue
	let revealed = $state(false);
	const showPost = $derived(!meta.warning || revealed);
</script>

<Meta title={meta.title} description={meta.excerpt} />

<section class="hero">
	<div class="wrap post-wrap">
		<a class="post-back" href="/blog"><IcArrowBack aria-hidden="true" />All posts</a>
		<h1>{meta.title}</h1>
		<p class="subtitle">{meta.excerpt}</p>
		<p class="post-meta">
			<time datetime={meta.date}>{fmtPostDate(meta.date)}</time>
			<span aria-hidden="true">·</span>
			<span>{meta.user}</span>
			{#if meta.updated}
				<span aria-hidden="true">·</span>
				<span>
					Last updated
					<time datetime={meta.updated}>{fmtPostDate(meta.updated)}</time>
				</span>
			{/if}
		</p>
		{#if meta.tags.length}
			<ul class="post-tags">
				{#each meta.tags as tag (tag)}
					<li class="chip">{tag}</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<section class="wrap post-wrap">
	{#if meta.warning}
		<div class="post-notice post-warning" role="note">
			<IcWarningAmber aria-hidden="true" />
			<div>
				<p><b>Warning:</b> {meta.warning}</p>
				{#if !revealed}
					<button class="post-reveal" type="button" onclick={() => (revealed = true)}>
						Continue to post
					</button>
				{/if}
			</div>
		</div>
	{/if}

	{#if showPost}
		{#if meta.disclaimer}
			<div class="post-notice" role="note">
				<IcInfo aria-hidden="true" />
				<p>{meta.disclaimer}</p>
			</div>
		{/if}

		<article class="post-body" use:headingAnchors>
			{@render children()}
		</article>
	{/if}

	<!-- Comments stay visible behind a content warning, so readers can join in without reading the post -->
	<div class="post-comments">
		<Giscus />
	</div>
</section>
