<!-- src/routes/blog/arch-btw/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts" module>
	import type { PostMeta } from '#lib/scripts/blog.ts';

	export const metadata: PostMeta = {
		title: 'I Use Arch, BTW (But Artix Is Better)',
		excerpt:
			'Ubuntu, Debian, Fedora, EndeavourOS, NixOS, and finally Arch. Why it stuck, and why I think Artix does it even better.',
		date: '2026-11-05',
		user: 'Clove',
		tags: ['Linux', 'Personal', 'Tooling']
	};
</script>

<script lang="ts">
	import BlogPost from '#lib/components/BlogPost.svelte';
</script>

<BlogPost meta={metadata}>
	<p>
		Fedora bricked my machine. NixOS gave me a migraine. Debian was always out of date. After years
		of hopping between distros, the one that finally stuck was Arch, and the one I actually think is
		best is Artix. Yes, I'm one of <em>those</em> people now. Let me explain how I got here.
	</p>

	<h2>Ubuntu, and Everything Debian</h2>

	<p>
		Like a lot of people, I started on Ubuntu. From there I moved through a whole family of Ubuntu-
		and Debian-based distros: Linux Mint, Zorin OS, Peppermint OS, and Pop!_OS, both before and
		after it moved to COSMIC. For years, that's where I stayed. They were familiar, they worked, and
		I knew my way around them.
	</p>

	<p>
		The problem was that Debian is always outdated. Debian Stable's whole approach is stability
		first: packages get frozen and tested for a long time before a release, and then they mostly
		stay put until the next one. Ubuntu and the distros built on it move a bit faster, but they
		still work in releases rather than keeping everything current. That's great for some people, and
		honestly it's a big part of why so many servers run Debian. But on my own machine, I kept
		finding myself stuck on old versions of the software I actually wanted to use.
	</p>

	<h2>The Ones That Didn't Work Out</h2>

	<p>
		I did try to leave a few times. I wanted to try Arch, so I gave EndeavourOS a go, since it's
		basically Arch with a friendly installer and a desktop set up for you. But on the hardware I had
		at the time it used too much RAM, so I went back.
	</p>

	<p>
		I tried Fedora too, and Fedora bricked my machine. It would just randomly not boot. Sometimes
		the bootloader files would break, sometimes it just wouldn't start, and eventually I got tired
		of dealing with it and gave up. Maybe other people have better luck with it, but that's the
		thing with Fedora for me: it always breaks.
	</p>

	<h2>Arch: The One That Stuck</h2>

	<p>
		In the end, it wasn't any of my own attempts that got me onto Arch. It was my girlfriend, who
		convinced me to give it a proper try. After all those years of trying to get there on my own, it
		took her to get me to actually do it. And this time, it stuck.
	</p>

	<p>
		Arch is a rolling release, which means there are no big version upgrades every couple of years.
		Packages just get updated as new versions come out, so I'm always on the latest software. After
		years of Debian, that felt amazing.
	</p>

	<p>
		Then there's the
		<a href="https://aur.archlinux.org" rel="noopener noreferrer" target="_blank">AUR</a>, the Arch
		User Repository. It's a huge collection of packages maintained by the community, so if something
		isn't in the official repositories, someone has almost certainly packaged it there already.
		Because anyone can upload to it, you should read a package's build script before installing it,
		which fits right in with how I treat Arch in general. I love the AUR. Between that and always
		being up to date, those are the reasons I stayed.
	</p>

	<p>
		Well, mostly stayed. I did wipe Arch once to try NixOS, and I got a migraine. That's not a
		metaphor: I got an actual, literal migraine, and I was back on Arch as soon as it hit. That's
		the whole review.
	</p>

	<p>
		People love to say Arch is unstable. Personally, I think most of that reputation comes from
		people updating without checking what they're actually installing. Read what's changing, keep an
		eye on the
		<a href="https://archlinux.org/news/" rel="noopener noreferrer" target="_blank">Arch news</a>
		for anything that needs a manual step, and you avoid nearly all of the headaches people complain about.
		Things can still break sometimes, but that goes for any distro.
	</p>

	<h2>Artix: Arch, but Better</h2>

	<p>
		So if Arch is so great, why do I think
		<a href="https://artixlinux.org" rel="noopener noreferrer" target="_blank">Artix</a> is better? Artix
		is basically Arch without systemd. You still get pacman, rolling releases and up to date packages,
		but instead of systemd you pick your own init system: OpenRC, runit, s6 or dinit.
	</p>

	<p>
		And I don't like systemd. It's massively bloated. It started as an init system, but these days
		the systemd project includes components for logging, networking, DNS, login sessions, timers and
		a lot more. That's far more than an init system needs to do, and I'd rather my system didn't
		depend on one giant project for all of it. I know plenty of people disagree with me on that, but
		that's my take.
	</p>

	<p>
		My init of choice is runit, because it's just easier. A service is a shell script: you write it,
		and you're away. No faff, as long as you know how to write one. Something like this is all it
		takes:
	</p>

	<pre><code
			>#!/bin/sh
