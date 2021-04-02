<script type="ts">
	import { onMount } from 'svelte';
	import type { GalleryImageData } from '$components/GalleryImage.svelte';

	export let gap: number = 10;
	export let maxColumnWidth: number = 250;
	export let images: GalleryImageData[];

	let columns: GalleryImageData[][];
	let galleryWidth = 0;
	let columnCount = 0;
	$: columnCount = Math.floor(galleryWidth / maxColumnWidth) || 1;
	$: columnCount && CreateColumns();
	$: galleryStyle = `grid-template-columns: repeat(${columnCount}, 1fr); --gallery-gap: ${gap}px`;

	onMount(CreateColumns);
	function CreateColumns() {
		columns = [];
		for (let i = 0; i < images.length; i++) {
			const idx = i % columnCount;
			columns[idx] = [...(columns[idx] || []), images[i]];
		}
	}
</script>

{#if columns}
	<div class="gallery" bind:clientWidth={galleryWidth} style={galleryStyle}>
		{#each columns as column}
			<div class="column">
				{#each column as img}
					<!-- TODO lazy load -->
					<figure>
						<img src={img.src} alt={img.title} />
						<figcaption>
							{#if img.title}
								<h1>{img.title}</h1>
							{/if}
							{#if img.date}
								<h2>{img.date}</h2>
							{/if}
							{#if img.desc}
								<p>{img.desc}</p>
							{/if}
						</figcaption>
					</figure>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	.gallery {
		width: 100%;
		display: grid;
		gap: var(--gallery-gap);
	}
	.column {
		display: flex;
		flex-direction: column;
	}
	.column * {
		width: 100%;
		margin-top: var(--gallery-gap);
	}
	.column *:nth-child(1) {
		margin-top: 0;
	}

	figure {
		margin: 0;
	}
	img {
		width: 100%;
		border-radius: 0.5em;
	}
	h1 {
		margin: 0;
		font-size: 1.2em;
	}
	h2 {
		margin: 0;
		font-size: 0.8em;
		font-weight: lighter;
		color: #747474;
	}
	p {
		margin: 0;
		font-size: 0.9em;
	}
</style>
