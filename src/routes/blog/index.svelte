<script lang="ts">
	import { posts } from '$lib/posts';

	import SEO from '$components/SEO.svelte';
	import PostList from '$components/PostList.svelte';
	import CascadeNavigator from '$components/CascadeNavigator.svelte';
</script>

<SEO title="Blog" />
<CascadeNavigator />
<PostList {posts} />
