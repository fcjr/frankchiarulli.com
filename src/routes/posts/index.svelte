<script lang="ts">
	import { posts } from '$lib/posts';

	import PostList from '$components/PostList.svelte';
</script>

<PostList {posts} />
