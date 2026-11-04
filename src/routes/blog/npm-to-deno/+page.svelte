<!-- src/routes/blog/npm-to-deno/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts" module>
	import type { PostMeta } from '#lib/scripts/blog.ts';

	export const metadata: PostMeta = {
		title: 'From npm to Deno: My Package Manager Journey',
		excerpt:
			"How I went from npm, to pnpm, to Bun, and finally landed on Deno, and what each one taught me along the way.",
		date: '2026-11-04',
		user: 'Clove',
		tags: ['Code', 'JavaScript', 'Tooling'],
	};
</script>

<script lang="ts">
	import BlogPost from '#lib/components/BlogPost.svelte';
</script>

<BlogPost meta={metadata}>
	<p>
		If you've spent any time writing JavaScript, you've almost certainly had opinions about package
		managers forced upon you. They're one of those tools you don't think about until they get in
		your way, and then suddenly they're all you can think about. Over the past few years I've moved
		through four of them: npm, pnpm, Bun, and now Deno. This site was actually just moved over to
		Deno, so it felt like a good time to write down how I got here.
	</p>

	<h2>npm: Where Everyone Starts</h2>

	<p>
		npm was my first, like it is for most people. It comes bundled with Node.js, so there's no
		decision to make: you install Node, you type <code>npm install</code>, and things happen. For a
		long time, that was all I needed. It's the default for a reason. Every tutorial uses it, every
		README assumes it, and it just works.
	</p>

	<p>
		The cracks started showing as my projects grew, and the biggest one was speed. Installs were
		<em>slow</em>, especially on a fresh clone, and I spent far too much time staring at a progress
		bar waiting to actually start working. Once you notice that wait, you can't stop noticing it.
	</p>

	<h2>pnpm: The Sensible Upgrade</h2>

	<p>
		pnpm was the first time I realised a package manager could be meaningfully <em>better</em>,
		rather than just different. I switched because I wanted faster installs, and it delivered.
		Instead of copying every package into every project, pnpm keeps a single global store on your
		machine and links packages into each project from there. Anything you've installed before is
		already sitting there, ready to go, so installs went from a coffee break to a few seconds. As
		a bonus, I wasn't wasting gigabytes of disk space on a dozen copies of the same packages.
	</p>

	<p>
		What I came to appreciate even more was how strict it is. pnpm only lets your code access the
		packages you've actually declared, so if you accidentally import something you never added,
		you find out straight away instead of months later when it breaks. Its workspace support was also excellent for
		anything with multiple packages in one repository. It's a genuinely great tool, and if you're
		still on npm, it's the easiest switch you can make.
	</p>

	<h2>Bun: Everything, All at Once</h2>

	<p>
		If npm to pnpm was "I need speed", then pnpm to Bun was "I NEED <em>MORE</em> SPEED". When Bun
		came along promising even more of it, I had to try it. And it was <em>fast</em>. Not "a bit quicker" fast, but "did it actually do anything?" fast.
		Installs that pnpm had already made quick finished almost instantly, and scripts started
		running before I'd even taken my finger off the enter key. That speed is what pulled me over,
		but once I was there I found it had a lot more going for it. Bun isn't just a package manager, it's a whole runtime, with a bundler,
		a test runner, and native TypeScript support all built in. Suddenly a lot of the separate
		tools I'd been gluing together could just be... Bun.
	</p>

	<p>
		I used Bun happily for a good while. It made me realise how much of my setup had been held
		together with configuration files and extra dependencies that didn't really need to exist.
		Running a TypeScript file directly without a build step felt like how things should have
		always worked.
	</p>

	<p>
		Then, in 2026, Bun was rewritten from Zig into Rust, with Claude doing most of the work. Over
		a million lines of code were ported in a matter of days, by dozens of AI instances working in
		parallel, and as far as I can tell, with little to no human review. The Bun team point to the
		test suite passing, and there were real improvements, like bug fixes and a smaller binary. But
		for me, that's not enough. A tool that sits at the core of my projects and runs code on my
		machine should be something people have actually read and understood, not something an AI has
		produced and other AIs have checked. I don't support shipping software that way, so I decided
		it was time to move on.
	</p>

	<h2>Deno: Where I've Landed</h2>

	<p>
		Deno is where I am now. When I left Bun, the obvious move might have been to go back to pnpm,
		but pnpm is in the middle of its own full rewrite into Rust, codenamed pacquet. When I went and
		looked through the pnpm repository myself, there had been 18 pull requests merged in the span
		of about seven hours, and a large share of them were co-authored by Claude. Some of those
		were basic changes, but it shows how much of the work is being handed to AI, and how quickly
		it's being merged. After what happened with Bun, I'm not keen to sit through another
		ground-up rewrite built that way and hope for the best. Deno, on the other hand, had its big rewrite (from Go to Rust) back in 2018, well before
		any of this. Deno does allow AI-assisted contributions, but its
		<a href="https://github.com/denoland/deno" rel="noopener noreferrer" target="_blank"
			>contributing guidelines</a
		>
		say you have to disclose any AI use in your pull request. PRs get rejected if there's suspicion
		of undisclosed AI usage, and accounts that spam low-effort, AI-generated issues or PRs can be
		banned. Every contribution still comes from a person who has put their name to it and been
		upfront about how it was made. That's the line I care about: AI as a tool a human uses, not a
		replacement for the human.
	</p>

	<p>
		It also meant I didn't have to lose everything I liked about Bun. Like Bun, it's a full runtime with TypeScript support out of the box. It also
		ships with a formatter, a linter, a test runner, and more, so a project needs very little
		extra tooling to get going.
	</p>

	<p>
		What really sets it apart for me is its approach to security. Deno doesn't let code touch your
		file system, network, or environment unless you explicitly allow it. In a world where malicious
		packages sneaking into the npm registry is a regular news story, that peace of mind is worth a
		lot. It's also built around web standards, so things like <code>fetch</code> just work the way
		they do in the browser.
	</p>

	<p>
		The thing that used to hold Deno back was compatibility with the wider npm ecosystem, but that's
		largely a solved problem now. Deno understands <code>package.json</code>, can pull in packages
		with <code>npm:</code> specifiers, and runs frameworks like SvelteKit (which this site is built
		with) without any fuss. There's also JSR, Deno's own registry, which is built with TypeScript
		in mind from the start.
	</p>

	<h2>So, Which One Should You Use?</h2>

	<p>Honestly, any of them. Each one is a good choice for different reasons:</p>

	<ul>
		<li>
			<strong>npm</strong> if you want the default that everything supports and you don't want to think
			about it.
		</li>
		<li>
			<strong>pnpm</strong> if you want faster installs, less wasted disk space, and stricter dependency
			handling, while staying firmly on Node, and you're comfortable with how much of it is now being written with AI.
		</li>
		<li>
			<strong>Bun</strong> if you want raw speed and an all-in-one toolkit, and you're comfortable with
			how its current codebase was made.
		</li>
		<li>
			<strong>Deno</strong> if you want an all-in-one toolkit that's also secure by default and built
			around web standards.
		</li>
	</ul>

	<p>
		Most of my switches weren't because the previous tool was bad, but because the next one solved
		a problem I'd started to notice. Leaving Bun, and not going back to pnpm, was different: that came down to my values. That's probably the best way to approach it: use what works for
		you, and change when something starts getting in your way. For now, Deno is what works for me. Maybe one day I'll make my own, zero AI, zero bullshit, fast as hell package manager
		or ecosystem for node, but until then, I'm sticking with Deno.
	</p>
</BlogPost>
