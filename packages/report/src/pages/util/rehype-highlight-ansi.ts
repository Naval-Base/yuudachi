// import { createStarryNight, common } from '@wooorm/starry-night';
import Convert from 'ansi-to-html';
import type { Root } from 'hast';
import { hasProperty } from 'hast-util-has-property';
import { isElement } from 'hast-util-is-element';
import { select } from 'hast-util-select';
import { toString } from 'hast-util-to-string';
import { h } from 'hastscript';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';
import { CONTINUE, SKIP, visit } from 'unist-util-visit';

const { parse } = unified().use(rehypeParse, { fragment: true });
const convert = new Convert();
// const { flagToScope, highlight } = await createStarryNight(common);

export default function rehypeHighlightANSI() {
	const prefix = 'language-';

	return (tree: Root) => {
		visit(tree, 'element', (node, index, parent) => {
			if (!parent || index === null || !isElement(node, 'pre')) {
				return CONTINUE;
			}

			const code = select('code', node);
			if (!isElement(code, 'code') || !hasProperty(code, 'className')) {
				return SKIP;
			}

			// @ts-expect-error: We already check with: hasProperty above
			const classes = code.properties.className;
			if (!Array.isArray(classes)) {
				return SKIP;
			}

			const language = classes.find((d) => typeof d === 'string' && d.startsWith(prefix));
			if (typeof language !== 'string') {
				return SKIP;
			}

			const languageWithoutPrefix = language.slice(prefix.length);
			if (languageWithoutPrefix !== 'ansi') {
				return SKIP;
			}

			const output = convert.toHtml(toString(code));
			const fragment = parse(output);
			const children = fragment.children;

			// let scope;
			// /** @type {RootContent[]} */
			// let children = [];
			// if (languageWithoutPrefix === 'ansi') {
			// 	const output = convert.toHtml(toString(code));
			// 	const fragment = parse(output);
			// 	children = fragment.children;
			// } else {
			// 	scope = flagToScope(languageWithoutPrefix);
			// 	if (!scope) {
			// 		return SKIP;
			// 	}

			// 	const fragment = highlight(toString(code), scope);
			// 	children = fragment.children;
			// }

			parent.children.splice(
				index,
				1,
				h(
					'div',
					{
						className: [
							'no-highlight',
							// `${scope ? `highlight-${scope.replace(/^source\./, '').replace(/\./g, '-')}` : ''}`,
						],
					},
					[h('pre', children)],
				),
			);
			return SKIP;
		});
	};
}
