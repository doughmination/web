<!-- src/routes/about/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang='ts'>
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/about.css';
	import { calculateAge } from '#lib/scripts/about.ts';

	let now = $state(new Date());

	const age = $derived(calculateAge(now));

	$effect(() => {
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<Meta
	title='About Me'
	description='Who Clove Twilight is: identity, coding, Linux and self-hosting, gaming and music.'
/>

<section class='hero'>
	<div class='wrap'>
		<h1>About Me</h1>
		<p class='subtitle'>A glance at who I am</p>
	</div>
</section>

<section class='about'>
	<p class='text'>
		Heya,<br />
		I&apos;m Clove Nytrix Doughmination Twilight, a {age.years}-year, {age.months}-month-old
		developer!<br />
		I am a
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<span
			class='poly'
			tabindex='0'
			data-tooltip='A polyamorous relationship is one in which one or more of the participants are involved romantically or sexually with more than one individual at a time. Each person involved in the relationship consents to the situation and is aware of the non-monogamous nature. The concept of polyamory as a queer identity is controversial on the basis of polyamory alone rather than other aspects of identity, such as sexual orientation. Being polyamorous is not specific to LGBTQIA+ people; cisgender and heterosexual people can be polyamorous, and LGBTQIA+ people are not necessarily polyamorous.'
			>Polyamorous</span
		>,
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<span
			class='fae'
			tabindex='0'
			data-tooltip='Genderfae (also called Genderdoe or Genderthil) is a form of genderfluidity that never encompasses being entirely a binary man or masculine genders. A genderfae individual can flow through a range of genders such as being a woman or any non-binary gender, even neutral and unaligned ones. This also includes experiencing xenogenders and genderlessness. This term is a part of the genderfluid fragment system; it is a subterm of genderfaer.'
			>Genderfae</span
		>,
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<span
			class='trans'
			tabindex='0'
			data-tooltip='Transgender, often shortened to trans, is an umbrella term that describes an individual whose gender identity differs from their assigned gender at birth (AGAB). Infants are assigned a sex based on the appearance of their external genitalia, usually only on that basis, and that assignment is recorded on their birth certificate. The birth assignment—generally defaulting to assigned male at birth (AMAB) or assigned female at birth (AFAB)—assumes that the individual's gender identity will correspond to their assigned sex. A person's gender identity—their sense of gender—usually develops when they are very young. The realisation that their gender is different from what they were assigned can occur as early as three years old or in childhood prior to the onset of puberty. It may also happen later in life.'
			>Transgender</span
		> Woman from the UK.
	</p>

	<h1 class='sec'>Coding</h1>
	<p class='text'>
		I&apos;ve been programming for around nine years, starting out writing Discord bots in
		JavaScript. These days I&apos;m a self-proclaimed TypeScript queen, with plenty of Python along
		the way, and I&apos;m currently learning Go. I mostly build things for myself: alternative, more
		accessible tools that I can host and control on my own terms.
	</p>
	<p class='text'>Some of what I&apos;m working on:</p>
	<ul class='projects'>
		<li>
			<span class='project-name'>JPCL</span>
			Just Parsable Configuration Language (formerly JPML), a human-editable config format mixing TOML-style
			sections with JSON-style nesting, with language implementations and CLI tooling on the way
		</li>
		<li>
			<span class='project-name'>Morvane</span>
			An Arch-based operating system that makes installing a runit-based system easier, while being upfront
			about what it&apos;s built on
		</li>
		<li>
			<span class='project-name'>Self-hosted stack</span>
			My own auth server, email service, CDN, personal API and music player
		</li>
		<li>
			<span class='project-name'>This website</span>
			Built with Svelte and TypeScript, and endlessly polished one CSS tweak at a time
		</li>
	</ul>

	<h1 class='sec'>Linux &amp; Self-Hosting</h1>
	<p class='text'>
		I live on Linux, mainly Arch, and I care a lot about privacy and owning my own infrastructure.
		That means running my own servers, Git hosting and services behind Cloudflare rather than
		handing everything to someone else.
	</p>

	<h1 class='sec'>Gaming</h1>
	<p class='text'>
		Genshin Impact is my game of choice. Furina is my favourite character, full stop, though right
		now I&apos;m pouring most of my resources into Sandrone. It spills into my code too: I maintain
		a project for Genshin character assets and models, and tooling that feeds wiki images to one of
		my Discord bots.
	</p>

	<h1 class='sec'>Music</h1>
	<p class='text'>
		I used to create music under the alias Clove Nytrix, but gave it up to focus more on my studies
		and development. I&apos;m still an avid music listener and enjoyer. I listen to various artists,
		including Falling in Reverse, Linkin Park, BBO$ and Hatsune Miku. If you can't get hold of me,
		I&apos;m usually jamming to music!
	</p>
</section>
