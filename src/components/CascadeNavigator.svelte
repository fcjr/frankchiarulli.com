<script lang="ts">
	import { onMount } from 'svelte';

	type Link = {
		name: string;
		link: string;
	};

	var links: Link[] = [];
	onMount(() => {
		const pathname = window.location.pathname;
		const trimmed =  pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
		trimmed.split('/').forEach((name, i, arr) => {
			const link: Link = {
				name: name || 'home',
				link: `/${arr.slice(1, i + 1).join('/')}`
			};
			links = [...links, link];
		});
	});
</script>

<nav>
	{#if links}
		{#each links as link}
			<a href={link.link}>{link.name}</a>
		{/each}
	{/if}
</nav>

<style>
	nav {
		margin-bottom: 20px;
		font-family: var(--code-font);
	}

	nav a,
	nav a:visited {
		text-decoration: none;
	}

	nav a:not(:last-child):after {
		content: '»';
		margin: 5px;
		color: var(--paragraph);
	}
</style>
