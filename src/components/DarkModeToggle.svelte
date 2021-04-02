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

	function onClickCheckbox(e: MouseEvent) {
		darkmode_value = !darkmode_value;
	}
</script>

<div class="checkbox" on:click={onClickCheckbox}>
	<input
		class="visually-hidden"
		tabindex="0"
		bind:checked={darkmode_value}
		id="darkmode-toggle"
		type="checkbox"
	/>
	<label class="visually-hidden" for="darkmode-toggle"
		>{`Dark Mode Toggle: ${darkmode_value ? 'enabled' : 'disabled'}`}</label
	>
	<svg
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
</div>

<style>
	.checkbox {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	svg {
		display: none;
		width: 18px;
		stroke-width: 2;
	}

	svg:active {
		stroke: var(--highlight);
	}

	input[type='checkbox']:checked ~ .sun,
	input[type='checkbox']:not(:checked) ~ .moon {
		display: inline-block;
	}

	input[type='checkbox']:focus ~ svg {
		outline: thin dotted;
	}

	input[type='checkbox']:active ~ svg {
		color: var(--highlight);
	}

	.visually-hidden {
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		height: 1px;
		overflow: hidden;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}
</style>
