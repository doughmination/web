<!-- src/lib/components/Footer.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import '#lib/styles/footer.css';
	import { websiteDomain } from '#lib';
	import IcFavorite from '~icons/ic/outline-favorite';
	import VisitorCounter from '#lib/components/VisitorCounter.svelte';
</script>

<footer>
	<p class="footer-line">
		<span class="footer-brand">
			<img src="/favicon.svg" alt="" width="20" height="20" />
			{websiteDomain}
		</span>

		<span>
			made fully by hand with zero AI-generated code
			<IcFavorite class="beat" />
		</span>

		<span>Clove Twilight &copy; 2026</span>
	</p>

	<VisitorCounter />

	<a class="no-ai" href="/ai" title="Read my AI statement">
		<img src="/no-ai.svg" alt="Developed by a human, not by AI" width="131" height="42" />
	</a>
</footer>
