<script lang="ts" context="module">
	import { findPostsByTag } from '$lib/posts';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export function load({ page }) {
		const { tag } = page.params;
		const posts = findPostsByTag(tag);
		return { props: { tag, posts } };
	}
</script>

<script lang="ts">
	import type { Post } from '$lib/posts';

	import SEO from '$components/SEO.svelte';
	import PostList from '$components/PostList.svelte';
	import CascadeNavigator from '$components/CascadeNavigator.svelte';

	export let tag: string;
	export let posts: Post[];
</script>

<SEO title={`Tag: ${tag}`} />
<CascadeNavigator />
<PostList {posts} />

<style>
	h1 {
		font-size: 18px;
		margin-bottom: var(--gap);
	}
</style>
