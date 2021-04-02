import hljs from 'highlight.js';

export default function highlight(element: HTMLElement): void {
	element.querySelectorAll('pre code').forEach(hljs.highlightAll);
}
