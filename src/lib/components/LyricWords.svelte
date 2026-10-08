<!-- src/lib/components/LyricWords.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import { wordProgress, type LyricWord } from '#lib/scripts/music.ts';

	// Karaoke-style line: each word fills with the accent colour as it's sung
	let { words, at }: { words: LyricWord[]; at: number } = $props();
</script>

<!-- Kept on one line so no stray whitespace lands between the words -->
{#each words as word, i (i)}<span class="lyric-word" style:--fill="{wordProgress(word, at) * 100}%"
		>{word.text}</span
	>{/each}

<style>
	@property --fill {
		syntax: '<percentage>';
		inherits: false;
		initial-value: 0%;
	}

	.lyric-word {
		background: linear-gradient(
			90deg,
			var(--accent) var(--fill),
			color-mix(in srgb, var(--text) 55%, transparent) var(--fill)
		);
		background-clip: text;
		color: transparent;
		white-space: pre-wrap;
		transition: --fill 0.1s linear;
	}

	@media (prefers-reduced-motion: reduce) {
		.lyric-word {
			transition: none;
		}
	}
</style>
