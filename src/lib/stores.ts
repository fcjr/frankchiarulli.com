import { writable } from 'svelte/store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createWritableStore = (key: string, startValue: any) => {
	const { subscribe, set } = writable(startValue);

	return {
		subscribe,
		set,
		useLocalStorage: () => {
			const json = localStorage.getItem(key);
			if (json) {
				set(JSON.parse(json));
			}

			subscribe((current) => {
				localStorage.setItem(key, JSON.stringify(current));
			});
		}
	};
};

export const darkmode = createWritableStore('darkmode', false);
