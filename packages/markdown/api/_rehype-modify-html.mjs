import { isElement } from 'hast-util-is-element';
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
export default function rehypeModifyHTML() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (!isElement(node, 'html') || !node.properties) {
				return CONTINUE;
			}

			node.properties.dataColorMode = 'dark';
			node.properties.dataDarkTheme = 'dark';
			return EXIT;
		});
	};
}
