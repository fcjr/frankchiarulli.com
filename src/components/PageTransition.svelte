<script>
	import { fly } from 'svelte/transition';
	export let refresh = '';
</script>

{#key refresh}
	<div in:fly={{ y: -50, duration: 200, delay: 200 }} out:fly={{ y: 50, duration: 190 }}>
		<slot />
	</div>
{/key}
