<script lang="ts">
	export let tags: Array<string>
</script>

<nav>
	{#each tags as tag}
	  <a href="/tag/{tag}">#{tag}</a>
	{/each}
</nav>

<style>
	a {
		padding: .1em;
	}
</style>
