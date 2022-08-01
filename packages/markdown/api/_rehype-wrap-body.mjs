import { isElement } from 'hast-util-is-element';
import { h } from 'hastscript';
import { unified } from 'unified';
import { CONTINUE, EXIT, visit } from 'unist-util-visit';

/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').RootContent} RootContent
 * @typedef {import('unified').Plugin<[never], Root>} unified
 */

/**
 * @type {unified}
 */
export default function rehypeWrapBody() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (!isElement(node, 'body')) {
				return CONTINUE;
			}

			node.children = [h('div', { className: 'markdown-body' }, node.children)];
			return EXIT;
		});
	};
}
