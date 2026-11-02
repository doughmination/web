<!-- src/routes/blog/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import IcWarningAmber from '~icons/ic/outline-warning-amber';
	import { fmtPostDate } from '#lib/scripts/blog.ts';
	import '#lib/styles/blog.css';

	let { data } = $props();
</script>

<Meta title="Blog" description="Posts by Clove Twilight about life, identity, code and more." />

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Writing</p>
		<h1>Blog</h1>
		<p class="subtitle">Things I've written, newest first</p>
	</div>
</section>

<section class="wrap">
	{#if data.posts.length}
		<ul class="post-list">
			{#each data.posts as post (post.slug)}
				<li>
					<a class="post-card" href="/blog/{post.slug}">
						<span class="post-card-title">{post.title}</span>
						<span class="post-meta">
							<time datetime={post.date}>{fmtPostDate(post.date)}</time>
							<span aria-hidden="true">·</span>
							<span>{post.user}</span>
						</span>
						<span class="post-card-excerpt">{post.excerpt}</span>
						<span class="post-tags">
							{#if post.warning}
								<span class="chip chip-warning"
									><IcWarningAmber aria-hidden="true" />Content warning</span
								>
							{/if}
							{#each post.tags as tag (tag)}
								<span class="chip">{tag}</span>
							{/each}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="subtitle">No posts yet.</p>
	{/if}
</section>
