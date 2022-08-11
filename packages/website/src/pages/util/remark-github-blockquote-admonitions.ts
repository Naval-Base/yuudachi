import type { Root } from 'mdast';
import { CONTINUE, SKIP, visit } from 'unist-util-visit';

export default function remarkGithubBlockquoteAdmonitions() {
	return (tree: Root) => {
		visit(tree, (node) => {
			if (node.type !== 'blockquote') {
				return CONTINUE;
			}

			const blockquote = node;
			if (blockquote.children.length <= 0 || blockquote.children[0]?.type !== 'paragraph') {
				return SKIP;
			}

			const paragraph = blockquote.children[0];
			if (paragraph.children.length <= 0 || paragraph.children[0]?.type !== 'strong') {
				return SKIP;
			}

			const strong = paragraph.children[0];
			if (strong.children.length !== 1 || strong.children[0]?.type !== 'text') {
				return SKIP;
			}

			const text = strong.children[0];
			if (!['Note', 'Warning'].includes(text.value)) {
				return SKIP;
			}

			blockquote.data = {
				...blockquote.data,
				hProperties: { className: 'admonition' },
			};

			strong.data = {
				...strong.data,
				hProperties: { className: text.value === 'Note' ? 'accent' : 'attention' },
			};

			return SKIP;
		});
	};
}
