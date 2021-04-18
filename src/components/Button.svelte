<script lang="ts">
	export let href: string;
	export let ariaLabel: string;
</script>

<a class="button" {href} aria-label={ariaLabel}>
	<slot />
</a>

<style>
	.button {
		background: var(--secondary);
		border-radius: var(--radius);
		color: var(--paragraph);
		text-decoration: none;
		padding: 8px;
	}

	.button:active,
	.button:hover {
		background: var(--highlight);
	}
</style>
