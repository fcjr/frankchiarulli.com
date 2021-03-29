<script lang="ts">
	export let tags: Array<string>;
</script>

<nav>
	{#each tags as tag}
		<a href="/tag/{tag}">#{tag}</a>
	{/each}
</nav>

<style>
	a {
		padding: 0.1em;
	}
</style>
