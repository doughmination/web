<!-- src/routes/languages/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang='ts'>
    import Meta from '#lib/components/Meta.svelte';
    import '#lib/styles/index.css';
    import '#lib/styles/languages.css';

    type Language = {
        name: string;
        body: string;
    };

    type Group = {
        name: string;
        languages: Language[];
    };

    type Slice = {
        name: string;
        bytes: number;
        repos: number;
    };

    // Bytes of code per language across my own (non-fork) GitHub repos, October 2026
    const github: Slice[] = [
        { name: 'TypeScript', bytes: 4518020, repos: 17 },
        { name: 'Python', bytes: 399863, repos: 4 },
        { name: 'CSS', bytes: 217402, repos: 20 },
        { name: 'JavaScript', bytes: 213438, repos: 15 },
        { name: 'Shell', bytes: 154123, repos: 9 },
        { name: 'HTML', bytes: 138082, repos: 13 },
        { name: 'Lua', bytes: 59747, repos: 1 },
        { name: 'Kotlin', bytes: 49133, repos: 2 },
        { name: 'QML', bytes: 27002, repos: 1 },
        { name: 'Svelte', bytes: 13897, repos: 2 },
        { name: 'GLSL', bytes: 12885, repos: 1 },
        { name: 'Dockerfile', bytes: 11632, repos: 7 }
    ];

    // Five colours stay readable side by side; everything else folds into Other
    const shown = 5;
    const total = github.reduce((sum, slice) => sum + slice.bytes, 0);
    const rest = github.slice(shown);

    const slices = [
        ...github.slice(0, shown).map((slice, i) => ({
            ...slice,
            colour: `var(--series-${i + 1})`,
            detail: `${slice.repos} repos`
        })),
        {
            name: 'Other',
            bytes: rest.reduce((sum, slice) => sum + slice.bytes, 0),
            repos: 0,
            colour: 'var(--series-other)',
            detail: rest.map((slice) => slice.name).join(', ')
        }
    ].map((slice) => ({ ...slice, share: (slice.bytes / total) * 100 }));

    const percent = (share: number) => (share < 1 ? '<1%' : `${share.toFixed(1)}%`);

    let active = $state<string | null>(null);

    const groups: Group[] = [
        {
            name: 'Main',
            languages: [
                { name: 'TypeScript', body: 'My go-to for almost everything: websites, servers, tooling and bots.' },
                { name: 'JavaScript', body: 'Where it all started, writing Discord bots nine years ago.' },
                { name: 'Python', body: 'Scripts, automation and backend projects.' }
            ]
        },
        {
            name: 'Web',
            languages: [
                { name: 'Svelte', body: 'What this website is built with.' },
                { name: 'HTML', body: 'The bones of every site I make.' },
                { name: 'CSS', body: 'Endless polishing until it looks just right.' }
            ]
        },
        {
            name: 'Android & Modding',
            languages: [
                { name: 'Kotlin', body: 'Building Android apps.' },
                { name: 'Java', body: 'Where I cut my teeth on game modding.' }
            ]
        },
        {
            name: 'Tooling',
            languages: [
                { name: 'Shell', body: 'Gluing together my Linux setup and servers.' },
                { name: 'Dockerfile', body: 'Packaging up my self-hosted services.' }
            ]
        },
        {
            name: 'Learning',
            languages: [{ name: 'Go', body: 'Currently learning, one project at a time.' }]
        },
        {
            name: 'Disliked',
            languages: [{ name: 'Rust', body: 'I just didn\'t like this lang at all.' }]
        }
    ];
</script>

<Meta
	title='My Languages'
	description='The programming languages Clove Twilight writes in, with a breakdown of code across faer GitHub repos.'
/>

<section class='hero'>
    <div class='wrap'>
        <p class='eyebrow'>Coding</p>
        <h1>My Languages</h1>
        <p class='subtitle'>Everything I write code in</p>
    </div>
</section>

<section class='wrap languages'>
    <h2 class='lang-heading'>Where my code lives</h2>
    <p class='lang-note'>Share of code across my own GitHub repos</p>

    <div class='share' role='list' aria-label='Share of code on GitHub by language'>
        {#each slices as slice (slice.name)}
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <div
                class='share-segment'
                class:dim={active !== null && active !== slice.name}
                role='listitem'
                tabindex='0'
                aria-label={`${slice.name}: ${percent(slice.share)}`}
                style:flex-grow={slice.share}
                style:background={slice.colour}
                onmouseenter={() => (active = slice.name)}
                onmouseleave={() => (active = null)}
                onfocus={() => (active = slice.name)}
                onblur={() => (active = null)}
            >
                {#if active === slice.name}
                    <div class='share-tip' role='tooltip'>
                        <strong>{slice.name}</strong>
                        <span>{percent(slice.share)}</span>
                        <span class='share-tip-detail'>{slice.detail}</span>
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <ul class='share-legend'>
        {#each slices as slice (slice.name)}
            <li class:dim={active !== null && active !== slice.name}>
                <span class='swatch' style:background={slice.colour}></span>
                <span class='share-name'>{slice.name}</span>
                <span class='share-value'>{percent(slice.share)}</span>
            </li>
        {/each}
    </ul>
    <p class='lang-note small'>
        Java and Go don&apos;t show up here: my modding days predate these repos, and Go is still
        new.
    </p>

    {#each groups as group (group.name)}
        <h2 class='lang-heading'>{group.name}</h2>
        <div class='lang-grid'>
            {#each group.languages as language (language.name)}
                <article class='card lang-card'>
                    <h3 class='card-title'>{language.name}</h3>
                    <p class='card-body'>{language.body}</p>
                </article>
            {/each}
        </div>
    {/each}
</section>
