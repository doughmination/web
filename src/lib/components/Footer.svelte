<!-- src/lib/components/Footer.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import noAi from '#lib/assets/no-ai.svg';
	import '#lib/styles/footer.css';
	import { websiteDomain } from '#lib';
</script>

<footer>
	<p class="footer-line">
		<span class="footer-brand">
			<img src="/favicon.svg" alt="" width="20" height="20" />
			{websiteDomain}
		</span>

		<span>
			made fully by hand with zero AI-generated code
			<iconsax-icon name="heart" type="bulk" size="16" class="beat"></iconsax-icon>
		</span>

		<span>Clove Twilight &copy; 2026</span>
	</p>

	<a class="no-ai" href="/ai" title="Read my AI statement">
		<img src={noAi} alt="Developed by a human, not by AI" width="131" height="42" />
	</a>
</footer>
