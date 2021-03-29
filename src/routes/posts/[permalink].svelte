<script lang="ts" context="module">
	import { findPost } from '$lib/posts';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export function load({ page }) {
		const post = findPost(page.params.permalink);
		return { props: { post } };
	}
</script>

<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import type { Post } from '$lib/posts';
	export let post: Post;
</script>

<h1>{post.attributes.title}</h1>
<Tags tags={post.attributes.tags} />

{@html post.html}
