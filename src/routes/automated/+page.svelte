<!-- src/routes/automated/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/index.css';
	import '#lib/styles/about.css';
</script>

<Meta
	title="Automation"
	description="How Clove&apos;s PR Bot, is-a-tracker, helps faer moderate pull requests on is-a-dev/register, and why every action still needs a human click."
/>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Clove Twilight</p>
		<h1>Automation</h1>
		<div class="intro">
			<p class="lede">
				Some of the work I do is helped along by tools I&apos;ve built. This page explains what they
				do&comma; and what they don&apos;t.
			</p>
		</div>
	</div>
</section>

<section class="about">
	<h1 class="sec">The PR Bot</h1>
	<p class="text">
		The PR Bot is
		<a href="https://github.com/doughmination/isATracker">is-a-tracker</a>&comma; a personal
		moderation assistant for pull requests on
		<a href="https://github.com/is-a-dev/register">is-a-dev/register</a>.
		<br />
		It watches new and updated pull requests&comma; checks them against a couple of rules&comma; and pings
		me on Discord when one breaks a rule. It never acts on its own. Nothing happens to a pull request
		until I read the alert and press a button.
	</p>

	<h1 class="sec">What It Looks For</h1>
	<p class="text">
		<strong>NS records from a first-time contributor.</strong>
		is-a.dev doesn&apos;t grant nameserver records to people without an accepted registration. If the
		author has no merged pull requests in the repository&comma; and isn&apos;t a maintainer&comma; the
		bot flags it. If I press <em>Close PR</em>&comma; it posts the policy comment and closes the
		pull request.
		<br />
		<strong>A GitHub no-reply <code>owner.email</code>.</strong>
		Addresses ending in <code>@users.noreply.github.com</code> aren&apos;t allowed. The bot only
		reads the <code>owner.email</code> field in the JSON file&comma; never your commit or profile
		emails. If I press <em>Request Changes</em>&comma; it leaves a review with an inline comment on
		that line.
	</p>

	<h1 class="sec">Got a Comment From It?</h1>
	<p class="text">
		The comment came from my account&comma; and I approved it myself. The wording is a
		template&comma; but the decision wasn&apos;t automatic.
		<br />
		If you think it got something wrong&comma; drop me a message and I&apos;ll take a look. For an NS
		record closure&comma; you&apos;re welcome to open a new pull request with other record types&comma;
		such as <code>A</code>&comma; <code>AAAA</code>&comma; <code>CNAME</code>&comma;
		<code>MX</code> or <code>TXT</code>. See the
		<a href="https://docs.is-a.dev/faq/#who-can-use-ns-records">is-a.dev docs</a> for more.
	</p>

	<h1 class="sec">How It Stays Safe</h1>
	<p class="text">
		Before every action&comma; the bot checks the pull request again at its latest commit&comma; so
		a fix pushed after the alert is never punished.
		<br />
		Each alert can only be acted on once&comma; so a double click never posts twice.
		<br />
		Writes to GitHub are never retried automatically&comma; and every attempt is recorded in an audit
		log.
		<br />
		It keeps part of the GitHub rate limit in reserve&comma; so scanning never gets in the way of an action
		I&apos;ve approved.
	</p>
</section>
