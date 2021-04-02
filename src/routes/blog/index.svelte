<script lang="ts">
	import { posts } from '$lib/posts';

	import PostList from '$components/PostList.svelte';
	import CascadeNavigator from '$components/CascadeNavigator.svelte';
</script>

<CascadeNavigator />
<PostList {posts} />
