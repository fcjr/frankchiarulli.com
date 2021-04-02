const dateOptions: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
};

export function formatDate(date: Date): string {
	return date.toLocaleString('en', dateOptions);
}
