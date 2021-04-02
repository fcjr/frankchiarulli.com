<script lang="ts">
	import { tags } from '$lib/posts';

	import CascadeNavigator from '$components/CascadeNavigator.svelte';
</script>

<CascadeNavigator />
{#each tags as tag}
	<li>
		<a href="/tag/{tag}">
			{tag}
		</a>
	</li>
{/each}

<style>
	li:not(:last-child) {
		margin-bottom: 1em;
	}
</style>
