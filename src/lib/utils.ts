const dateOptions: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
};

export function formatDate(date: Date): string {

	// javascript dates are a bit weird and inconsistent, normalize to utc
	// so that the formatted date matches the frontmatter date.
	// TODO is a better way to do this?
	const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

	return utc.toLocaleString('en', dateOptions);
}
