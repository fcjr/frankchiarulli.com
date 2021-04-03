<script lang="ts" context="module">
	import { findPost } from '$lib/posts';
	import { formatDate } from '$lib/utils';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export function load({ page }) {
		const post = findPost(page.params.permalink);
		return { props: { post } };
	}
</script>

<script lang="ts">
	import type { Post } from '$lib/posts';
	import highlight from '$lib/higlight';

	import Tags from '$components/Tags.svelte';
	import CascadeNavigator from '$components/CascadeNavigator.svelte';

	export let post: Post;
</script>

<CascadeNavigator />
<article class="article" use:highlight>
	<header>
		<h1>{post.attributes.title}</h1>
		<h2>{formatDate(post.date)} · {post.attributes.author}</h2>
	</header>
	{@html post.html}
	<footer>
		<p class="make-an-edit">
			Noticed a mistake?
			<a href="https://github.com/fcjr/frankchiarulli.com/blob/main/src/posts/{post.permalink}.md"
				>Make an edit</a
			>
			or
			<a
				href="https://github.com/fcjr/frankchiarulli.com/issues/new?title={encodeURIComponent(
					`[Blog Correction]: ${post.permalink}`
				)}">Open an issue</a
			>
		</p>
		<Tags tags={post.attributes.tags} />
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
		line-height: 1.35;
	}

	.article :global(code) {
		padding: 20px;
		border-radius: var(--radius);
	}
</style>
