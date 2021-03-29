<script lang="ts">
	import type { Post } from '$lib/posts';
	export let posts: Array<Post>;
</script>

{#each posts as post}
	<a href={`/posts/${post.permalink}`}>
		<h2>{post.attributes.title}</h2>
		<p>{post.attributes.description}</p>
	</a>
{/each}
