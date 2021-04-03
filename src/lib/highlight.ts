import Prism from 'prismjs';

// import additional languages here
import 'prismjs/components/prism-go.js';

// import plugins
// make sure to also include the plugins css in global.css
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/toolbar/prism-toolbar.js';
import 'prismjs/plugins/show-language/prism-show-language.js';

// disable automatic highlighting
Prism.manual = true;

export default function highlight(element: HTMLElement): void {
	element.querySelectorAll('pre code').forEach((block) => {
		block.classList.add('line-numbers');
		Prism.highlightElement(block);
	});
}
