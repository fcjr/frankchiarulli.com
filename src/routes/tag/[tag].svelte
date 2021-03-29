<script lang="ts" context="module">
	import { findPostsByTag } from '$lib/posts';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export function load({ page }) {
		const { tag } = page.params;
		const posts = findPostsByTag(tag);
		return { props: { posts } };
	}
</script>

<script lang="ts">
	import type { Post } from '$lib/posts';

	import PostList from '$components/PostList.svelte';

	export let posts: Array<Post>;
</script>

<PostList {posts} />
