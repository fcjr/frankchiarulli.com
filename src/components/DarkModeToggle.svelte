<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import { darkmode } from '$lib/stores';

	$: darkmode_value = false;
	$: darkmode.set(darkmode_value);

	var unsubscribe: () => void;
	onMount(() => {
		darkmode.useLocalStorage();

		unsubscribe = darkmode.subscribe((value) => {
			darkmode_value = value;
			darkmode_value
				? window.document.body.classList.add('dark-mode')
				: window.document.body.classList.remove('dark-mode');
		});
	});

	onDestroy(() => {
		unsubscribe && unsubscribe();
	});

	function toggleDarkmode() {
		darkmode_value = !darkmode_value;
	}
</script>

<button
	id="darkmode-toggle"
	tabindex="0"
	aria-label="Dark Mode Toggle"
	aria-pressed={darkmode_value}
	on:click={() => toggleDarkmode()}
>
	<svg
		class:visible={!darkmode_value}
		class="moon"
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg
	>
	<svg
		class:visible={darkmode_value}
		class="sun"
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line
			x1="12"
			y1="21"
			x2="12"
			y2="23"
		/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line
			x1="18.36"
			y1="18.36"
			x2="19.78"
			y2="19.78"
		/><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line
			x1="4.22"
			y1="19.78"
			x2="5.64"
			y2="18.36"
		/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg
	>
</button>

<style>
	#darkmode-toggle {
		display: flex;
		align-items: center;
		cursor: pointer;
		background: none;
		border: none;
	}
	#darkmode-toggle:focus {
		outline: thin dotted;
	}

	svg {
		display: none;
		width: 18px;
		stroke-width: 2;
		stroke: var(--stroke);
	}

	svg:active {
		stroke: var(--highlight);
	}

	.visible {
		display: inline-block;
	}
</style>
