<!-- src/routes/specs/+page.svelte
     DASL-1.2 — (c) Clove Twilight
-->

<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import '#lib/styles/specs.css';

	type Part = { label: string; href: string };
	type Row = { term: string; parts: Part[]; separator?: string };

	const SPECS: Row[] = [
		{
			term: 'CPU',
			parts: [
				{
					label: 'AMD Ryzen 9 9950X3D 4.3 GHz 16-Core Processor',
					href: 'https://uk.pcpartpicker.com/product/Pk62FT/amd-ryzen-9-9950x3d-43-ghz-16-core-processor-100-100000719wof'
				}
			]
		},
		{
			term: 'GPU',
			parts: [
				{
					label: 'XFX Speedster MERC 310 Black Edition Radeon RX 7900 XTX 24 GB',
					href: 'https://uk.pcpartpicker.com/product/GtXJ7P/xfx-speedster-merc-310-black-edition-radeon-rx-7900-xtx-24-gb-video-card-rx-79xmercb9'
				}
			]
		},
		{
			term: 'RAM',
			parts: [
				{
					label: 'Corsair Vengeance 64 GB (2 x 32 GB) DDR5-6000 CL40',
					href: 'https://uk.pcpartpicker.com/product/LWVmP6/corsair-vengeance-64-gb-2-x-32-gb-ddr5-6000-cl40-memory-cmk64gx5m2b6000z40'
				}
			]
		},
		{
			term: 'Storage',
			separator: '+',
			parts: [
				{
					label: '2x 1TB NVMe',
					href: 'https://uk.pcpartpicker.com/product/YPKscf/acer-predator-gm7-1-tb-m2-2280-pcie-40-x4-nvme-solid-state-drive-bl9bwwr118'
				},
				{
					label: '10TB HDD',
					href: 'https://uk.pcpartpicker.com/product/fmfhP6/seagate-exos-x14-12-tb-35-7200-rpm-internal-hard-drive-st12000nm0008'
				}
			]
		},
		{
			term: 'Motherboard',
			parts: [
				{
					label: 'Gigabyte B850M AORUS ELITE WIFI6E ICE Micro ATX AM5',
					href: 'https://uk.pcpartpicker.com/product/Q8KnTW/gigabyte-b850m-aorus-elite-wifi6e-ice-micro-atx-am5-motherboard-b850m-aorus-elite-wifi6e-ice'
				}
			]
		},
		{
			term: 'Cooling',
			parts: [
				{
					label: 'Thermalright Aqua Elite V3 360 Liquid CPU Cooler',
					href: 'https://uk.pcpartpicker.com/product/YXFmP6/thermalright-aqua-elite-v3-6617-cfm-liquid-cpu-cooler-aqua-elite-360-white-v3'
				}
			]
		},
		{
			term: 'Keyboard',
			parts: [
				{
					label: 'Akko Sakura Miku 5108B Plus',
					href: 'https://en.akkogear.com/product/sakura-miku-5108b-plus-mechanical-keyboard/'
				}
			]
		},
		{
			term: 'Mouse',
			parts: [
				{
					label: 'Logitech G502 X Plus Lightspeed Wireless',
					href: 'https://www.logitechg.com/en-gb/shop/p/g502-x-plus-wireless-lightforce.910-006163'
				}
			]
		},
		{
			term: 'Monitor',
			parts: [
				{
					label: 'Gigabyte G34WQCP 34" 3440 x 1440 180 Hz Curved',
					href: 'https://uk.pcpartpicker.com/product/XpVfrH/gigabyte-g34wqcp-340-3440-x-1440-180-hz-curved-monitor-g34wqcp'
				}
			]
		},
		{
			term: 'Headphones',
			parts: [
				{
					label: 'Yowu Cat Ear Headphones Hatsune Miku NX',
					href: 'https://m.yowu.com/product/detail?sku=3588'
				}
			]
		},
		{
			term: 'Microphone',
			parts: [{ label: 'Aokeo AK-60 USB Microphone', href: 'https://amzn.eu/d/00FjYEzR' }]
		},
		{
			term: 'OS',
			separator: '|',
			parts: [
				{ label: 'Arch Linux', href: 'https://archlinux.org/download/' },
				{
					label: 'Windows 11',
					href: 'https://www.microsoft.com/en-us/software-download/windows11'
				}
			]
		}
	];
</script>

<Meta
	title="Specs"
	description="The PC and peripherals Clove daily-drives: Ryzen 9 9950X3D, RX 7900 XTX, 64 GB DDR5 and more."
/>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Hardware</p>
		<h1>Specs</h1>
		<p class="subtitle">This is the beast setup I daily-drive</p>
	</div>
</section>

<section class="wrap">
	<dl class="specs">
		{#each SPECS as row (row.term)}
			<div class="spec-row">
				<dt>{row.term}</dt>
				<dd>
					{#each row.parts as part, i (part.href)}
						{#if i > 0}<span class="spec-sep" aria-hidden="true">{row.separator}</span>{/if}
						<a href={part.href} target="_blank" rel="noopener noreferrer">{part.label}</a>
					{/each}
				</dd>
			</div>
		{/each}
	</dl>
</section>