exec 2>&1
cd /srv/my-app || exit 1
exec my-app serve</code
		></pre>

	<p>
		That's the whole service. You can open the run script and see exactly how your app starts,
		without having to learn a separate unit file format. There are no special directives: if you can
		write a shell script, you can write a service. Compare that to systemd unit files, which I find
		a pain in the ass to work with.
	</p>

	<p>
		The rest of runit is just as simple. To turn a service on, you symlink its folder into the
		service directory, and runit starts it. If it crashes, runit restarts it. And to control it,
		there's <code>sv up</code>, <code>sv down</code> and <code>sv restart</code>, and that's about
		all you need.
	</p>

	<h2>Artix Isn't Perfect Either</h2>

	<p>
		To be fair to Arch, Artix does come with trade-offs. It's a much smaller project, so there are
		fewer people around to help when something goes wrong. The Arch Wiki is still amazing, but it
		assumes you're using systemd, so you sometimes have to translate its instructions for your init
		system. And some software expects systemd to be there, so occasionally things take a bit more
		work to get running.
	</p>

	<p>For me, those trade-offs are worth it. But they're real, and they lead nicely into…</p>

	<h2>So Why Is My Server on Arch?</h2>

	<p>
		Here's the plot twist: my server runs Arch, not Artix. That's down to installing it. Arch has
		<code>archinstall</code>, a TUI installer that works perfectly over a terminal, and Artix
		doesn't have one. Artix's installers with a GUI also install a desktop, which a server just
		doesn't need. The alternative is doing the install manually, and I don't know how to do a manual
		Artix install yet. For a server, Arch just makes more sense.
	</p>

	<p>
		I still didn't want to give up runit, though. The AUR has a package called
		<code>runit-systemd</code>, which runs runit alongside systemd instead of replacing it. systemd
		is still the init system, and it starts runit through its own systemd unit. From there, runit
		supervises my own services, like this website. It's not the full Artix experience, but it's the
		bit I care about most.
	</p>

	<h2>So, Which Distro Should You Use?</h2>

	<p>Whichever one has trade-offs you're happy to live with. Roughly:</p>

	<ul>
		<li>
			<strong>Ubuntu or Debian</strong> if you want something stable that you can set up and forget about,
			and you don't mind older packages.
		</li>
		<li>
			<strong>Fedora</strong> if it works on your hardware. It didn't on mine.
		</li>
		<li>
			<strong>NixOS</strong> if you want your whole system defined in config files and you have painkillers
			nearby.
		</li>
		<li>
			<strong>Arch</strong> if you want the latest software, the AUR and full control, and you're willing
			to read what's changing before you update.
		</li>
		<li>
			<strong>Artix</strong> if you want all of that, without systemd.
		</li>
	</ul>

	<p>
		For me, Fedora's breakage, Debian's old packages and NixOS's learning curve weren't worth it.
		Arch gives me the AUR, fresh packages and control, and Artix gives me all of that without
		systemd. If you want something that just works out of the box, Arch probably isn't it, and
		that's fine. But if you're willing to read what's changing before you update, give Arch a try.
		And if you end up hating systemd as much as I do, you know where to find Artix.
	</p>
</BlogPost>
