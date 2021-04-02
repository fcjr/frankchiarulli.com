<script lang="ts">
	export let tags: string[];
</script>

<nav>
	{#each tags as tag}
		<a href="/tag/{tag}">#{tag}</a>
	{/each}
</nav>

<style>
	a {
		padding: 0.4em;
	}
</style>
