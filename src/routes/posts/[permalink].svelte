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
	export let post: Post;
</script>

<!-- display the post -->
<h1>{post.attributes.title}</h1>

{@html post.html}
