<!-- src/lib/components/Footer.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import noAi from '#lib/assets/no-ai.svg';
	import '#lib/styles/footer.css';
	import { websiteDomain } from '#lib';
</script>

<footer>
	<img src="/favicon.svg" alt="Site Favicon" width="32" height="32" />
	<span>{websiteDomain}</span>
	<span class="subtext"
		>made fully by hand with zero AI-generated code <iconsax-icon
			name="heart"
			type="bulk"
			size="24"
			class="beat"
		></iconsax-icon></span
	>
	<span class="subtext">Clove Twilight &copy; 2026</span>
</footer>

<a class="no-ai" href="/ai" title="Read my AI statement">
	<img src={noAi} alt="Developed by a human, not by AI" width="131" height="42" />
</a>
