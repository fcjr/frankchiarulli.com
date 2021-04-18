<script lang="ts" context="module">
	import { posts as allPosts } from '$lib/posts';
	import { chunk } from '$lib/utils';
	const pages = chunk(allPosts, 5);

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export function load({ page }) {
		const index = +page.query.get('page') || 1;
		return {
			props: {
				posts: pages[index - 1],
				hasMore: pages.length > index,
				page: index
			}
		};
	}
</script>

<script lang="ts">
	import type { Post } from '$lib/posts';
	import { page as pageStore } from '$app/stores';

	import SEO from '$components/SEO.svelte';
	import PostList from '$components/PostList.svelte';
	import CascadeNavigator from '$components/CascadeNavigator.svelte';
	import Button from '$components/Button.svelte';

	export let posts: Post[];
	export let hasMore: boolean;
	export let page: number;
</script>

<SEO title="Blog" />
<CascadeNavigator />
{#if posts}
	<PostList {posts} />
	<nav>
		<div class:hidden={page <= 1}>
			<Button
				ariaLabel="Previous Blog Posts"
				href="{$pageStore.path}{page - 1 == 1 ? '' : `?page=${page - 1}`}"
			>
				Previous
			</Button>
		</div>
		<div class:hidden={!hasMore}>
			<Button ariaLabel="More Blog Posts" href="{$pageStore.path}?page={page + 1}">Next</Button>
		</div>
	</nav>
{:else}
	No more posts!
{/if}

<style>
	nav {
		display: flex;
		justify-content: space-between;
	}

	.hidden {
		visibility: hidden;
	}
</style>
