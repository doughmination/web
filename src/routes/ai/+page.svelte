<!-- src/routes/ai/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/index.css';
	import '#lib/styles/about.css';
	import '#lib/styles/ai.css';
</script>

<Meta
	title="AI Statement"
	description="Clove&apos;s AI statement: what being AI-neutral means for faer code, and why fae is against AI-generated images and video."
/>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Clove Twilight</p>
		<h1>AI Statement</h1>
		<div class="intro">
			<p class="lede">
				So I want to clarify what I mean by the term &apos;AI Neutral&apos;&comma; as a lot of
				people seem to make their own versions of what it means.
			</p>
		</div>
	</div>
</section>

<section class="about">
	<h1 class="sec">AI in Coding</h1>
	<p class="text">
		I do not&comma; and don&apos;t like&comma; creating code with AI&comma; unless absolutely
		necessary. I do&comma; however&comma; use AI as a medium for documentation and to help my
		understanding of what I create.
		<br />
		The AI agents I use are these two:
		<a href="https://chatgpt.com">
			<span class="models" data-tooltip="Models Used: gpt-6-astra"> OpenAI&apos;s Codex </span></a
		>
		for chore-related bash scripts, and
		<a href="https://claude.ai">
			<span class="models" data-tooltip="Models Used: Opus 5.5"> Anthropic&apos;s Claude </span></a
		>
		for general information and documentation.
		<br />
		The other resources I use are official documentation pages&comma;
		<a href="https://stackoverflow.com">Stack Overflow</a>&comma; or speaking with my peers and
		friends who also code.
		<br />
		My code has been accused many times of being AI-generated and fake&comma; but this is because I&apos;m
		self-taught&comma; with no formal teacher. LLMs have been one of the resources I&apos;ve learned from.
	</p>
	<h1 class="sec">Image and Video Generation</h1>
	<p class="text">
		I am wholly against generating images or videos in any form or capacity. A machine is not
		sentient&comma; and cannot capture the emotions that a real person can&comma; and I personally
		feel emotion is the primary basis of art.
	</p>
</section>
