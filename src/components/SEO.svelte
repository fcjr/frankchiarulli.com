<script lang="ts" context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export function load({ page }) {
		const { permalink } = page.params;
		return { props: { permalink } };
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import siteInfo from '../siteInfo';
	const { siteName, siteUrl, desc: defaultDesc } = siteInfo;

	export let title: string;
	export let desc: '';
	export let canonical = '';
	export let noindex = false;
</script>

<svelte:head>
	<title>{siteName} | {title}</title>
	<link rel="canonical" href={canonical ? siteUrl + canonical : siteUrl + ($page?.path ?? '')} />
	<meta name="description" content={desc || defaultDesc} />

	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>
