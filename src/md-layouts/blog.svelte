<script>
	import { formatDate } from '$lib/utils';
	import highlight from '$lib/highlight';
	import { page } from '$app/stores';

	import SEO from '$components/SEO.svelte';
	import Tags from '$components/Tags.svelte';
	import CascadeNavigator from '$components/CascadeNavigator.svelte';

	const permalink =
		$page?.path
			?.split('/')
			.filter((part) => part !== '')
			.pop() ?? '';

	export let title;
	export let author;
	export let date;
	export let description;
	export let tags;
</script>

<SEO {title} desc={description} />
<CascadeNavigator />
<article class="article" use:highlight>
	<header>
		<h1>{title}</h1>
		<h2>{formatDate(new Date(date))} · {author}</h2>
	</header>
	<slot />
	<footer>
		{#if permalink}
			<p class="make-an-edit">
				Noticed a mistake?
				<a
					href="https://github.com/fcjr/frankchiarulli.com/blob/main/src/routes/blog/{permalink}.md"
					>Make an edit</a
				>
				or
				<a
					href="https://github.com/fcjr/frankchiarulli.com/issues/new?title={encodeURIComponent(
						`[Blog Correction]: ${permalink}`
					)}">Open an issue</a
				>
			</p>
		{/if}
		<Tags {tags} />
	</footer>
</article>

<style>
	h1 {
		font-weight: 700;
		font-size: 32px;
		margin-bottom: 24px;
	}

	h2,
	footer {
		margin-left: 20px;
	}

	.make-an-edit {
		font-size: 12px;
		font-style: italic;
	}

	/* Markdown CSS
		Must be globally scoped below the article class
		to get applied.
	*/
	.article :global(p) {
		margin: 1rem auto;
		text-align: left;
		line-height: 1.5;
	}

	.article :global(pre[class*='language-']),
	.article :global(code[class*='language-']) {
		padding-top: 2px;
		font-size: 14px;
		font-family: var(--code-font);
		text-shadow: none;
		border-radius: var(--radius);
		white-space: pre-wrap;
	}
</style>
