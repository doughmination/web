<!-- src/routes/cv/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang='ts'>
	import '#lib/styles/cv.css';
	import CvEntry from '#lib/components/CvEntry.svelte';
</script>

<section class='hero'>
	<div class='wrap'>
		<h1>CV</h1>
		<p class='subtitle'>All my education and previous jobs are here</p>
	</div>
</section>

<section class='cv'>
	<h1>Education</h1>
	<CvEntry
		title='Solent University'
		cv_sub='BSci Computer Science'
		year='September 2025 - June 2026'
	>
		{#snippet content()}
			<p>
				➼ Web Technologies<br />
				➼ UX <br />
				➼ Data and Analytics <br />
				➼ Networking<br />
				➼ Python Skills
			</p>
		{/snippet}
	</CvEntry>
	<CvEntry
		title='Oxford Brookes University'
		cv_sub='BSci Computer Science'
		year='September 2024 - June 2025'
	>
		{#snippet content()}
			<p>
				➼ Web Technologies<br />
				➼ Python Skills
			</p>
		{/snippet}
	</CvEntry>
	<CvEntry
		title='Oxford University'
		cv_sub='CEMS (Foundation Level)'
		year='September 2023 - June 2024'
	>
		{#snippet content()}
			<p>
				➼ Further CompleX Maths <br />
				➼ Thermodynamics <br />
				➼ MATLAB <br />
				➼ Physics <br />
				➼ Mechanics with Rotational Mechanics <br />
				➼ Optics
			</p>
		{/snippet}
	</CvEntry>
	<CvEntry title='Truro and Penwith College' cv_sub='A-Levels' year='September 2022 - June 2023'>
		{#snippet content()}
			<p>
				➼ Edexcel Maths - Grade A <br />
				➼ Edexcel Physics - Grade B <br />
				➼ OCR A Chemistry - Grade B
			</p>
		{/snippet}
	</CvEntry>
	<h1>Previous Jobs</h1>
	<CvEntry title='Plush Oxford' cv_sub='A-Levels' year='September 2022 - June 2023'>
		{#snippet content()}
			<p>
				➼ Edexcel Maths - Grade A <br />
				➼ Edexcel Physics - Grade B <br />
				➼ OCR A Chemistry - Grade B
			</p>
		{/snippet}
	</CvEntry>
	<CvEntry title='Truro and Penwith College' cv_sub='A-Levels' year='September 2022 - June 2023'>
		{#snippet content()}
			<p>
				➼ Edexcel Maths - Grade A <br />
				➼ Edexcel Physics - Grade B <br />
				➼ OCR A Chemistry - Grade B
			</p>
		{/snippet}
	</CvEntry>
	<CvEntry title='Truro and Penwith College' cv_sub='A-Levels' year='September 2022 - June 2023'>
		{#snippet content()}
			<p>
				➼ Edexcel Maths - Grade A <br />
				➼ Edexcel Physics - Grade B <br />
				➼ OCR A Chemistry - Grade B
			</p>
		{/snippet}
	</CvEntry>
</section>
