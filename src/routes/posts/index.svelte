<script lang="ts">
	import PostList from '$lib/PostList.svelte';
	import { posts } from '$lib/posts';
</script>

<PostList {posts} />
