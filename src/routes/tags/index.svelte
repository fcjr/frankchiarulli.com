<script lang="ts">
	import { tags } from '$lib/posts';

	import SEO from '$components/SEO.svelte';
	import CascadeNavigator from '$components/CascadeNavigator.svelte';
</script>

<SEO title="Tags" />
<CascadeNavigator />
{#each tags as tag}
	<li>
		<a href="/tags/{tag}">
			{tag}
		</a>
	</li>
{/each}

<style>
	li:not(:last-child) {
		margin-bottom: 1em;
	}
</style>
