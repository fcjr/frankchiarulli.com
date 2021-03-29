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
	import type { Post } from '$lib/posts';
	import highlight from '$lib/higlight';

	import Tags from '$components/Tags.svelte';

	export let post: Post;
</script>

<h1>{post.attributes.title}</h1>
<Tags tags={post.attributes.tags} />

<div use:highlight>
	{@html post.html}
</div>
