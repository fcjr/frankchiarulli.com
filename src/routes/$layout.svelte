<script lang="ts">
	import PageTransition from '$components/PageTransition.svelte';
	import Header from '$components/Header.svelte';
	import Footer from '$components/Footer.svelte';
	import { page } from '$app/stores';

	import '../global.scss';
</script>

<Header />
<main class="main">
	<PageTransition refresh={$page.path}>
		<slot />
	</PageTransition>
</main>
<Footer />

<style>
	.main {
		position: relative;
		min-height: calc(100vh - var(--header-height) - var(--footer-height) - (var(--gap) * 2) - 10px);
		max-width: calc(var(--main-width) + var(--gap) * 2);
		padding: var(--gap);
		margin: auto;
	}

	/* These globals set here so they are loaded prior to page load. */
	:global(:root) {
		font-family: var(--standard-font);
	}

	:global(a) {
		font-weight: 500;
		color: var(--paragraph);
	}
	:global(a:visited) {
		color: inherit;
	}
	:global(a:active) {
		color: var(--highlight);
	}

	:global(header),
	:global(h1),
	:global(h2),
	:global(h3),
	:global(h4),
	:global(h5),
	:global(h6),
	:global(code) {
		font-family: var(--code-font);
		-webkit-text-size-adjust: 100%;
		-moz-font-feature-settings: 'kern' 1;
		font-feature-settings: 'kern' 1;
		font-kerning: normal;
	}
</style>
