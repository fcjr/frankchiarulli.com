<script lang="ts">
    import { posts } from '$lib/posts';
</script>

<main>
{#each posts as post}
<a href={`/posts/${post.permalink}`}>
    <h2>{post.attributes.title}</h2>
    <p>{post.attributes.description}</p>
</a>
{/each}
</main>

<style>
</style>